import { useCallback, useEffect, useState } from "react";
import { PersonasTable, type PersonaRow } from "../../components/personas/tablepersona";
import { apiClient } from "../../lib/apiClient";
import { adminNitHeaders } from "../../lib/adminHeaders";
import { useAuth } from "../../hooks/useAuth";
import type { ProveedorListItem } from "../../types/proveedor";

function mapProveedor(p: ProveedorListItem): PersonaRow {
  return {
    nit: p.nit_proveedor,
    nombre: p.nombre,
    telefono: p.tel_proveedor,
    correo: p.correo,
    activo: p.activo,
    detalle: `${p.total_compras} compra(s) registrada(s)`,
  };
}

export default function ProveedoresPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.nit_empleado) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ProveedorListItem[]>("/proveedores/", {
        headers: adminNitHeaders(user.nit_empleado),
      });
      setRows(data.map(mapProveedor));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar proveedores");
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
        "¿Desactivar o eliminar este proveedor? Si tiene compras, solo se desactivará.",
      )
    ) {
      return;
    }
    try {
      await apiClient.delete(`/proveedores/${encodeURIComponent(nit)}`, {
        headers: adminNitHeaders(user.nit_empleado),
      });
      await load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="mb-2 font-sans text-2xl font-bold text-neutral-950">Proveedores</h1>
      <p className="mb-6 font-sans text-[0.9375rem] text-neutral-700">
        Proveedores registrados y total de compras asociadas en el sistema.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-600">Cargando…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <PersonasTable
          data={rows}
          tipo="proveedor"
          onView={(nit) => {
            window.alert(
              `Compras del proveedor NIT ${nit}: revisa informes o el módulo de compras (vista en construcción).`,
            );
          }}
          onEdit={(nit) => {
            window.alert(`Edición de proveedor ${nit} — formulario pendiente.`);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
