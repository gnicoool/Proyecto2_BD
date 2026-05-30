export function formatFechaVenta(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-GT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function formatMonto(total: number | string): string {
  const n = typeof total === "number" ? total : Number.parseFloat(String(total));
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
}
