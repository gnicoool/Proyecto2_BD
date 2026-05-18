/** Backend admin routes expect this header (require_admin_nit). */
export function adminNitHeaders(nit: string): HeadersInit {
  return { "X-NIT-Empleado": nit };
}
