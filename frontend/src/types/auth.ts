export type LoginResponse = {
  access_token: string;
  token_type: string;
  nit_empleado: string;
  nombre: string;
  id_rol: number;
  rol: string;
  activo: boolean;
};
