import type { Producto } from "../components/producto/ProductoDetalle";
import type { ProductoListItem } from "../types/producto";

/** Build API-shaped product row from catalog card data (for cart / venta draft). */
export function productoViewToListItem(p: Producto): ProductoListItem {
  return {
    id_producto: p.id,
    nombre: p.nombre,
    descripcion: null,
    precio_venta: p.precio_venta,
    precio_compra: p.precio_compra,
    cant_disponible: p.cantidad_disponible,
    id_categoria: 0,
    id_marca: 0,
    activo: p.activo ?? true,
  };
}
