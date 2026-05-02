from fastapi import APIRouter, HTTPException, Query
import psycopg2

from database import get_db
from schemas.producto import ProductoCreate, ProductoGet, ProductoUpdate, ProductoDelete

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.get("/", response_model=list[ProductoGet])
def get_productos():
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                pr.id_producto,
                pr.nombre,
                pr.descripcion,
                pr.precio_venta,
                pr.precio_compra,
                pr.cant_disponible,
                pr.id_categoria,
                pr.activo,
                pr.id_marca,
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
            """
        )
        return cur.fetchall()


@router.get("/categoria/{id_categoria}", response_model=list[ProductoGet])
def get_productos_by_categoria(id_categoria: int):
    with get_db() as cur:
        cur.execute(
            "SELECT * FROM Producto WHERE id_categoria = %s ORDER BY id_producto",
            (id_categoria,),
        )
        return cur.fetchall()
    
@router.get("/marca/{id_marca}", response_model=list[ProductoGet])
def get_productos_by_marca(id_marca: int):
    with get_db() as cur:
        cur.execute(
            "SELECT * FROM Producto WHERE id_marca = %s ORDER BY id_producto",
            (id_marca,),
        )
        return cur.fetchall()


@router.post("/", response_model=ProductoGet, status_code=201)
def create_producto(data: ProductoCreate):
    nit = (data.nit_proveedor or "").strip() or None
    with get_db() as cur:
        if nit:
            cur.execute(
                "SELECT nit_proveedor, activo FROM Proveedor WHERE nit_proveedor = %s",
                (nit,),
            )
            prov = cur.fetchone()
            if not prov:
                raise HTTPException(status_code=404, detail="Proveedor no encontrado")
            if not prov["activo"]:
                raise HTTPException(status_code=400, detail="Proveedor inactivo")

        cur.execute(
            """INSERT INTO Producto (nombre, descripcion, precio_venta, precio_compra, cant_disponible, id_categoria, id_marca)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *""",
            (
                data.nombre,
                data.descripcion,
                data.precio_venta,
                data.precio_compra,
                data.cant_disponible,
                data.id_categoria,
                data.id_marca,
            ),
        )
        row = cur.fetchone()
        id_producto = row["id_producto"]

        if nit:
            cur.execute(
                """
                INSERT INTO Producto_Proveedor (id_producto, nit_proveedor)
                VALUES (%s, %s)
                ON CONFLICT (id_producto, nit_proveedor) DO NOTHING
                """,
                (id_producto, nit),
            )

        return row


@router.patch("/{id_producto}", response_model=ProductoGet)
def update_producto(id_producto: int, data: ProductoUpdate):
    fields: list[str] = []
    values: list = []
    if data.nombre is not None:
        fields.append("nombre = %s")
        values.append(data.nombre)
    if data.descripcion is not None:
        fields.append("descripcion = %s")
        values.append(data.descripcion)
    if data.precio_venta is not None:
        fields.append("precio_venta = %s")
        values.append(data.precio_venta)
    if data.precio_compra is not None:
        fields.append("precio_compra = %s")
        values.append(data.precio_compra)
    if data.cant_disponible is not None:
        fields.append("cant_disponible = %s")
        values.append(data.cant_disponible)
    if data.id_categoria is not None:
        fields.append("id_categoria = %s")
        values.append(data.id_categoria)
    if data.id_marca is not None:
        fields.append("id_marca = %s")
        values.append(data.id_marca)

    with get_db() as cur:
        if not fields:
            cur.execute(
                "SELECT * FROM Producto WHERE id_producto = %s",
                (id_producto,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Producto no encontrado")
            return row

        if data.id_categoria is not None:
            cur.execute(
                "SELECT 1 FROM Categoria WHERE id_categoria = %s",
                (data.id_categoria,),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Categoría no encontrada")

        if data.id_marca is not None:
            cur.execute("SELECT 1 FROM Marca WHERE id_marca = %s", (data.id_marca,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Marca no encontrada")

        values.append(id_producto)
        cur.execute(
            f"UPDATE Producto SET {', '.join(fields)} WHERE id_producto = %s RETURNING *",
            tuple(values),
        )
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return row


@router.delete("/{id_producto}", response_model=ProductoDelete)
def delete_producto(
    id_producto: int,
    permanent: bool = Query(
        False,
        description="If true, DELETE row; if false, set activo = false (soft delete).",
    ),
):
    with get_db() as cur:
        cur.execute(
            "SELECT id_producto FROM Producto WHERE id_producto = %s",
            (id_producto,),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        if permanent:
            try:
                cur.execute("DELETE FROM Producto WHERE id_producto = %s", (id_producto,))
            except psycopg2.IntegrityError:
                raise HTTPException(
                    status_code=409,
                    detail="No se puede eliminar: el producto aparece en compras o ventas",
                )
            return ProductoDelete(accion="eliminado", id_producto=id_producto, activo=None)

        cur.execute(
            "UPDATE Producto SET activo = false WHERE id_producto = %s RETURNING activo",
            (id_producto,),
        )
        row = cur.fetchone()
        return ProductoDelete(
            accion="desactivado",
            id_producto=id_producto,
            activo=row["activo"],
        )
