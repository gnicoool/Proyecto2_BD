import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PersonasTable, type PersonaRow } from "../../components/personas/tablepersona";
import { NuevoProveedorModal } from "../../components/modal/NuevaPersona/proveedor/NuevoProveedorModal";
import { apiClient } from "../../lib/apiClient";
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
  const navigate = useNavigate();
  const { user, hasRol } = useAuth();
  const puedeGestionar = hasRol("Admin", "Supervisor");
  const [items, setItems] = useState<ProveedorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProveedor, setEditProveedor] = useState<ProveedorListItem | null>(null);

  const rows = useMemo(() => items.map(mapProveedor), [items]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ProveedorListItem[]>("/proveedores/");
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar proveedores");
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
    setEditProveedor(null);
  };

  const handleDelete = async (nit: string) => {
    if (!window.confirm("¿Desactivar o eliminar este proveedor? Si tiene compras, solo se desactivará.")) {
      return;
    }
    try {
      await apiClient.delete(`/proveedores/${encodeURIComponent(nit)}`);
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

  const verComprasProveedor = (nit: string) => {
    const p = items.find((x) => x.nit_proveedor === nit);
    const params = new URLSearchParams({ nit_proveedor: nit, nombre: p?.nombre ?? "" });
    navigate(`/compras?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-sans text-2xl font-bold text-neutral-950">Proveedores</h1>
          <p className="font-sans text-[0.9375rem] text-neutral-700">
            Proveedores registrados y total de compras asociadas en el sistema.
          </p>
        </div>
        {puedeGestionar && (
          <button
            type="button"
            onClick={() => { setEditProveedor(null); setCreateOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nuevo proveedor
          </button>
        )}
      </div>

      {puedeGestionar && (
        <NuevoProveedorModal
          open={modalOpen}
          onClose={closeModal}
          onSuccess={() => void load()}
          editProveedor={editProveedor}
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
              tipo="proveedor"
              onView={verComprasProveedor}
              onEdit={puedeGestionar ? openEdit : undefined}
              onDelete={puedeGestionar ? handleDelete : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
