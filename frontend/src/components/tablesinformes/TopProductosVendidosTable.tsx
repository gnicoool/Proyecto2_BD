import type { TopProductoVendidoRow } from "../../types/informes";
import { fmtInt, fmtMoney } from "./informesFormat";

type Props = {
  rows: TopProductoVendidoRow[];
};

export function TopProductosVendidosTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        Sin ventas para rankear productos.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">#</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Producto</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Unidades</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Costo (aprox.)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, idx) => (
            <tr key={r.id_producto} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-slate-500">{idx + 1}</td>
              <td className="px-3 py-2 font-medium text-slate-900">{r.nombre}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-800">{fmtInt(r.total_unidades_vendidas)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">
                Q {fmtMoney(r.costo_aproximado)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
