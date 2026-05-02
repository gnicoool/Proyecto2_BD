export function fmtMoney(v: number | string | null | undefined): string {
  if (v == null) return "—";
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtInt(v: number): string {
  return v.toLocaleString("es-GT");
}
