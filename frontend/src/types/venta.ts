export type VentaCabecera = {
  id_venta: number;
  fecha: string;
  total: number | string;
  id_cliente: number | null;
  nit_empleado: string | null;
  cliente_nombre: string | null;
  empleado_nombre: string | null;
};
