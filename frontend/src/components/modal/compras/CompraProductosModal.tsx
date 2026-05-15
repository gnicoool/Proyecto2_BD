import { useEffect, useState } from "react";
import { X, Printer } from "lucide-react";
import { apiClient } from "../../../lib/apiClient";
import type { CompraDetalleRespuesta } from "../../../types/compra";
import { formatFechaVenta, formatMonto } from "../../../lib/formato/formatos";

function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

type Props = {
  open: boolean;
  idCompra: number | null;
  onClose: () => void;
};

export function CompraProductosModal({ open, idCompra, onClose }: Props) {
  const [data, setData] = useState<CompraDetalleRespuesta | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || idCompra == null) {
      return;
    }
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setErr(null);
      setData(null);
      try {
        const res = await apiClient.get<CompraDetalleRespuesta>(
          `/compras/${idCompra}/detalle`,
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Error al cargar el detalle");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, idCompra]);

  if (!open) return null;

  const subtotal =
    data?.lineas?.reduce(
      (s, l) => s + toNum(l.precio_compra) * l.cantidad_compra,
      0,
    ) ?? 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compra-productos-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <h2 id="compra-productos-title" className="text-base font-semibold text-emerald-900">
            Detalle de compra
          </h2>
          <div className="flex items-center gap-1">
            {data ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg p-1.5 text-emerald-500 transition hover:bg-emerald-100 hover:text-emerald-800"
                aria-label="Imprimir"
              >
                <Printer className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-emerald-500 transition hover:bg-emerald-100 hover:text-emerald-800"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="py-4 text-sm text-emerald-700">Cargando…</p>
          ) : err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {err}
            </p>
          ) : data && data.lineas.length === 0 ? (
            <p className="py-4 text-sm text-emerald-600">Sin líneas en esta compra.</p>
          ) : data ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
                      Compra a proveedor
                    </p>
                    <p className="text-lg font-bold text-emerald-900">
                      {data.compra.proveedor_nombre}
                    </p>
                    <p className="font-mono text-xs text-emerald-700">{data.compra.nit_proveedor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-emerald-500">No.</p>
                    <p className="text-base font-bold text-emerald-800">#{data.compra.id_compra}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <span className="text-emerald-500">Fecha</span>
                  <p className="font-medium text-emerald-900">
                    {formatFechaVenta(String(data.compra.fecha))}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-emerald-100">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-600">
                  <span>Producto</span>
                  <span className="text-right">P/U compra</span>
                  <span className="text-center">Cant.</span>
                  <span className="text-right">Total</span>
                </div>
                <ul className="divide-y divide-emerald-50">
                  {data.lineas.map((ln) => (
                    <li
                      key={ln.id_producto}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-4 py-2.5 text-sm"
                    >
                      <span className="truncate font-medium text-emerald-950">
                        {ln.nombre ?? `Producto #${ln.id_producto}`}
                      </span>
                      <span className="whitespace-nowrap text-right tabular-nums text-emerald-700">
                        Q {formatMonto(ln.precio_compra)}
                      </span>
                      <span className="text-center tabular-nums font-medium text-emerald-800">
                        {ln.cantidad_compra}
                      </span>
                      <span className="whitespace-nowrap text-right font-semibold tabular-nums text-emerald-900">
                        Q {formatMonto(toNum(ln.precio_compra) * ln.cantidad_compra)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-1 border-t border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">Q {formatMonto(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-emerald-200 pt-2">
                    <span className="text-sm font-bold text-emerald-800">Total</span>
                    <span className="text-lg font-bold tabular-nums text-emerald-900">
                      Q {formatMonto(data.compra.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
