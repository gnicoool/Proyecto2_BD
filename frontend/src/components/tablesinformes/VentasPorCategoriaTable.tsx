import type { VentaPorCategoriaRow } from "../../types/informes";
import { fmtMoney } from "./informesFormat";

type Props = {
  rows: VentaPorCategoriaRow[];
};

export function VentasPorCategoriaTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        Sin ventas por categoría (costo total acumulado = 0).
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Categoría</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700"># Ventas</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Costo total</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Factura prom.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.id_categoria} className="hover:bg-slate-50">
              <td className="px-3 py-2 font-medium text-slate-900">{r.categoria_nombre}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-800">{r.num_ventas}</td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">
                Q {fmtMoney(r.costo_total)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                Q {fmtMoney(r.factura_promedio_categoria)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
