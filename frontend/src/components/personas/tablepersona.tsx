import { Eye, Pencil, Trash2 } from "lucide-react";

export type PersonaRow = {
  nit: string;
  nombre: string;
  telefono: string;
  correo: string;
  activo: boolean;
  detalle: string;
};

type Props = {
  data: PersonaRow[];
  tipo: "empleado" | "proveedor";
  onEdit: (nit: string) => void;
  onDelete: (nit: string) => void;
  onView: (nit: string) => void;
};

export function PersonasTable({ data, tipo, onEdit, onDelete, onView }: Props) {
  const labelVer = tipo === "empleado" ? "Ver ventas" : "Ver compras";

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
        No hay registros para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-300">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-100 text-neutral-800">
          <tr>
            <th className="px-3 py-2 font-semibold">NIT</th>
            <th className="px-3 py-2 font-semibold">Nombre</th>
            <th className="px-3 py-2 font-semibold">Teléfono</th>
            <th className="px-3 py-2 font-semibold">Correo</th>
            <th className="px-3 py-2 font-semibold">Estado</th>
            <th className="px-3 py-2 font-semibold text-center">{labelVer}</th>
            <th className="px-3 py-2 text-center font-semibold">Editar</th>
            <th className="px-3 py-2 text-center font-semibold">Eliminar</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p) => (
            <tr
              key={p.nit}
              className="border-b border-neutral-200 transition last:border-none hover:bg-neutral-50"
            >
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{p.nit}</td>
              <td className="px-3 py-2">
                <div className="font-medium text-neutral-900">{p.nombre}</div>
                <div className="text-xs text-neutral-500">{p.detalle}</div>
              </td>
              <td className="px-3 py-2">{p.telefono || "—"}</td>
              <td className="break-all px-3 py-2">{p.correo}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    p.activo
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600"
                  }
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td className="px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => onView(p.nit)}
                  className="inline-flex items-center gap-1 text-sky-700 underline-offset-2 hover:underline"
                >
                  <Eye className="h-4 w-4 shrink-0" aria-hidden />
                  {labelVer}
                </button>
              </td>

              <td className="px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => onEdit(p.nit)}
                  className="text-amber-600 hover:text-amber-800"
                  aria-label="Editar"
                >
                  <Pencil className="mx-auto h-[18px] w-[18px]" />
                </button>
              </td>

              <td className="px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => onDelete(p.nit)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Eliminar"
                >
                  <Trash2 className="mx-auto h-[18px] w-[18px]" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
