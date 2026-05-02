import { Package } from "lucide-react";
import type { VentaTablaRow } from "../../types/venta";

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

type Props = {
  rows: VentaTablaRow[];
  contraparteLabel?: string;
  emptyMessage?: string;
  onVerProductos: (id: number) => void;
  verProductosLabel?: string;
  /** Show vendedor column (all-sales admin view) */
  showEmpleadoColumn?: boolean;
  empleadoColumnLabel?: string;
};

export function VentasTable({
  rows,
  contraparteLabel = "Cliente",
  emptyMessage = "No hay registros.",
  onVerProductos,
  verProductosLabel = "Ver productos",
  showEmpleadoColumn = false,
  empleadoColumnLabel = "Vendedor",
}: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-300">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-100 text-neutral-800">
          <tr>
            <th className="px-3 py-2 font-semibold">ID</th>
            <th className="px-3 py-2 font-semibold">Fecha</th>
            <th className="px-3 py-2 font-semibold">{contraparteLabel}</th>
            {showEmpleadoColumn ? (
              <th className="px-3 py-2 font-semibold">{empleadoColumnLabel}</th>
            ) : null}
            <th className="px-3 py-2 font-semibold">Total</th>
            <th className="px-3 py-2 text-center font-semibold">{verProductosLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr
              key={v.id}
              className="border-b border-neutral-200 transition last:border-none hover:bg-neutral-50"
            >
              <td className="px-3 py-2 tabular-nums">{v.id}</td>
              <td className="px-3 py-2 whitespace-nowrap">{formatFechaVenta(v.fecha)}</td>
              <td className="px-3 py-2">{v.contraparte ?? "—"}</td>
              {showEmpleadoColumn ? (
                <td className="max-w-[200px] px-3 py-2">
                  <div className="font-medium text-neutral-900">
                    {v.empleadoNombre?.trim() || "—"}
                  </div>
                  {v.nitEmpleado ? (
                    <div className="font-mono text-xs text-neutral-500">{v.nitEmpleado}</div>
                  ) : null}
                </td>
              ) : null}
              <td className="px-3 py-2 tabular-nums">Q {formatMonto(v.total)}</td>
              <td className="px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => onVerProductos(v.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sky-700 underline-offset-2 hover:bg-sky-50 hover:underline"
                >
                  <Package className="h-4 w-4 shrink-0" aria-hidden />
                  {verProductosLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
