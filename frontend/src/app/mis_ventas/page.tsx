import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";
import type { LoginResponse } from "../../types/auth";
import type { VentaCabecera, VentaTablaRow } from "../../types/venta";
import { VentasTable } from "../../components/personas/tableventas";
import { VentaProductosModal } from "../../components/modal/ventas/VentaProductosModal";
import { NuevaVentaModal } from "../../components/modal/ventas/NuevaVenta/NuevaVentaModal";

function mapCabeceraToRow(v: VentaCabecera): VentaTablaRow {
  return {
    id: v.id_venta,
    fecha: String(v.fecha),
    total: v.total,
    contraparte: v.cliente_nombre,
  };
}

function MisVentasContent({ user }: { user: LoginResponse }) {
  const [rows, setRows] = useState<VentaCabecera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVentaId, setModalVentaId] = useState<number | null>(null);
  const [nuevaVentaOpen, setNuevaVentaOpen] = useState(false);

  const loadVentas = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.get<VentaCabecera[]>("/ventas/mis", {
        headers: {
          "X-NIT-Empleado": user.nit_empleado,
        },
      });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }, [user.nit_empleado]);

  useEffect(() => {
    void loadVentas();
  }, [loadVentas]);

  if (loading) {
    return <p className="text-sm text-neutral-600">Cargando ventas…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <>
      <div className="relative mx-auto max-w-5xl px-4 pb-24">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Mis ventas</h1>

        <p className="mb-6 text-sm text-neutral-600">
          Ventas registradas a tu nombre ({user.nombre} · NIT {user.nit_empleado}).
        </p>

        <VentasTable
          rows={rows.map(mapCabeceraToRow)}
          contraparteLabel="Cliente"
          emptyMessage="No hay ventas asignadas."
          onVerProductos={(id) => setModalVentaId(id)}
        />
      </div>

      <button
        type="button"
        onClick={() => setNuevaVentaOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        aria-label="Nueva venta"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <VentaProductosModal
        open={modalVentaId !== null}
        idVenta={modalVentaId}
        onClose={() => setModalVentaId(null)}
      />

      <NuevaVentaModal
        open={nuevaVentaOpen}
        onClose={() => setNuevaVentaOpen(false)}
        nitEmpleado={user.nit_empleado}
        onCreated={() => void loadVentas()}
      />
    </>
  );
}

export default function MisVentasPage() {
  const { user, isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to={ROUTES.categorias} replace />;
  }

  if (!user) {
    return null;
  }

  return <MisVentasContent user={user} />;
}
