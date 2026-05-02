import { useEffect, useState } from "react";
import { ProductoCard } from "../../components/producto/ProductoCard";
import { ProductoDetalle, type Producto } from "../../components/producto/ProductoDetalle";
import { apiClient } from "../../lib/apiClient";

type ProductoApi = {
  id_producto: number;
  nombre: string;
  descripcion?: string | null;
  precio_venta: string | number;
  precio_compra: string | number;
  cant_disponible: number;
  id_categoria: number;
  activo: boolean;
  id_marca: number;
  categoria_nombre?: string | null;
  proveedor_nombre?: string | null;
};

type MarcaApi = {
  id_marca: number;
  nombre: string;
};

function toNum(v: string | number): number {
  return typeof v === "number" ? v : Number(v);
}

function mapProductos(rows: ProductoApi[], marcasById: Map<number, string>): Producto[] {
  return rows.map((p) => ({
    id: p.id_producto,
    nombre: p.nombre,
    marca: marcasById.get(p.id_marca) ?? `Marca #${p.id_marca}`,
    categoria: p.categoria_nombre?.trim() || `Categoría #${p.id_categoria}`,
    proveedor: p.proveedor_nombre?.trim() || "Sin compras registradas",
    descripcion: p.descripcion ?? undefined,
    precio_compra: toNum(p.precio_compra),
    precio_venta: toNum(p.precio_venta),
    cantidad_disponible: p.cant_disponible,
    activo: p.activo,
  }));
}

function ProductoGrid({ productos }: { productos: Producto[] }) {
  const [selected, setSelected] = useState<Producto | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => (
          <ProductoCard key={p.id} producto={p} onVerDetalle={setSelected} />
        ))}
      </div>

      <ProductoDetalle producto={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const prodRows = await apiClient.get<ProductoApi[]>("/productos/");
        if (cancelled) return;
        let marcasById = new Map<number, string>();
        try {
          const marcaRows = await apiClient.get<MarcaApi[]>("/marcas/");
          marcasById = new Map(marcaRows.map((m) => [m.id_marca, m.nombre]));
        } catch {
          /* Missing /marcas route or server error: still show products with Marca #id fallback */
        }
        setProductos(mapProductos(prodRows, marcasById));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar los productos");
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
      <p className="font-sans text-[0.9375rem] text-[#333]">Cargando productos…</p>
    );
  }

  if (error) {
    return <p className="font-sans text-[0.9375rem] text-red-600">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-[90rem] px-4">
      <h1 className="mb-6 font-sans text-2xl font-bold text-[#0a0a0a]">Productos</h1>
      {productos.length === 0 ? (
        <p className="font-sans text-[0.9375rem] text-[#555]">No hay productos registrados.</p>
      ) : (
        <ProductoGrid productos={productos} />
      )}
    </div>
  );
}
