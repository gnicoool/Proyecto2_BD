import { useCallback, useEffect, useState } from "react";
import { PersonasTable, type PersonaRow } from "../../components/personas/tablepersona";
import { apiClient } from "../../lib/apiClient";
import { adminNitHeaders } from "../../lib/adminHeaders";
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
  const { user } = useAuth();
  const [rows, setRows] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.nit_empleado) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<EmpleadoListItem[]>("/empleados/", {
        headers: adminNitHeaders(user.nit_empleado),
      });
      setRows(data.map(mapEmpleado));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar empleados");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user?.nit_empleado]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (nit: string) => {
    if (!user?.nit_empleado) return;
    if (
      !window.confirm(
        "¿Eliminar o desactivar este empleado? Los administradores no pueden eliminarse desde aquí.",
      )
    ) {
      return;
    }
    try {
      await apiClient.delete(`/empleados/${encodeURIComponent(nit)}`, {
        headers: adminNitHeaders(user.nit_empleado),
      });
      await load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="mb-2 font-sans text-2xl font-bold text-neutral-950">Empleados</h1>
      <p className="mb-6 font-sans text-[0.9375rem] text-neutral-700">
        Usuarios del sistema: rol, ventas registradas y estado.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-600">Cargando…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <PersonasTable
          data={rows}
          tipo="empleado"
          onView={(nit) => {
            window.alert(
              `Ventas del empleado NIT ${nit}: puedes consultar GET /ventas/empleado/{nit}/todas como admin (UI próxima).`,
            );
          }}
          onEdit={(nit) => {
            window.alert(`Edición de empleado ${nit} — formulario pendiente.`);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
