export type ProductoCatalogoVistaRow = {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio_venta: string | number;
  precio_compra: string | number;
  cant_disponible: number;
  id_categoria: number;
  categoria_nombre: string;
  categoria_descripcion: string | null;
};

export type VentaPorCategoriaRow = {
  id_categoria: number;
  categoria_nombre: string;
  num_ventas: number;
  costo_total: string | number;
  factura_promedio_categoria: string | number | null;
};

export type ProductoNuncaVendidoRow = {
  id_producto: number;
  nombre: string;
  cant_disponible: number;
};

export type VentaPorMesRow = {
  anio_mes: string;
  cantidad_ventas: number;
  total_mes: string | number;
};

export type UltimaLineaVentaRow = {
  id_venta: number;
  fecha: string;
  cliente: string;
  producto: string;
  cantidad_venta: number;
  precio_venta: string | number;
};

export type TopProductoVendidoRow = {
  id_producto: number;
  nombre: string;
  total_unidades_vendidas: number;
  costo_aproximado: string | number;
};

export type CompraPorMesRow = {
  anio_mes: string;
  num_compras: number;
  total_mes: string | number;
};

export type VentaPorEmpleadoRow = {
  nit_empleado: string | null;
  empleado_nombre: string | null;
  num_ventas: number;
  costo_total: string | number;
};
