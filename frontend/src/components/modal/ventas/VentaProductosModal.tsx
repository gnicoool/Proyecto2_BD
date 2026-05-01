import { useEffect, useState } from "react";
import { X, Printer } from "lucide-react";
import { apiClient } from "../../../lib/apiClient";
import type { VentaDetalleRespuesta } from "../../../types/venta";
import { formatFechaVenta, formatMonto } from "../../personas/tableventas";

function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

type Props = {
  open: boolean;
  idVenta: number | null;
  onClose: () => void;
};

export function VentaProductosModal({ open, idVenta, onClose }: Props) {
  const [data, setData] = useState<VentaDetalleRespuesta | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || idVenta == null) {
      setData(null);
      setErr(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const res = await apiClient.get<VentaDetalleRespuesta>(`/ventas/${idVenta}`);
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
    return () => { cancelled = true; };
  }, [open, idVenta]);

  if (!open) return null;

  const subtotal =
    data?.lineas?.reduce((s, l) => s + toNum(l.precio_venta) * l.cantidad_venta, 0) ?? 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="venta-productos-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-sky-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50 px-5 py-4">
          <h2 id="venta-productos-title" className="text-base font-semibold text-sky-900">
            Detalle de Venta
          </h2>
          <div className="flex items-center gap-1">
            {data && (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg p-1.5 text-sky-400 transition hover:bg-sky-100 hover:text-sky-700"
                aria-label="Imprimir factura"
              >
                <Printer className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-sky-400 transition hover:bg-sky-100 hover:text-sky-700"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-sky-600 py-4">Cargando…</p>
          ) : err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {err}
            </p>
          ) : data && data.lineas.length === 0 ? (
            <p className="text-sm text-sky-500 py-4">Sin líneas en esta venta.</p>
          ) : data ? (
            <div className="space-y-4">

              {/* ── Factura header ──────────────────────────────────────── */}
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <div className="flex items-start justify-between">
                  {/* Logo / marca */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                      Supermercado
                    </p>
                    <p className="text-lg font-bold text-sky-800">FrescaMart</p>
                  </div>
                  {/* No. de venta */}
                  <div className="text-right">
                    <p className="text-xs text-sky-400 uppercase tracking-wide">Factura</p>
                    <p className="text-base font-bold text-sky-700">#{idVenta}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                  <div>
                    <span className="text-sky-400">Fecha</span>
                    <p className="font-medium text-sky-800">
                      {formatFechaVenta(String(data.venta.fecha))}
                    </p>
                  </div>
                  {data.venta.cliente_nombre ? (
                    <div>
                      <span className="text-sky-400">Cliente</span>
                      <p className="font-medium text-sky-800">{data.venta.cliente_nombre}</p>
                    </div>
                  ) : null}
                  {data.venta.empleado_nombre ? (
                    <div>
                      <span className="text-sky-400">Vendedor</span>
                      <p className="font-medium text-sky-800">{data.venta.empleado_nombre}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ── Líneas ──────────────────────────────────────────────── */}
              <div className="overflow-hidden rounded-xl border border-sky-100">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 border-b border-sky-100 bg-sky-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-sky-500">
                  <span>Descripción</span>
                  <span className="text-right">P/U</span>
                  <span className="text-center">Cant.</span>
                  <span className="text-right">Total</span>
                </div>

                <ul className="divide-y divide-sky-50">
                  {data.lineas.map((ln) => (
                    <li
                      key={ln.id_producto}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium text-sky-900 truncate">
                        {ln.nombre ?? `Producto #${ln.id_producto}`}
                      </span>
                      <span className="tabular-nums text-sky-500 text-right whitespace-nowrap">
                        Q {formatMonto(ln.precio_venta)}
                      </span>
                      <span className="tabular-nums text-center text-sky-700 font-medium">
                        {ln.cantidad_venta}
                      </span>
                      <span className="tabular-nums font-semibold text-sky-800 text-right whitespace-nowrap">
                        Q {formatMonto(toNum(ln.precio_venta) * ln.cantidad_venta)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Totales */}
                <div className="border-t border-sky-200 bg-sky-50 px-4 py-3 space-y-1">
                  <div className="flex justify-between text-xs text-sky-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">Q {formatMonto(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-sky-200 pt-2">
                    <span className="text-sm font-bold text-sky-700">Total</span>
                    <span className="tabular-nums text-lg font-bold text-sky-700">
                      Q {formatMonto(data.venta.total)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-sky-300">
                ¡Gracias por su compra!
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}