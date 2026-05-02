import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";
import type { VentaCabecera, VentaTablaRow } from "../../types/venta";
import { VentasTable } from "../../components/personas/tableventas";
import { VentaProductosModal } from "../../components/modal/ventas/VentaProductosModal";

function mapCabeceraToRow(v: VentaCabecera): VentaTablaRow {
  return {
    id: v.id_venta,
    fecha: String(v.fecha),
    total: v.total,
    contraparte: v.cliente_nombre,
    empleadoNombre: v.empleado_nombre,
    nitEmpleado: v.nit_empleado,
  };
}

export default function VentasPage() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<VentaCabecera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVentaId, setModalVentaId] = useState<number | null>(null);

  const loadVentas = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.get<VentaCabecera[]>("/ventas/");
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las ventas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVentas();
  }, [loadVentas]);

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.misVentas} replace />;
  }

  return (
    <>
      <div className="relative mx-auto max-w-6xl px-4 pb-8">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Todas las ventas</h1>

        <p className="mb-6 text-sm text-neutral-600">
          Listado global de ventas por todos los vendedores. Usa «Ver productos» para el detalle de
          cada venta.
        </p>

        {loading ? (
          <p className="text-sm text-neutral-600">Cargando ventas…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <VentasTable
            rows={rows.map(mapCabeceraToRow)}
            contraparteLabel="Cliente"
            emptyMessage="No hay ventas registradas."
            showEmpleadoColumn
            empleadoColumnLabel="Vendedor"
            onVerProductos={(id) => setModalVentaId(id)}
          />
        )}
      </div>

      <VentaProductosModal
        open={modalVentaId !== null}
        idVenta={modalVentaId}
        onClose={() => setModalVentaId(null)}
      />
    </>
  );
}
