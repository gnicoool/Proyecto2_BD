from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, IntegrityError
from sqlalchemy.orm import Session

from auth_deps import require_rol
from orm.database import get_session
from orm.models import Producto, Proveedor, ProductoProveedor
from schemas.producto import ProductoCreate, ProductoDelete, ProductoGet, ProductoUpdate

router = APIRouter(prefix="/productos", tags=["Productos"])

_ROLES_GESTION = ("Admin", "Supervisor")


def _to_get(p: Producto) -> ProductoGet:
    return ProductoGet(
        id_producto=p.id_producto,
        nombre=p.nombre,
        descripcion=p.descripcion,
        precio_venta=p.precio_venta,
        precio_compra=p.precio_compra,
        cant_disponible=p.cant_disponible,
        id_categoria=p.id_categoria,
        activo=p.activo,
        id_marca=p.id_marca,
    )


@router.get("/", response_model=list[ProductoGet])
def get_productos(db: Session = Depends(get_session)):
    stmt = text("""
        SELECT
            pr.id_producto, pr.nombre, pr.descripcion,
            pr.precio_venta, pr.precio_compra, pr.cant_disponible,
            pr.id_categoria, pr.activo, pr.id_marca,
            cat.nombre AS categoria_nombre,
            COALESCE(lp_compra.proveedor_nombre, lp_link.proveedor_nombre) AS proveedor_nombre
        FROM Producto pr
        INNER JOIN Categoria cat ON cat.id_categoria = pr.id_categoria
        LEFT JOIN LATERAL (
            SELECT p.nombre AS proveedor_nombre
            FROM Compra_Producto cp
            INNER JOIN Compra c ON c.id_compra = cp.id_compra
            INNER JOIN Proveedor p ON p.nit_proveedor = c.nit_proveedor
            WHERE cp.id_producto = pr.id_producto
            ORDER BY c.fecha DESC NULLS LAST, c.id_compra DESC
            LIMIT 1
        ) lp_compra ON true
        LEFT JOIN LATERAL (
            SELECT p.nombre AS proveedor_nombre
            FROM Producto_Proveedor ppx
            INNER JOIN Proveedor p ON p.nit_proveedor = ppx.nit_proveedor
            WHERE ppx.id_producto = pr.id_producto
            ORDER BY ppx.nit_proveedor
            LIMIT 1
        ) lp_link ON true
        ORDER BY pr.id_producto
    """)
    return [dict(row) for row in db.execute(stmt).mappings().all()]


@router.get("/categoria/{id_categoria}", response_model=list[ProductoGet])
def get_productos_by_categoria(id_categoria: int, db: Session = Depends(get_session)):
    return [_to_get(p) for p in
            db.query(Producto).filter(Producto.id_categoria == id_categoria).order_by(Producto.id_producto).all()]


@router.get("/marca/{id_marca}", response_model=list[ProductoGet])
def get_productos_by_marca(id_marca: int, db: Session = Depends(get_session)):
    return [_to_get(p) for p in
            db.query(Producto).filter(Producto.id_marca == id_marca).order_by(Producto.id_producto).all()]


@router.post("/", response_model=ProductoGet, status_code=201)
def create_producto(
    data: ProductoCreate,
    _: dict = Depends(require_rol("Admin", "Bodeguero")),
    db: Session = Depends(get_session),
):
    nit = (data.nit_proveedor or "").strip() or None
    if nit:
        prov = db.query(Proveedor).filter(Proveedor.nit_proveedor == nit).first()
        if not prov:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        if not prov.activo:
            raise HTTPException(status_code=400, detail="Proveedor inactivo")

    producto = Producto(
        nombre=data.nombre,
        descripcion=data.descripcion,
        precio_venta=data.precio_venta,
        precio_compra=data.precio_compra,
        cant_disponible=data.cant_disponible,
        id_categoria=data.id_categoria,
        id_marca=data.id_marca,
    )
    db.add(producto)
    db.flush()
    if nit:
        db.merge(ProductoProveedor(id_producto=producto.id_producto, nit_proveedor=nit))
    db.commit()
    db.refresh(producto)
    return _to_get(producto)


@router.patch("/{id_producto}/toggle", response_model=ProductoGet)
def toggle_producto(
    id_producto: int,
    activo: bool,
    _: dict = Depends(require_rol(*_ROLES_GESTION)),
    db: Session = Depends(get_session),
):
    #Uso del procedure para cambio de estado del producto
    try:
        db.execute(
            text("CALL sp_toggle_producto(:id, :activo)"),
            {"id": id_producto, "activo": activo},
        )
        db.commit()
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    return _to_get(producto)


@router.patch("/{id_producto}", response_model=ProductoGet)
def update_producto(
    id_producto: int,
    data: ProductoUpdate,
    _: dict = Depends(require_rol(*_ROLES_GESTION)),
    db: Session = Depends(get_session),
):
    #Uso del procedure editar producto
    if not db.query(Producto).filter(Producto.id_producto == id_producto).first():
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    try:
        db.execute(
            text("""
                CALL sp_editar_producto(
                    :id_prod, :nombre, :descripcion,
                    :precio_venta, :precio_compra, :cant_disp,
                    :id_categoria, :id_marca
                )
            """),
            {
                "id_prod": id_producto,
                "nombre": data.nombre,
                "descripcion": data.descripcion,
                "precio_venta": float(data.precio_venta) if data.precio_venta is not None else None,
                "precio_compra": float(data.precio_compra) if data.precio_compra is not None else None,
                "cant_disp": data.cant_disponible,
                "id_categoria": data.id_categoria,
                "id_marca": data.id_marca,
            },
        )
        db.commit()
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))
    return _to_get(db.query(Producto).filter(Producto.id_producto == id_producto).first())


@router.delete("/{id_producto}", response_model=ProductoDelete)
def delete_producto(
    id_producto: int,
    permanent: bool = Query(False),
    _: dict = Depends(require_rol("Admin")),
    db: Session = Depends(get_session),
):
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if permanent:
        try:
            db.delete(producto)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="No se puede eliminar: aparece en compras o ventas")
        return ProductoDelete(accion="eliminado", id_producto=id_producto, activo=None)

    producto.activo = False
    db.commit()
    return ProductoDelete(accion="desactivado", id_producto=id_producto, activo=False)
