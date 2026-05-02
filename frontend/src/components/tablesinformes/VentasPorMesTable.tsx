import type { VentaPorMesRow } from "../../types/informes";
import { fmtMoney } from "./informesFormat";

type Props = {
  rows: VentaPorMesRow[];
};

export function VentasPorMesTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        Sin ventas agrupadas por mes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Año-mes</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700"># Ventas</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Total mes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.anio_mes} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-900">{r.anio_mes}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-800">{r.cantidad_ventas}</td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">
                Q {fmtMoney(r.total_mes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
