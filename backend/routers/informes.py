from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from orm.database import get_session
from schemas.informes import (
    CompraPorMesOut,
    ProductoCatalogoVistaOut,
    ProductoNuncaVendidoOut,
    TopProductoVendidoOut,
    UltimaLineaVentaOut,
    VentaPorCategoriaOut,
    VentaPorEmpleadoOut,
    VentaPorMesSubqueryOut,
    VentaRangoOut,
)

router = APIRouter(prefix="/informes", tags=["Informes"])


@router.get("/catalogo-vista", response_model=list[ProductoCatalogoVistaOut])
def catalogo_desde_vista():
    """Usando view v_producto_con_categoria."""
    with get_db() as cur:
        cur.execute(
            """
            SELECT id_producto, nombre, descripcion, precio_venta, precio_compra,
                   cant_disponible, id_categoria, categoria_nombre, categoria_descripcion
            FROM v_producto_con_categoria
            ORDER BY id_producto
            """
        )
        return cur.fetchall()


@router.get("/ventas-por-categoria", response_model=list[VentaPorCategoriaOut])
def ventas_por_categoria():
    """
    Sales by category (GROUP BY / HAVING).
    Line amount uses Producto.precio_venta * cantidad_venta (Venta_Producto has no unit price column).
    """
    with get_db() as cur:
        cur.execute(
            """
            WITH lineas_costo AS (
                SELECT
                    vp.id_venta,
                    p.id_categoria,
                    (vp.cantidad_venta * p.precio_venta)::numeric AS costo_linea
                FROM Venta_Producto vp
                INNER JOIN Producto p ON p.id_producto = vp.id_producto
            )
            SELECT
                c.id_categoria,
                c.nombre AS categoria_nombre,
                COUNT(DISTINCT l.id_venta)::int AS num_ventas,
                SUM(l.costo_linea) AS costo_total,
                (SUM(l.costo_linea) / NULLIF(COUNT(DISTINCT l.id_venta), 0)) AS factura_promedio_categoria
            FROM lineas_costo l
            INNER JOIN Categoria c ON c.id_categoria = l.id_categoria
            GROUP BY c.id_categoria, c.nombre
            HAVING SUM(l.costo_linea) > 0
            ORDER BY costo_total DESC
            """
        )
        return cur.fetchall()


@router.get("/productos-nunca-vendidos", response_model=list[ProductoNuncaVendidoOut])
def productos_nunca_vendidos():
    """Products never sold (NOT IN / DISTINCT)."""
    with get_db() as cur:
        cur.execute(
            """
            SELECT p.id_producto, p.nombre, p.cant_disponible
            FROM Producto p
            WHERE p.id_producto NOT IN (
                SELECT DISTINCT vp.id_producto
                FROM Venta_Producto vp
            )
            ORDER BY p.id_producto
            """
        )
        return cur.fetchall()


@router.get("/ventas-por-mes", response_model=list[VentaPorMesSubqueryOut])
def ventas_por_mes_subquery():
    """Subquery in FROM: monthly aggregates, outer query filters."""
    with get_db() as cur:
        cur.execute(
            """
            SELECT sub.anio_mes, sub.cantidad_ventas, sub.total_mes
            FROM (
                SELECT
                    TO_CHAR(v.fecha, 'YYYY-MM') AS anio_mes,
                    COUNT(*)::int AS cantidad_ventas,
                    SUM(v.total) AS total_mes
                FROM Venta v
                GROUP BY TO_CHAR(v.fecha, 'YYYY-MM')
            ) sub
            WHERE sub.cantidad_ventas > 0
            ORDER BY sub.anio_mes DESC
            """
        )
        return cur.fetchall()


@router.get("/ultimas-lineas-venta", response_model=list[UltimaLineaVentaOut])
def ultimas_lineas_venta():
    """JOIN Venta, Venta_Producto, Producto, Cliente. Unit price from Producto (catalog price)."""
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                v.id_venta,
                v.fecha,
                COALESCE(c.nombre, '(sin cliente)') AS cliente,
                p.nombre AS producto,
                vp.cantidad_venta,
                p.precio_venta AS precio_venta
            FROM Venta v
            INNER JOIN Venta_Producto vp ON vp.id_venta = v.id_venta
            INNER JOIN Producto p ON p.id_producto = vp.id_producto
            LEFT JOIN Cliente c ON c.id_cliente = v.id_cliente
            ORDER BY v.fecha DESC, v.id_venta DESC, vp.id_producto
            LIMIT 80
            """
        )
        return cur.fetchall()


@router.get("/top-productos-vendidos", response_model=list[TopProductoVendidoOut])
def top_productos_vendidos(limite: int = 25, db: Session = Depends(get_session)):
    """Top productos más vendidos — invoca SELECT * FROM sp_top_productos(:limite)"""
    rows = db.execute(
        text("SELECT * FROM top_productos(:limite)"),
        {"limite": limite},
    ).mappings().all()
    return [
        TopProductoVendidoOut(
            id_producto=r["id_producto"],
            nombre=r["nombre_producto"],
            total_unidades_vendidas=int(r["total_vendido"]),
            costo_aproximado=r["ingresos_total"],
        )
        for r in rows
    ]


@router.get("/ventas-rango", response_model=list[VentaRangoOut])
def ventas_por_rango(
    fecha_inicio: datetime,
    fecha_fin: datetime,
    db: Session = Depends(get_session),
):
    """Reporte de ventas por rango de fecha — invoca SELECT * FROM sp_reporte_ventas(:inicio, :fin)"""
    rows = db.execute(
        text("SELECT * FROM reporte_ventas(:inicio, :fin)"),
        {"inicio": fecha_inicio, "fin": fecha_fin},
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/compras-por-mes", response_model=list[CompraPorMesOut])
def compras_por_mes():
    """TCompras por mes """
    with get_db() as cur:
        cur.execute(
            """
            SELECT sub.anio_mes, sub.num_compras, sub.total_mes
            FROM (
                SELECT
                    TO_CHAR(c.fecha, 'YYYY-MM') AS anio_mes,
                    COUNT(*)::int AS num_compras,
                    SUM(c.total)::numeric AS total_mes
                FROM Compra c
                GROUP BY TO_CHAR(c.fecha, 'YYYY-MM')
            ) sub
            WHERE sub.num_compras > 0
            ORDER BY sub.anio_mes DESC
            """
        )
        return cur.fetchall()


@router.get("/ventas-por-empleado", response_model=list[VentaPorEmpleadoOut])
def ventas_por_empleado():
    """numero de ventas por empleado"""
    with get_db() as cur:
        cur.execute(
            """
            SELECT
                v.nit_empleado,
                u.nombre AS empleado_nombre,
                COUNT(*)::int AS num_ventas,
                SUM(v.total)::numeric AS costo_total
            FROM Venta v
            LEFT JOIN Usuario u ON u.nit_empleado = v.nit_empleado
            GROUP BY v.nit_empleado, u.nombre
            HAVING COUNT(*) > 0
            ORDER BY costo_total DESC NULLS LAST
            """
        )
        return cur.fetchall()
