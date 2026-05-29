import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import Session, joinedload

from orm.database import get_session
from orm.models import Compra, CompraProducto, Producto, Proveedor
from schemas.compra import (
    CompraCabeceraListaOut,
    CompraCreate,
    CompraDetalleOut,
    CompraGet,
    CompraLineaOut,
)
from schemas.producto import ProductoGet

router = APIRouter(prefix="/compras", tags=["Compras"])


@router.get("/", response_model=list[CompraCabeceraListaOut])
def list_compras(db: Session = Depends(get_session)):
    compras = (
        db.query(Compra)
        .options(joinedload(Compra.proveedor))
        .order_by(Compra.id_compra.desc())
        .all()
    )
    return [
        CompraCabeceraListaOut(
            id_compra=c.id_compra,
            fecha=c.fecha,
            total=c.total,
            nit_proveedor=c.nit_proveedor,
            proveedor_nombre=c.proveedor.nombre,
        )
        for c in compras
    ]


@router.get("/productos-por-proveedor/{nit_proveedor}", response_model=list[ProductoGet])
def productos_por_proveedor(nit_proveedor: str, db: Session = Depends(get_session)):
    nit = nit_proveedor.strip()
    prov = db.query(Proveedor).filter(Proveedor.nit_proveedor == nit).first()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    stmt = text("""
        SELECT DISTINCT pr.id_producto, pr.nombre, pr.descripcion, pr.precio_venta,
                        pr.precio_compra, pr.cant_disponible, pr.id_categoria, pr.activo, pr.id_marca
        FROM Producto pr
        WHERE pr.activo = true
          AND (
            EXISTS (
                SELECT 1 
                FROM Compra_Producto cp
                INNER JOIN Compra c 
                    ON c.id_compra = cp.id_compra AND c.nit_proveedor = :nit
                WHERE cp.id_producto = pr.id_producto
            )
            OR EXISTS (
                SELECT 1 
                FROM Producto_Proveedor ppr
                WHERE ppr.id_producto = pr.id_producto AND ppr.nit_proveedor = :nit
            )
            OR NOT EXISTS (
                SELECT 1 FROM Compra c WHERE c.nit_proveedor = :nit
            )
          )
        ORDER BY pr.id_producto
    """)
    rows = db.execute(stmt, {"nit": nit}).mappings().all()
    return [dict(r) for r in rows]


@router.get("/{id_compra}/detalle", response_model=CompraDetalleOut)
def get_compra_detalle(id_compra: int, db: Session = Depends(get_session)):
    compra = (
        db.query(Compra)
        .options(
            joinedload(Compra.proveedor),
            joinedload(Compra.lineas).joinedload(CompraProducto.producto),
        )
        .filter(Compra.id_compra == id_compra)
        .first()
    )
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")

    lineas = [
        CompraLineaOut(
            id_producto=lp.id_producto,
            cantidad_compra=lp.cantidad_compra,
            precio_compra=lp.producto.precio_compra,
            nombre=lp.producto.nombre,
        )
        for lp in compra.lineas
    ]
    return CompraDetalleOut(
        compra=CompraCabeceraListaOut(
            id_compra=compra.id_compra,
            fecha=compra.fecha,
            total=compra.total,
            nit_proveedor=compra.nit_proveedor,
            proveedor_nombre=compra.proveedor.nombre,
        ),
        lineas=lineas,
    )


@router.get("/{id_compra}", response_model=CompraGet)
def get_compra(id_compra: int, db: Session = Depends(get_session)):
    compra = db.query(Compra).filter(Compra.id_compra == id_compra).first()
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    return CompraGet(
        id_compra=compra.id_compra,
        fecha=compra.fecha,
        total=compra.total,
        nit_proveedor=compra.nit_proveedor,
    )


@router.post("/", response_model=CompraGet, status_code=201)
def create_compra(data: CompraCreate, db: Session = Depends(get_session)):
    """Registra una compra completa invocando CALL sp_registrar_compra(...)"""
    if not data.productos:
        raise HTTPException(status_code=400, detail="La compra debe tener al menos un producto")

    productos_json = json.dumps([
        {
            "id_producto": p.id_producto,
            "cantidad": p.cantidad_compra,
            "precio_compra": float(p.precio_compra),
        }
        for p in data.productos
    ])

    try:
        result = db.execute(
            text("CALL sp_registrar_compra(:nit, :prods::json, NULL, NULL)"),
            {"nit": data.nit_proveedor, "prods": productos_json},
        )
        row = result.fetchone()
        p_id_compra = row[0]
    except DBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e.orig))

    db.commit()

    compra = db.query(Compra).filter(Compra.id_compra == p_id_compra).first()
    return CompraGet(
        id_compra=compra.id_compra,
        fecha=compra.fecha,
        total=compra.total,
        nit_proveedor=compra.nit_proveedor,
    )
