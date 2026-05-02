import type { ProductoNuncaVendidoRow } from "../../types/informes";
import { fmtInt } from "./informesFormat";

type Props = {
  rows: ProductoNuncaVendidoRow[];
};

export function ProductosNuncaVendidosTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-emerald-100 bg-emerald-50/50 px-4 py-6 text-center text-sm text-emerald-800">
        Todos los productos tienen al menos una venta.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">ID</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Producto</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.id_producto} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-600">{r.id_producto}</td>
              <td className="px-3 py-2 font-medium text-slate-900">{r.nombre}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-800">{fmtInt(r.cant_disponible)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
