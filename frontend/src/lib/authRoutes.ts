export const ROUTES = {
  login: "/login",
  noAutorizado: "/no-autorizado",
  // Vendedor
  misVentas: "/mis-ventas",
  ventas: "/ventas",
  tiendaCategorias: "/tienda/categorias",
  tiendaMarcas: "/tienda/marcas",
  tiendaProductos: "/tienda/productos",
  // Bodeguero
  compras: "/compras",
  // Todos los roles de gestión
  productos: "/productos",
  // Admin + Contador + Supervisor
  informes: "/informes",
  // Admin
  categorias: "/categorias",
  marcas: "/marcas",
  proveedores: "/proveedores",
  empleados: "/empleados",
} as const;

/** Landing page after login or when visiting `/` while authenticated. */
export function getHomeRouteForRol(rol: string): string {
  switch (rol) {
    case "Admin":
      return ROUTES.ventas;
    case "Vendedor":
      return ROUTES.misVentas;
    case "Bodeguero":
      return ROUTES.compras;
    case "Contador":
    case "Supervisor":
      return ROUTES.informes;
    default:
      return ROUTES.misVentas;
  }
}
