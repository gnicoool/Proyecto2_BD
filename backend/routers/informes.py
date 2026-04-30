from fastapi import APIRouter, HTTPException

from database import get_db
from schemas.informes import (
    ProductoCatalogoVistaOut,
    ProductoNuncaVendidoOut,
    UltimaLineaVentaOut,
    VentaPorCategoriaOut,
    VentaPorMesSubqueryOut,
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
            WITH lineas_importe AS (
                SELECT
                    vp.id_venta,
                    p.id_categoria,
                    (vp.cantidad_venta * p.precio_venta)::numeric AS importe_linea
                FROM Venta_Producto vp
                INNER JOIN Producto p ON p.id_producto = vp.id_producto
            )
            SELECT
                c.id_categoria,
                c.nombre AS categoria_nombre,
                COUNT(DISTINCT l.id_venta)::int AS num_ventas,
                SUM(l.importe_linea) AS total_importe,
                (SUM(l.importe_linea) / NULLIF(COUNT(DISTINCT l.id_venta), 0)) AS ticket_promedio_categoria
            FROM lineas_importe l
            INNER JOIN Categoria c ON c.id_categoria = l.id_categoria
            GROUP BY c.id_categoria, c.nombre
            HAVING SUM(l.importe_linea) > 0
            ORDER BY total_importe DESC
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
        rows = cur.fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail="No hay líneas de venta")
    return rows
