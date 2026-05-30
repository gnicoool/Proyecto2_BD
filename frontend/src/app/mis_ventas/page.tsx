import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { ROUTES } from "../../lib/authRoutes";
import { useAuth } from "../../hooks/useAuth";
import type { NuevaVentaDraftLine } from "../../context/nuevaVentaDraftTypes";
import { useNuevaVentaDraft } from "../../context/useNuevaVentaDraft";
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
  const location = useLocation();
  const navigate = useNavigate();
  const draft = useNuevaVentaDraft();

  const [rows, setRows] = useState<VentaCabecera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVentaId, setModalVentaId] = useState<number | null>(null);
  const [nuevaVentaOpen, setNuevaVentaOpen] = useState(false);
  const [draftSnapshotForModal, setDraftSnapshotForModal] = useState<NuevaVentaDraftLine[] | null>(
    null,
  );
  const [cartHint, setCartHint] = useState<string | null>(null);

  const loadVentas = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.get<VentaCabecera[]>("/ventas/mis");
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVentas();
  }, [loadVentas]);

  useEffect(() => {
    const st = location.state as { finalizeSale?: boolean } | undefined;
    if (!st?.finalizeSale) return;
    const lineasSnapshot = draft.lineas.map((l) => ({ ...l }));
    const total = draft.totalLineas;
    navigate(".", { replace: true, state: {} });
    void Promise.resolve().then(() => {
      if (total > 0) {
        setDraftSnapshotForModal(lineasSnapshot);
        setNuevaVentaOpen(true);
        setCartHint(null);
      } else {
        setCartHint("Tu carrito está vacío. Dirígete a Productos para agregar artículos antes de finalizar la venta.");
      }
    });
  }, [location.state, navigate, draft]);

  if (loading) {
    return <p className="text-sm text-neutral-600">Cargando ventas…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const handleCloseNuevaVenta = () => {
    setNuevaVentaOpen(false);
    setDraftSnapshotForModal(null);
    draft.clearDraft();
  };

  return (
    <>
      <div className="relative mx-auto max-w-5xl px-4 pb-10">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Mis ventas</h1>

        <p className="mb-4 text-sm text-neutral-600">
          Ventas registradas a tu nombre ({user.nombre} · NIT {user.nit_empleado}).
        </p>

        <p className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Para registrar una venta, ve a{" "}
          <Link
            to={ROUTES.tiendaProductos}
            className="font-semibold text-sky-700 underline decoration-sky-400 underline-offset-2 hover:text-sky-900"
          >
            Productos
          </Link>
          , agrega artículos al carrito con el botón «Agregar» y luego usa el icono del carrito en
          la barra superior para finalizar la venta.
        </p>

        {cartHint ? (
          <p
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            {cartHint}
          </p>
        ) : null}

        <VentasTable
          rows={rows.map(mapCabeceraToRow)}
          contraparteLabel="Cliente"
          emptyMessage="No hay ventas asignadas."
          onVerProductos={(id) => setModalVentaId(id)}
        />
      </div>

      <VentaProductosModal
        open={modalVentaId !== null}
        idVenta={modalVentaId}
        onClose={() => setModalVentaId(null)}
      />

      <NuevaVentaModal
        open={nuevaVentaOpen}
        onClose={handleCloseNuevaVenta}
        nitEmpleado={user.nit_empleado}
        initialDraftLines={draftSnapshotForModal?.length ? draftSnapshotForModal : null}
        onCreated={() => {
          draft.clearDraft();
          setDraftSnapshotForModal(null);
          setNuevaVentaOpen(false);
          void loadVentas();
        }}
      />
    </>
  );
}

export default function MisVentasPage() {
  const { user } = useAuth();

  if (!user) return null;

  return <MisVentasContent user={user} />;
}
