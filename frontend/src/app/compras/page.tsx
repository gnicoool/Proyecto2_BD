import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../hooks/useAuth";
import type { CompraListaItem } from "../../types/compra";
import type { VentaTablaRow } from "../../types/venta";
import { VentasTable } from "../../components/personas/tableventas";
import { CompraProductosModal } from "../../components/modal/compras/CompraProductosModal";
import { NuevaCompraModal } from "../../components/modal/compras/NuevaCompraModal";

function mapCompraToRow(c: CompraListaItem): VentaTablaRow {
  return {
    id: c.id_compra,
    fecha: String(c.fecha),
    total: c.total,
    contraparte: c.proveedor_nombre,
  };
}

function parseProveedorComprasFilter(searchParams: URLSearchParams): {
  nit: string | null;
  nombreLabel: string | null;
} {
  const nit = searchParams.get("nit_proveedor")?.trim() || null;
  if (!nit) return { nit: null, nombreLabel: null };
  const nombre = searchParams.get("nombre")?.trim() || null;
  return { nit, nombreLabel: nombre };
}

export default function ComprasPage() {
  const { user, hasRol } = useAuth();
  const [searchParams] = useSearchParams();
  const filtroProveedor = useMemo(() => parseProveedorComprasFilter(searchParams), [searchParams]);

  const [rows, setRows] = useState<CompraListaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCompraId, setModalCompraId] = useState<number | null>(null);
  const [nuevaOpen, setNuevaOpen] = useState(false);

  const puedeCrear = hasRol("Admin", "Bodeguero");

  const loadCompras = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.get<CompraListaItem[]>("/compras/");
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las compras");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompras();
  }, [loadCompras]);

  if (!user) return null;

  const rowsFiltradas = useMemo(() => {
    if (!filtroProveedor.nit) return rows;
    return rows.filter((r) => r.nit_proveedor === filtroProveedor.nit);
  }, [rows, filtroProveedor.nit]);

  return (
    <>
      <div className="relative mx-auto max-w-6xl px-4 pb-28">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Compras</h1>
        <p className="mb-6 text-sm text-neutral-600">
          Registro de compras a proveedores. Consulta el detalle de productos por línea
          {puedeCrear ? " o registra una nueva compra." : "."}
        </p>

        {filtroProveedor.nit ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-900">
              <span className="font-semibold">Filtro proveedor:</span>{" "}
              {filtroProveedor.nombreLabel || `NIT ${filtroProveedor.nit}`}{" "}
              <span className="font-mono text-xs text-emerald-800">({filtroProveedor.nit})</span>
            </p>
            <Link
              to="/compras"
              className="text-sm font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-950"
            >
              Ver todas las compras
            </Link>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-neutral-600">Cargando compras…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="flex w-full justify-center">
            <div className="w-full min-w-0">
              <VentasTable
                rows={rowsFiltradas.map(mapCompraToRow)}
                contraparteLabel="Proveedor"
                emptyMessage={
                  filtroProveedor.nit
                    ? "No hay compras registradas para este proveedor."
                    : "No hay compras registradas."
                }
                verProductosLabel="Ver productos"
                onVerProductos={(id) => setModalCompraId(id)}
              />
            </div>
          </div>
        )}
      </div>

      {puedeCrear && (
        <button
          type="button"
          onClick={() => setNuevaOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          aria-label="Nueva compra"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>
      )}

      <CompraProductosModal
        open={modalCompraId !== null}
        idCompra={modalCompraId}
        onClose={() => setModalCompraId(null)}
      />

      {puedeCrear && (
        <NuevaCompraModal
          open={nuevaOpen}
          onClose={() => setNuevaOpen(false)}
          onSuccess={() => void loadCompras()}
        />
      )}
    </>
  );
}
