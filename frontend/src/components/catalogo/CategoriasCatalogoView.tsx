import { useCallback, useEffect, useState } from "react";
import { CategoryCard } from "../categoria/CategoryCard";
import { FloatingButton } from "../Layout/botonflotante";
import { NuevaCategoriaModal } from "../modal/NuevaCategoria/NuevaCategoriaModal";
import { apiClient } from "../../lib/apiClient";
import type { Categoria } from "../../types/categoria";

type Props = {
  showAdminActions: boolean;
  productosListPath?: string;
};

export function CategoriasCatalogoView({
  showAdminActions,
  productosListPath = "/productos",
}: Props) {
  const [items, setItems] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevaOpen, setNuevaOpen] = useState(false);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await apiClient.get<Categoria[]>("/categorias/");
      setItems(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las categorías");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      if (isMounted) setLoading(true);
      await loadCategorias();
    };
    void fetchAll();
    return () => {
      isMounted = false;
    };
  }, [loadCategorias]);

  if (loading) {
    return (
      <p className="font-sans text-[0.9375rem] text-[#333]">Cargando categorías…</p>
    );
  }

  return (
    <>
      <div className="relative mx-auto max-w-[90rem] px-4 pb-28">
        <h1 className="mb-6 font-sans text-2xl font-bold text-[#0a0a0a]">Categorías</h1>

        {error ? (
          <p className="font-sans text-[0.9375rem] text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="font-sans text-[0.9375rem] text-[#555]">No hay categorías registradas.</p>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              md:grid-cols-3
              md:gap-6
              xl:grid-cols-5
            "
          >
            {items.map((c) => (
              <CategoryCard
                key={c.id_categoria}
                categoria={c}
                productosListPath={productosListPath}
              />
            ))}
          </div>
        )}
      </div>

      {showAdminActions ? (
        <>
          <FloatingButton ariaLabel="Nueva categoría" onClick={() => setNuevaOpen(true)} />

          <NuevaCategoriaModal
            key={nuevaOpen ? "open" : "closed"}
            open={nuevaOpen}
            onClose={() => setNuevaOpen(false)}
            onSuccess={() => void loadCategorias()}
          />
        </>
      ) : null}
    </>
  );
}
