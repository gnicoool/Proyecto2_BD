import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { adminNitHeaders } from "../../lib/adminHeaders";
import { ROUTES } from "../../lib/authRoutes";
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

export default function ComprasPage() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<CompraListaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCompraId, setModalCompraId] = useState<number | null>(null);
  const [nuevaOpen, setNuevaOpen] = useState(false);

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

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.misVentas} replace />;
  }

  const adminHeaders = adminNitHeaders(user.nit_empleado);

  return (
    <>
      <div className="relative mx-auto max-w-6xl px-4 pb-28">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Compras</h1>

        <p className="mb-6 text-sm text-neutral-600">
          Registro de compras a proveedores. Consulta el detalle de productos por línea o registra
          una nueva compra (productos asociados al historial del proveedor seleccionado).
        </p>

        {loading ? (
          <p className="text-sm text-neutral-600">Cargando compras…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <VentasTable
            rows={rows.map(mapCompraToRow)}
            contraparteLabel="Proveedor"
            emptyMessage="No hay compras registradas."
            verProductosLabel="Ver productos"
            onVerProductos={(id) => setModalCompraId(id)}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setNuevaOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        aria-label="Nueva compra"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <CompraProductosModal
        open={modalCompraId !== null}
        idCompra={modalCompraId}
        onClose={() => setModalCompraId(null)}
      />

      <NuevaCompraModal
        open={nuevaOpen}
        onClose={() => setNuevaOpen(false)}
        onSuccess={() => void loadCompras()}
        requestHeaders={adminHeaders}
      />
    </>
  );
}
