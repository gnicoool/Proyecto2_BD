export function adminNitHeaders(nit: string): HeadersInit {
  return { "X-NIT-Empleado": nit };
}
