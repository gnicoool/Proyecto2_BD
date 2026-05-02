import { useCallback, useEffect, useState } from "react";
import { ProductoCard } from "../../components/producto/ProductoCard";
import { ProductoDetalle, type Producto } from "../../components/producto/ProductoDetalle";
import { FloatingButton } from "../../components/Layout/botonflotante";
import { NuevoProductoModal } from "../../components/modal/NuevoProducto/NuevoProductoModal";
import { apiClient } from "../../lib/apiClient";
import { adminNitHeaders } from "../../lib/adminHeaders";
import { useAuth } from "../../hooks/useAuth";

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
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);

  const adminHeaders = user ? adminNitHeaders(user.nit_empleado) : undefined;

  const loadProductos = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const prodRows = await apiClient.get<ProductoApi[]>("/productos/");
      let marcasById = new Map<number, string>();
      try {
        const marcaRows = await apiClient.get<MarcaApi[]>("/marcas/");
        marcasById = new Map(marcaRows.map((m) => [m.id_marca, m.nombre]));
      } catch {
        /* Marca names optional */
      }
      setProductos(mapProductos(prodRows, marcasById));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProductos();
  }, [loadProductos]);

  if (loading) {
    return (
      <p className="font-sans text-[0.9375rem] text-[#333]">Cargando productos…</p>
    );
  }

  return (
    <>
      <div className="relative mx-auto max-w-[90rem] px-4 pb-28">
        <h1 className="mb-6 font-sans text-2xl font-bold text-[#0a0a0a]">Productos</h1>

        {error ? (
          <p className="font-sans text-[0.9375rem] text-red-600">{error}</p>
        ) : productos.length === 0 ? (
          <p className="font-sans text-[0.9375rem] text-[#555]">No hay productos registrados.</p>
        ) : (
          <ProductoGrid productos={productos} />
        )}
      </div>

      <FloatingButton ariaLabel="Nuevo producto" onClick={() => setNuevoOpen(true)} />

      <NuevoProductoModal
        open={nuevoOpen}
        onClose={() => setNuevoOpen(false)}
        onSuccess={() => void loadProductos()}
        requestHeaders={adminHeaders}
      />
    </>
  );
}
