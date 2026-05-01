import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PersonasTable, type PersonaRow } from "../../components/personas/tablepersona";
import { NuevoProveedorModal } from "../../components/modal/NuevaPersona/proveedor/NuevoProveedorModal";
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
  const [items, setItems] = useState<ProveedorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProveedor, setEditProveedor] = useState<ProveedorListItem | null>(null);

  const rows = useMemo(() => items.map(mapProveedor), [items]);

  const load = useCallback(async () => {
    if (!user?.nit_empleado) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ProveedorListItem[]>("/proveedores/", {
        headers: adminNitHeaders(user.nit_empleado),
      });
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar proveedores");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.nit_empleado]);

  useEffect(() => {
    void load();
  }, [load]);

  const closeModal = () => {
    setCreateOpen(false);
    setEditProveedor(null);
  };

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

  const openEdit = (nit: string) => {
    const row = items.find((p) => p.nit_proveedor === nit);
    if (!row) return;
    setCreateOpen(false);
    setEditProveedor(row);
  };

  const modalOpen = createOpen || editProveedor !== null;

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-sans text-2xl font-bold text-neutral-950">Proveedores</h1>
          <p className="font-sans text-[0.9375rem] text-neutral-700">
            Proveedores registrados y total de compras asociadas en el sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditProveedor(null);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nuevo proveedor
        </button>
      </div>

      <NuevoProveedorModal
        open={modalOpen}
        onClose={closeModal}
        onSuccess={() => void load()}
        requestHeaders={user?.nit_empleado ? adminNitHeaders(user.nit_empleado) : undefined}
        editProveedor={editProveedor}
      />

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
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
