import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PersonasTable, type PersonaRow } from "../../components/personas/tablepersona";
import { NuevoEmpleadoModal } from "../../components/modal/NuevaPersona/empleado/NuevoEmpleadoModal";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../hooks/useAuth";
import type { EmpleadoListItem } from "../../types/empleado";

function mapEmpleado(e: EmpleadoListItem): PersonaRow {
  return {
    nit: e.nit_empleado,
    nombre: e.nombre,
    telefono: e.tel_empleado ?? "",
    correo: e.correo,
    activo: e.activo,
    detalle: `${e.total_ventas} venta(s) · ${e.nombre_rol}`,
  };
}

export default function EmpleadosPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<EmpleadoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEmpleado, setEditEmpleado] = useState<EmpleadoListItem | null>(null);

  const rows = useMemo(() => items.map(mapEmpleado), [items]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<EmpleadoListItem[]>("/empleados/");
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar empleados");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const closeModal = () => {
    setCreateOpen(false);
    setEditEmpleado(null);
  };

  const handleDelete = async (nit: string) => {
    if (!window.confirm("¿Eliminar o desactivar este empleado? Los administradores no pueden eliminarse desde aquí.")) {
      return;
    }
    try {
      await apiClient.delete(`/empleados/${encodeURIComponent(nit)}`);
      await load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  const openEdit = (nit: string) => {
    const row = items.find((e) => e.nit_empleado === nit);
    if (!row) return;
    setCreateOpen(false);
    setEditEmpleado(row);
  };

  const modalOpen = createOpen || editEmpleado !== null;

  const verVentasEmpleado = (nit: string) => {
    const e = items.find((x) => x.nit_empleado === nit);
    const params = new URLSearchParams({ nit_empleado: nit, nombre: e?.nombre ?? "" });
    navigate(`/ventas?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-sans text-2xl font-bold text-neutral-950">Empleados</h1>
          <p className="font-sans text-[0.9375rem] text-neutral-700">
            Usuarios del sistema: rol, ventas registradas y estado.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => { setEditEmpleado(null); setCreateOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nuevo empleado
          </button>
        )}
      </div>

      {isAdmin && (
        <NuevoEmpleadoModal
          open={modalOpen}
          onClose={closeModal}
          onSuccess={() => void load()}
          editEmpleado={editEmpleado}
        />
      )}

      {loading ? (
        <p className="text-sm text-neutral-600">Cargando…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="flex w-full justify-center">
          <div className="w-full min-w-0">
            <PersonasTable
              data={rows}
              tipo="empleado"
              onView={verVentasEmpleado}
              onEdit={isAdmin ? openEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
