import type { Producto } from "./ProductoDetalle";

type Props = {
  producto: Producto;
  onVerDetalle: (p: Producto) => void;
};

export function ProductoCard({ producto, onVerDetalle }: Props) {
  const { nombre, marca, categoria, proveedor, cantidad_disponible, activo = true } = producto;

  const stockColor =
    cantidad_disponible === 0
      ? "text-red-500 bg-red-50 border-red-200"
      : cantidad_disponible <= 5
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-sky-600 bg-sky-50 border-sky-200";

  return (
    <div
      className={`flex flex-col justify-between gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100 transition hover:shadow-md hover:shadow-sky-200/50 ${!activo ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sky-900">{nombre}</p>
          <p className="truncate text-xs text-sky-400">{marca}</p>
          <p className="truncate text-[11px] leading-snug text-sky-500">{categoria}</p>
          <p className="truncate text-[11px] leading-snug text-sky-500">{proveedor}</p>
          {!activo && (
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-600">
              Inactivo
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums ${stockColor}`}
        >
          {cantidad_disponible === 0 ? "Agotado" : `#${cantidad_disponible}`}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onVerDetalle(producto)}
          className="rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50 hover:text-sky-800"
        >
          Ver
        </button>
      </div>
    </div>
  );
}