import { formatFechaVenta } from "../../lib/formato/formatos";
import type { UltimaLineaVentaRow } from "../../types/informes";
import { fmtMoney } from "./informesFormat";

type Props = {
  rows: UltimaLineaVentaRow[];
};

export function UltimasLineasVentaTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        No hay venta registradas.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Venta</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Fecha</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Cliente</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Producto</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Cant.</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">P. unit.</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, i) => {
            const unit = typeof r.precio_venta === "number" ? r.precio_venta : Number.parseFloat(String(r.precio_venta));
            const sub = Number.isNaN(unit) ? 0 : unit * r.cantidad_venta;
            return (
              <tr key={`${r.id_venta}-${r.producto}-${i}`} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-600">#{r.id_venta}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-800">{formatFechaVenta(r.fecha)}</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-slate-700" title={r.cliente}>
                  {r.cliente}
                </td>
                <td className="max-w-[180px] truncate px-3 py-2 text-slate-900" title={r.producto}>
                  {r.producto}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-800">{r.cantidad_venta}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-700">Q {fmtMoney(r.precio_venta)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-900">Q {fmtMoney(sub)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
