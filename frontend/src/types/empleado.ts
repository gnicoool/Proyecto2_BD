export type EmpleadoListItem = {
  nit_empleado: string;
  nombre: string;
  tel_empleado: string | null;
  correo: string;
  id_rol: number;
  nombre_rol: string;
  activo: boolean;
  total_ventas: number;
};
