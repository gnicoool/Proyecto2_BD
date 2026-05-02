import type { VentaPorEmpleadoRow } from "../../types/informes";
import { fmtMoney } from "./informesFormat";

type Props = {
  rows: VentaPorEmpleadoRow[];
};

function empleadoLabel(r: VentaPorEmpleadoRow): string {
  if (r.nit_empleado == null || r.nit_empleado === "") {
    return "(sin vendedor)";
  }
  const name = r.empleado_nombre?.trim();
  return name ? `${name} (${r.nit_empleado})` : r.nit_empleado;
}

export function VentasPorEmpleadoTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        Sin ventas por empleado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Empleado</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700"># Ventas</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, i) => (
            <tr
              key={r.nit_empleado ?? `null-${i}`}
              className="hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-900">{empleadoLabel(r)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-800">{r.num_ventas}</td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">
                Q {fmtMoney(r.costo_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
