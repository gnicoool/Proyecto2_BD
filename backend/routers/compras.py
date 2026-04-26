from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.compra import CompraCreate, CompraGet

router = APIRouter(prefix="/compras", tags=["Compras"])


@router.get("/", response_model=list[CompraGet])
def list_compras():
    with get_db() as cur:
        cur.execute(
            """
            SELECT id_compra, fecha, total, nit_proveedor
            FROM Compra
            ORDER BY id_compra DESC
            """
        )
        return cur.fetchall()


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
