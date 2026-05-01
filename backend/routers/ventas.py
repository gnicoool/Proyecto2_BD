from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException

from auth_deps import require_admin
from database import get_db
from schemas.venta import (
    VentaCabeceraOut,
    VentaCreate,
    VentaDetalleOut,
    VentaProductoLineOut,
)

router = APIRouter(prefix="/ventas", tags=["Ventas"])


@router.get("/", response_model=list[VentaCabeceraOut])
def list_ventas():
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                v.id_venta,
                v.fecha,
                v.total,
                v.id_cliente,
                v.nit_empleado,
                c.nombre AS cliente_nombre,
                u.nombre AS empleado_nombre
            FROM Venta v
            LEFT JOIN Cliente c ON c.id_cliente = v.id_cliente
            JOIN Usuario u ON u.nit_empleado = v.nit_empleado
            ORDER BY v.id_venta DESC
            """
        )
        rows = cur.fetchall()
    return [VentaCabeceraOut(**r) for r in rows]


def _ventas_cabecera_por_nit(nit: str) -> list[VentaCabeceraOut]:
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                v.id_venta,
                v.fecha,
                v.total,
                v.id_cliente,
                v.nit_empleado,
                c.nombre AS cliente_nombre,
                u.nombre AS empleado_nombre
            FROM Venta v
            LEFT JOIN Cliente c ON c.id_cliente = v.id_cliente
            JOIN Usuario u ON u.nit_empleado = v.nit_empleado
            WHERE v.nit_empleado = %s
            ORDER BY v.id_venta DESC
            """,
            (nit,),
        )
        rows = cur.fetchall()
    return [VentaCabeceraOut(**r) for r in rows]


@router.get("/mis", response_model=list[VentaCabeceraOut])
def list_mis_ventas(x_nit_empleado: str = Header(..., alias="X-NIT-Empleado")):
    """
    Ventas del empleado autenticado
    """
    nit = x_nit_empleado.strip()
    if not nit:
        raise HTTPException(status_code=400, detail="X-NIT-Empleado vacío")
    return _ventas_cabecera_por_nit(nit)


@router.get("/empleado/{nit_empleado}/todas", response_model=list[VentaCabeceraOut])
def list_ventas_por_empleado_admin(
    nit_empleado: str,
    _: str = Depends(require_admin),
):
    """
    todas las ventas de un empleado, solo lo accede el admin
    """
    nit = nit_empleado.strip()
    return _ventas_cabecera_por_nit(nit)


def _load_cabecera(cur, id_venta: int) -> dict | None:
    cur.execute(
        """
        SELECT
            v.id_venta,
            v.fecha,
            v.total,
            v.id_cliente,
            v.nit_empleado,
            c.nombre AS cliente_nombre,
            u.nombre AS empleado_nombre
        FROM Venta v
        LEFT JOIN Cliente c ON c.id_cliente = v.id_cliente
        JOIN Usuario u ON u.nit_empleado = v.nit_empleado
        WHERE v.id_venta = %s
        """,
        (id_venta,),
    )
    return cur.fetchone()


def _load_lineas(cur, id_venta: int) -> list[VentaProductoLineOut]:
    cur.execute(
        """
        SELECT
            vp.id_producto,
            vp.cantidad_venta,
            pr.precio_venta,
            pr.nombre
        FROM Venta_Producto vp
        JOIN Producto pr ON pr.id_producto = vp.id_producto
        WHERE vp.id_venta = %s
        ORDER BY vp.id_producto
        """,
        (id_venta,),
    )
    rows = cur.fetchall()
    return [
        VentaProductoLineOut(
            id_producto=r["id_producto"],
            cantidad_venta=r["cantidad_venta"],
            precio_venta=r["precio_venta"],
            nombre=r["nombre"],
        )
        for r in rows
    ]


@router.get("/{id_venta}", response_model=VentaDetalleOut)
def get_venta(id_venta: int):
    with get_db() as cur:
        cab = _load_cabecera(cur, id_venta)
        if not cab:
            raise HTTPException(status_code=404, detail="Venta no encontrada")
        lineas = _load_lineas(cur, id_venta)
    return VentaDetalleOut(
        venta=VentaCabeceraOut(**cab),
        lineas=lineas,
    )


@router.post("/", response_model=VentaDetalleOut, status_code=201)
def create_venta(data: VentaCreate):
    if not data.productos:
        raise HTTPException(
            status_code=400, detail="La venta debe tener al menos un producto"
        )

    with get_db() as cur:
        cur.execute(
            """
            SELECT nit_empleado, activo FROM Usuario WHERE nit_empleado = %s
            """,
            (data.nit_empleado,),
        )
        emp = cur.fetchone()
        if not emp:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        if not emp["activo"]:
            raise HTTPException(status_code=400, detail="Empleado inactivo")

        id_cliente = None
        if data.nuevo_cliente is not None:
            cur.execute(
                """
                INSERT INTO Cliente (nombre, nit)
                VALUES (%s, %s)
                RETURNING id_cliente
                """,
                (data.nuevo_cliente.nombre, data.nuevo_cliente.nit),
            )
            id_cliente = cur.fetchone()["id_cliente"]
        elif data.id_cliente is not None:
            cur.execute(
                "SELECT id_cliente FROM Cliente WHERE id_cliente = %s",
                (data.id_cliente,),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Cliente no encontrado")
            id_cliente = data.id_cliente

        total = Decimal("0")
        lineas_out: list[VentaProductoLineOut] = []

        for line in data.productos:
            cur.execute(
                """
                SELECT nombre, precio_venta, cant_disponible, activo
                FROM Producto
                WHERE id_producto = %s
                FOR UPDATE
                """,
                (line.id_producto,),
            )
            pr = cur.fetchone()
            if not pr:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto {line.id_producto} no encontrado",
                )
            if not pr["activo"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Producto {line.id_producto} inactivo",
                )
            if pr["cant_disponible"] < line.cantidad_venta:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para producto {line.id_producto}",
                )
            if line.precio_venta != pr["precio_venta"]:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"precio_venta no coincide con el catálogo "
                        f"para producto {line.id_producto}"
                    ),
                )

            subtotal = line.cantidad_venta * pr["precio_venta"]
            total += subtotal
            lineas_out.append(
                VentaProductoLineOut(
                    id_producto=line.id_producto,
                    cantidad_venta=line.cantidad_venta,
                    precio_venta=pr["precio_venta"],
                    nombre=pr["nombre"],
                )
            )

        cur.execute(
            """
            INSERT INTO Venta (total, id_cliente, nit_empleado)
            VALUES (%s, %s, %s)
            RETURNING id_venta
            """,
            (total, id_cliente, data.nit_empleado),
        )
        id_venta = cur.fetchone()["id_venta"]

        for line in data.productos:
            cur.execute(
                """
                INSERT INTO Venta_Producto (id_venta, id_producto, cantidad_venta)
                VALUES (%s, %s, %s)
                """,
                (id_venta, line.id_producto, line.cantidad_venta),
            )
            cur.execute(
                """
                UPDATE Producto
                SET cant_disponible = cant_disponible - %s
                WHERE id_producto = %s
                """,
                (line.cantidad_venta, line.id_producto),
            )

        cab = _load_cabecera(cur, id_venta)
        if not cab:
            raise HTTPException(status_code=500, detail="Venta no persistida")

    return VentaDetalleOut(
        venta=VentaCabeceraOut(**cab),
        lineas=lineas_out,
    )
