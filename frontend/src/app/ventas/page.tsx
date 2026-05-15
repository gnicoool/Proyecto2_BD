import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
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

function parseEmpleadoVentasFilter(searchParams: URLSearchParams): {
  nit: string | null;
  nombreLabel: string | null;
} {
  const nit = searchParams.get("nit_empleado")?.trim() || null;
  if (!nit) return { nit: null, nombreLabel: null };
  const nombre = searchParams.get("nombre")?.trim() || null;
  return { nit, nombreLabel: nombre };
}

export default function VentasPage() {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const filtroEmpleado = useMemo(() => parseEmpleadoVentasFilter(searchParams), [searchParams]);

  const [rows, setRows] = useState<VentaCabecera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVentaId, setModalVentaId] = useState<number | null>(null);
  
  const rowsFiltradas = useMemo(() => {
    if (!filtroEmpleado.nit) return rows;
    return rows.filter((v) => (v.nit_empleado ?? "").trim() === filtroEmpleado.nit);
  }, [rows, filtroEmpleado.nit]);

  const loadVentas = useCallback(async () => {
    try {
      const data = await apiClient.get<VentaCabecera[]>("/ventas/");
      setRows(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las ventas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async() => {
      if(isMounted) setLoading(true);
      await loadVentas();
    };
    void fetchAll();
    return () => {
      isMounted = false;
    }
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

        {filtroEmpleado.nit ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
            <p className="text-sm text-sky-900">
              <span className="font-semibold">Filtro vendedor:</span>{" "}
              {filtroEmpleado.nombreLabel || `NIT ${filtroEmpleado.nit}`}{" "}
              <span className="font-mono text-xs text-sky-800">({filtroEmpleado.nit})</span>
            </p>
            <Link
              to="/ventas"
              className="text-sm font-semibold text-sky-800 underline decoration-sky-400 underline-offset-2 hover:text-sky-950"
            >
              Ver todas las ventas
            </Link>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-neutral-600">Cargando ventas…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="flex w-full justify-center">
            <div className="w-full min-w-0">
              <VentasTable
                rows={rowsFiltradas.map(mapCabeceraToRow)}
                contraparteLabel="Cliente"
                emptyMessage={
                  filtroEmpleado.nit
                    ? "No hay ventas registradas para este vendedor."
                    : "No hay ventas registradas."
                }
                showEmpleadoColumn
                empleadoColumnLabel="Vendedor"
                onVerProductos={(id) => setModalVentaId(id)}
              />
            </div>
          </div>
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
