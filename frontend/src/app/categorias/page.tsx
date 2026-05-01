import { useEffect, useState } from "react";
import { CategoryCard } from "../../components/categoria/CategoryCard";
import { apiClient } from "../../lib/apiClient";
import type { Categoria } from "../../types/categoria";

export default function CategoriasPage() {
  const [items, setItems] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const data = await apiClient.get<Categoria[]>("/categorias/");
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar las categorías");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="font-sans text-[0.9375rem] text-[#333]">
        Cargando categorías…
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-sans text-[0.9375rem] text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4">
      <h1 className="font-sans text-2xl font-bold text-[#0a0a0a] mb-6">
        Categorías
      </h1>

      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-3 
        xl:grid-cols-5 
        gap-4 
        md:gap-6
      ">
        {items.map((c) => (
          <CategoryCard key={c.id_categoria} categoria={c} />
        ))}
      </div>
    </div>
  );
}