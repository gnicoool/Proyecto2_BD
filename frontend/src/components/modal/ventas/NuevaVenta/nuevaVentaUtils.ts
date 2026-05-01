import type { ClienteListItem } from "../../../../types/cliente";

export const DEBOUNCE_MS = 450;

export type LineaForm = {
  key: string;
  id_producto: number | "";
  cantidad: number;
  productoInput: string;
};

export function genKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

export function matchesText(haystack: string, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return haystack.toLowerCase().includes(s);
}

export function formatMoney(v: number | string): string {
  return toNum(v).toFixed(2);
}

export function clienteSelectedLabel(clientes: ClienteListItem[], id: number): string {
  const c = clientes.find((x) => x.id_cliente === id);
  return c ? `${c.nombre} (${c.nit})` : "";
}
