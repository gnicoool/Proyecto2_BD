import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductoCard } from "../../components/producto/ProductoCard";
import { ProductoDetalle, type Producto } from "../../components/producto/ProductoDetalle";
import { FloatingButton } from "../../components/Layout/botonflotante";
import { NuevoProductoModal } from "../../components/modal/NuevoProducto/NuevoProductoModal";
import type { ProductoEditInput } from "../../components/modal/NuevoProducto/FormNuevoProducto";
import { apiClient } from "../../lib/apiClient";
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
    id_categoria: p.id_categoria,
    id_marca: p.id_marca,
  }));
}

function toEditInput(p: Producto): ProductoEditInput {
  return {
    id_producto: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? null,
    precio_venta: p.precio_venta,
    precio_compra: p.precio_compra,
    cant_disponible: p.cantidad_disponible,
    id_categoria: p.id_categoria ?? 0,
    id_marca: p.id_marca ?? 0,
  };
}

function parseCategoriaFilter(searchParams: URLSearchParams): {
  id: number | null;
  nombreLabel: string | null;
} {
  const rawId = searchParams.get("id_categoria");
  const nombre = searchParams.get("nombre");
  if (!rawId) {
    return { id: null, nombreLabel: null };
  }
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id < 1) {
    return { id: null, nombreLabel: null };
  }
  const nombreLabel = nombre?.trim() ? nombre.trim() : null;
  return { id, nombreLabel };
}

type GridProps = {
  productos: Producto[];
  onEditar?: (p: Producto) => void;
};

function ProductoGrid({ productos, onEditar }: GridProps) {
  const [selected, setSelected] = useState<Producto | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => (
          <ProductoCard
            key={p.id}
            producto={p}
            onVerDetalle={setSelected}
            onEditar={onEditar}
          />
        ))}
      </div>

      <ProductoDetalle producto={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function ProductosPage() {
  const { hasRol } = useAuth();
  const puedeGestionar = hasRol("Admin", "Supervisor");
  const [searchParams] = useSearchParams();
  const filtroCategoria = useMemo(() => parseCategoriaFilter(searchParams), [searchParams]);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductoEditInput | null>(null);

  const loadProductos = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const path =
        filtroCategoria.id != null
          ? `/productos/categoria/${filtroCategoria.id}`
          : "/productos/";
      const prodRows = await apiClient.get<ProductoApi[]>(path);
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
  }, [filtroCategoria.id]);

  useEffect(() => {
    void loadProductos();
  }, [loadProductos]);

  const closeModal = () => {
    setNuevoOpen(false);
    setEditProduct(null);
  };

  const modalOpen = nuevoOpen || editProduct !== null;

  if (loading) {
    return (
      <p className="font-sans text-[0.9375rem] text-[#333]">Cargando productos…</p>
    );
  }

  return (
    <>
      <div className="relative mx-auto max-w-[90rem] px-4 pb-28">
        <h1 className="mb-6 font-sans text-2xl font-bold text-[#0a0a0a]">Productos</h1>

        {filtroCategoria.id != null ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
            <p className="font-sans text-sm text-sky-900">
              <span className="font-semibold">Filtro:</span>{" "}
              {filtroCategoria.nombreLabel?.trim() || `Categoría #${filtroCategoria.id}`}
            </p>
            <Link
              to="/productos"
              className="font-sans text-sm font-semibold text-sky-700 underline decoration-sky-400 underline-offset-2 hover:text-sky-900"
            >
              Ver todos los productos
            </Link>
          </div>
        ) : null}

        {error ? (
          <p className="font-sans text-[0.9375rem] text-red-600">{error}</p>
        ) : productos.length === 0 ? (
          <p className="font-sans text-[0.9375rem] text-[#555]">
            {filtroCategoria.id != null
              ? "No hay productos en esta categoría."
              : "No hay productos registrados."}
          </p>
        ) : (
          <ProductoGrid
            productos={productos}
            onEditar={puedeGestionar ? (p) => { setNuevoOpen(false); setEditProduct(toEditInput(p)); } : undefined}
          />
        )}
      </div>

      {puedeGestionar && (
        <FloatingButton
          ariaLabel="Nuevo producto"
          onClick={() => { setEditProduct(null); setNuevoOpen(true); }}
        />
      )}

      {puedeGestionar && (
        <NuevoProductoModal
          open={modalOpen}
          onClose={closeModal}
          onSuccess={() => void loadProductos()}
          editProduct={editProduct}
        />
      )}
    </>
  );
}
