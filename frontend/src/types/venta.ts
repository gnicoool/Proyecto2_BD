export type VentaCabecera = {
  id_venta: number;
  fecha: string;
  total: number | string;
  id_cliente: number | null;
  nit_empleado: string | null;
  cliente_nombre: string | null;
  empleado_nombre: string | null;
};

/** Line item returned by GET /ventas/{id} */
export type VentaLineaDetalle = {
  id_producto: number;
  cantidad_venta: number;
  precio_venta: number | string;
  nombre?: string | null;
};

export type VentaDetalleRespuesta = {
  venta: VentaCabecera;
  lineas: VentaLineaDetalle[];
};

/** Normalized row for VentasTable (ventas or compras mapping in parent) */
export type VentaTablaRow = {
  id: number;
  fecha: string;
  total: number | string;
  /** Cliente, proveedor, etc. */
  contraparte: string | null;
  /** Admin list: salesperson name / fallback NIT */
  empleadoNombre?: string | null;
  nitEmpleado?: string | null;
};
