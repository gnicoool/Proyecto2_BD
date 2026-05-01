export type ProductoListItem = {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio_venta: number | string;
  precio_compra: number | string;
  cant_disponible: number;
  id_categoria: number;
  activo: boolean;
  id_marca: number;
};
