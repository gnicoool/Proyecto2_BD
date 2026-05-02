from fastapi import APIRouter, HTTPException

from database import get_db
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
def list_compras():
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                c.id_compra,
                c.fecha,
                c.total,
                c.nit_proveedor,
                p.nombre AS proveedor_nombre
            FROM Compra c
            JOIN Proveedor p ON p.nit_proveedor = c.nit_proveedor
            ORDER BY c.id_compra DESC
            """
        )
        return cur.fetchall()


@router.get(
    "/productos-por-proveedor/{nit_proveedor}",
    response_model=list[ProductoGet],
)
def productos_por_proveedor(nit_proveedor: str):
    """
    Active products available for this supplier: purchase history, explicit Producto_Proveedor
    link (e.g. set when creating a product), or all products if the supplier has no compras yet.
    """
    nit = nit_proveedor.strip()
    with get_db() as cur:
        cur.execute(
            "SELECT 1 FROM Proveedor WHERE nit_proveedor = %s",
            (nit,),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        cur.execute(
            """
            SELECT DISTINCT pr.*
            FROM Producto pr
            WHERE pr.activo = true
              AND (
                EXISTS (
                    SELECT 1
                    FROM Compra_Producto cp
                    INNER JOIN Compra c
                        ON c.id_compra = cp.id_compra AND c.nit_proveedor = %s
                    WHERE cp.id_producto = pr.id_producto
                )
                OR EXISTS (
                    SELECT 1
                    FROM Producto_Proveedor ppr
                    WHERE ppr.id_producto = pr.id_producto AND ppr.nit_proveedor = %s
                )
                OR NOT EXISTS (
                    SELECT 1 FROM Compra c WHERE c.nit_proveedor = %s
                )
              )
            ORDER BY pr.id_producto
            """,
            (nit, nit, nit),
        )
        return cur.fetchall()


@router.get("/{id_compra}/detalle", response_model=CompraDetalleOut)
def get_compra_detalle(id_compra: int):
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                c.id_compra,
                c.fecha,
                c.total,
                c.nit_proveedor,
                p.nombre AS proveedor_nombre
            FROM Compra c
            JOIN Proveedor p ON p.nit_proveedor = c.nit_proveedor
            WHERE c.id_compra = %s
            """,
            (id_compra,),
        )
        cab = cur.fetchone()
        if not cab:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        cur.execute(
            """
            SELECT
                cp.id_producto,
                cp.cantidad_compra,
                pr.precio_compra,
                pr.nombre
            FROM Compra_Producto cp
            JOIN Producto pr ON pr.id_producto = cp.id_producto
            WHERE cp.id_compra = %s
            ORDER BY cp.id_producto
            """,
            (id_compra,),
        )
        line_rows = cur.fetchall()

    lineas = [
        CompraLineaOut(
            id_producto=r["id_producto"],
            cantidad_compra=r["cantidad_compra"],
            precio_compra=r["precio_compra"],
            nombre=r["nombre"],
        )
        for r in line_rows
    ]
    return CompraDetalleOut(
        compra=CompraCabeceraListaOut(**cab),
        lineas=lineas,
    )


@router.get("/{id_compra}", response_model=CompraGet)
def get_compra(id_compra: int):
    with get_db() as cur:
        cur.execute(
            """
            SELECT id_compra, fecha, total, nit_proveedor
            FROM Compra
            WHERE id_compra = %s
            """,
            (id_compra,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    return row


@router.post("/", response_model=CompraGet, status_code=201)
def create_compra(data: CompraCreate):
    if not data.productos:
        raise HTTPException(status_code=400, detail="La compra debe tener al menos un producto")

    with get_db() as cur:
        cur.execute(
            "SELECT nit_proveedor, activo FROM Proveedor WHERE nit_proveedor = %s",
            (data.nit_proveedor,),
        )
        prov = cur.fetchone()
        if not prov:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        if not prov["activo"]:
            raise HTTPException(status_code=400, detail="Proveedor inactivo")

        total = sum(p.cantidad_compra * p.precio_compra for p in data.productos)

        cur.execute(
            "INSERT INTO Compra (total, nit_proveedor) VALUES (%s, %s) RETURNING id_compra, fecha",
            (total, data.nit_proveedor),
        )
        compra = cur.fetchone()
        id_compra = compra["id_compra"]

        for p in data.productos:
            cur.execute("SELECT id_producto FROM Producto WHERE id_producto = %s", (p.id_producto,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail=f"Producto {p.id_producto} no encontrado")

            cur.execute(
                "INSERT INTO Compra_Producto (id_compra, id_producto, cantidad_compra) VALUES (%s, %s, %s)",
                (id_compra, p.id_producto, p.cantidad_compra),
            )
            cur.execute(
                "UPDATE Producto SET cant_disponible = cant_disponible + %s WHERE id_producto = %s",
                (p.cantidad_compra, p.id_producto),
            )

        cur.execute(
            """
            SELECT id_compra, fecha, total, nit_proveedor
            FROM Compra
            WHERE id_compra = %s
            """,
            (id_compra,),
        )
        return cur.fetchone()
