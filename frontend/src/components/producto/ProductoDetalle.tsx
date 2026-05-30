import { Link } from "react-router-dom";
import { X } from "lucide-react";

export type Producto = {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  proveedor: string;
  descripcion?: string;
  precio_compra: number;
  precio_venta: number;
  cantidad_disponible: number;
  activo?: boolean;
  id_categoria?: number;
  id_marca?: number;
};

const fmt = (n: number) =>
  n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  producto: Producto | null;
  onClose: () => void;
};

export function ProductoDetalle({ producto, onClose }: Props) {
  if (!producto) return null;

  const {
    nombre,
    marca,
    categoria,
    proveedor,
    descripcion,
    precio_compra,
    precio_venta,
    cantidad_disponible,
    activo = true,
  } = producto;

  const stockColor =
    cantidad_disponible === 0
      ? "text-red-500 bg-red-50 border-red-200"
      : cantidad_disponible <= 5
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-sky-600 bg-sky-50 border-sky-200";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="producto-detalle-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-sky-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-sky-100 bg-sky-50 px-5 py-4">
          <div className="min-w-0">
            <h2 id="producto-detalle-title" className="text-base font-bold text-sky-900">
              {nombre}
            </h2>
            <p className="text-xs text-sky-400">{marca}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-sky-400 hover:bg-sky-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {!activo && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
              <p className="text-sm font-medium text-amber-800">Este producto está inactivo.</p>
            </div>
          )}

          {descripcion && (
            <div>
              <p className="text-xs uppercase text-sky-500">Descripción</p>
              <p className="text-sm text-sky-800">{descripcion}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <DataCard label="Categoría" value={categoria} />
            <DataCard label="Proveedor" value={proveedor} />
          </div>
          <p className="text-[11px] text-sky-400">
            El proveedor corresponde a la compra registrada más reciente con este producto.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <DataCard label="Precio compra" value={`Q ${fmt(precio_compra)}`} />
            <DataCard label="Precio venta" value={`Q ${fmt(precio_venta)}`} />
            <div className={`col-span-2 flex justify-between rounded-xl border px-4 py-3 ${stockColor}`}>
              <span className="text-xs uppercase">Cantidad disponible</span>
              <span className="font-bold">{cantidad_disponible}</span>
            </div>
          </div>

          <p className="text-xs text-sky-500">
            Para aumentar existencias, registre una compra en el módulo de compras.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-sky-100 bg-sky-50 px-5 py-4">
          <Link
            to="/compras"
            onClick={onClose}
            className="rounded-lg border border-sky-300 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            Ir a compras
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
      <p className="text-xs text-sky-400">{label}</p>
      <p className="font-semibold text-sky-800">{value}</p>
    </div>
  );
}
