import type { ProductoCatalogoVistaRow } from "../../types/informes";
import { fmtMoney } from "./informesFormat";

type Props = {
  rows: ProductoCatalogoVistaRow[];
};

export function CatalogoVistaTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        No hay filas en el catálogo (vista).
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
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Categoría</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">P. venta</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">P. compra</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.id_producto} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-600">{r.id_producto}</td>
              <td className="max-w-[200px] truncate px-3 py-2 font-medium text-slate-900" title={r.nombre}>
                {r.nombre}
              </td>
              <td className="max-w-[140px] truncate px-3 py-2 text-slate-700" title={r.categoria_nombre}>
                {r.categoria_nombre}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-800">
                Q {fmtMoney(r.precio_venta)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-800">
                Q {fmtMoney(r.precio_compra)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums font-medium text-slate-900">
                {r.cant_disponible}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
