import { useCallback, useEffect, useState } from "react";
import { FloatingButton } from "../Layout/botonflotante";
import { NuevaMarcaModal } from "../modal/NuevaMarca/NuevaMarcaModal";
import { apiClient } from "../../lib/apiClient";

type Marca = { id: number; nombre: string };

type Props = {
  showAdminActions: boolean;
};

export function MarcasCatalogoView({ showAdminActions }: Props) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevaOpen, setNuevaOpen] = useState(false);

  const loadMarcas = useCallback(async () => {
    try {
      const data = await apiClient.get<Marca[]>("/marcas");
      setMarcas(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las marcas.");
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      if (isMounted) setLoading(true);
      await loadMarcas();
    };
    void fetchAll();
    return () => {
      isMounted = false;
    };
  }, [loadMarcas]);

  if (loading) {
    return <p className="font-sans text-[0.9375rem] text-[#333]">Cargando marcas…</p>;
  }

  return (
    <>
      <div className="relative mx-auto max-w-[90rem] px-4 pb-28">
        <h1 className="mb-6 font-sans text-2xl font-bold text-[#0a0a0a]">Marcas</h1>

        {error ? (
          <p className="font-sans text-[0.9375rem] text-red-600">{error}</p>
        ) : marcas.length === 0 ? (
          <p className="font-sans text-[0.9375rem] text-[#555]">No hay marcas registradas.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {marcas.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-center rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 shadow-sm"
              >
                {m.nombre}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdminActions ? (
        <>
          <FloatingButton ariaLabel="Nueva marca" onClick={() => setNuevaOpen(true)} />

          <NuevaMarcaModal
            open={nuevaOpen}
            onClose={() => setNuevaOpen(false)}
            onSuccess={() => void loadMarcas()}
          />
        </>
      ) : null}
    </>
  );
}
