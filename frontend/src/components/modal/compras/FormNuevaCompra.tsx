import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { apiClient } from "../../../lib/apiClient";
import type { ProductoListItem } from "../../../types/producto";
import type { ProveedorListItem } from "../../../types/proveedor";

function genKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

type Linea = {
  key: string;
  id_producto: number | "";
  cantidad: number;
};

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
};

export function FormNuevaCompra({ onClose, onSuccess, requestHeaders }: Props) {
  const formId = useId();
  const [proveedores, setProveedores] = useState<ProveedorListItem[]>([]);
  const [nitProveedor, setNitProveedor] = useState("");
  const [productosProv, setProductosProv] = useState<ProductoListItem[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([
    { key: genKey(), id_producto: "", cantidad: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const productoById = useMemo(() => {
    const m = new Map<number, ProductoListItem>();
    for (const p of productosProv) m.set(p.id_producto, p);
    return m;
  }, [productosProv]);

  const productosActivos = useMemo(
    () => productosProv.filter((p) => p.activo),
    [productosProv],
  );

  useEffect(() => {
    let cancelled = false;
    setLoadErr(null);
    (async () => {
      try {
        const data = await apiClient.get<ProveedorListItem[]>("/proveedores/", {
          headers: requestHeaders,
        });
        if (!cancelled) setProveedores(data.filter((p) => p.activo));
      } catch (e) {
        if (!cancelled) {
          setLoadErr(e instanceof Error ? e.message : "No se pudieron cargar proveedores");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestHeaders]);

  const cargarProductosProveedor = useCallback(
    async (nit: string) => {
      if (!nit.trim()) {
        setProductosProv([]);
        return;
      }
      setLoadingProductos(true);
      setLoadErr(null);
      try {
        const data = await apiClient.get<ProductoListItem[]>(
          `/compras/productos-por-proveedor/${encodeURIComponent(nit.trim())}`,
        );
        setProductosProv(data);
        setLoadErr(null);
      } catch (e) {
        setProductosProv([]);
        setLoadErr(e instanceof Error ? e.message : "No se pudieron cargar productos");
      } finally {
        setLoadingProductos(false);
      }
    },
    [],
  );

  useEffect(() => {
    void cargarProductosProveedor(nitProveedor);
    setLineas([{ key: genKey(), id_producto: "", cantidad: 1 }]);
    setFormErr(null);
  }, [nitProveedor, cargarProductosProveedor]);

  const addLinea = () => {
    setLineas((prev) => [...prev, { key: genKey(), id_producto: "", cantidad: 1 }]);
  };

  const removeLinea = (key: string) => {
    setLineas((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  };

  const updateLinea = (key: string, patch: Partial<Linea>) => {
    setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const mergePayload = () => {
    const merged = new Map<number, { cant: number; precio: number }>();
    for (const line of lineas) {
      if (line.id_producto === "" || line.cantidad < 1) continue;
      const p = productoById.get(line.id_producto);
      if (!p) continue;
      const precio = toNum(p.precio_compra);
      const prev = merged.get(line.id_producto);
      if (prev) prev.cant += line.cantidad;
      else merged.set(line.id_producto, { cant: line.cantidad, precio });
    }
    const productos: { id_producto: number; cantidad_compra: number; precio_compra: number }[] =
      [];
    for (const [id_producto, v] of merged) {
      productos.push({
        id_producto,
        cantidad_compra: v.cant,
        precio_compra: v.precio,
      });
    }
    return productos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    if (!nitProveedor.trim()) {
      setFormErr("Selecciona un proveedor.");
      return;
    }
    const productos = mergePayload();
    if (productos.length === 0) {
      setFormErr("Agrega al menos un producto con cantidad válida.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(
        "/compras/",
        {
          nit_proveedor: nitProveedor.trim(),
          productos,
        },
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "No se pudo registrar la compra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setNitProveedor("");
    setProductosProv([]);
    setLineas([{ key: genKey(), id_producto: "", cantidad: 1 }]);
    setFormErr(null);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
      <div className="space-y-4 overflow-y-auto px-5 py-4">
        {loadErr ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {loadErr}
          </p>
        ) : null}

        <div>
          <label htmlFor={`${formId}-prov`} className="mb-1 block text-xs font-medium text-emerald-800">
            Proveedor
          </label>
          <select
            id={`${formId}-prov`}
            value={nitProveedor}
            onChange={(e) => setNitProveedor(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">— Seleccionar proveedor —</option>
            {proveedores.map((p) => (
              <option key={p.nit_proveedor} value={p.nit_proveedor}>
                {p.nombre} ({p.nit_proveedor})
              </option>
            ))}
          </select>
        </div>

        {nitProveedor ? (
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Los productos mostrados son los comprados antes a este proveedor; si no hay historial,
            se listan todos los productos activos para poder registrar la primera compra.
          </div>
        ) : null}

        {nitProveedor && loadingProductos ? (
          <p className="text-sm text-emerald-700">Cargando catálogo del proveedor…</p>
        ) : null}

        {nitProveedor && !loadingProductos && productosActivos.length === 0 ? (
          <p className="text-sm text-red-600">No hay productos disponibles para este proveedor.</p>
        ) : null}

        {nitProveedor && !loadingProductos && productosActivos.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">Líneas</span>
              <button
                type="button"
                onClick={addLinea}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir línea
              </button>
            </div>

            <ul className="space-y-2">
              {lineas.map((line) => {
                const sel =
                  line.id_producto === "" ? null : productoById.get(line.id_producto);
                return (
                  <li
                    key={line.key}
                    className="flex flex-wrap items-end gap-2 rounded-lg border border-emerald-100 p-3"
                  >
                    <div className="min-w-[200px] flex-1">
                      <label className="mb-1 block text-xs text-neutral-500">Producto</label>
                      <select
                        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                        value={line.id_producto === "" ? "" : line.id_producto}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateLinea(line.key, {
                            id_producto: v === "" ? "" : Number(v),
                          });
                        }}
                      >
                        <option value="">— Elegir —</option>
                        {productosActivos.map((p) => (
                          <option key={p.id_producto} value={p.id_producto}>
                            {p.nombre} · Q {toNum(p.precio_compra).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="mb-1 block text-xs text-neutral-500">Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm tabular-nums"
                        value={line.cantidad}
                        onChange={(e) =>
                          updateLinea(line.key, {
                            cantidad: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </div>
                    {sel ? (
                      <p className="text-xs text-neutral-600">
                        P/U compra Q {toNum(sel.precio_compra).toFixed(2)}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeLinea(line.key)}
                      className="ml-auto rounded p-1.5 text-red-600 hover:bg-red-50"
                      aria-label="Quitar línea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {formErr ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {formErr}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-emerald-100 bg-emerald-50 px-5 py-4">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            submitting || !nitProveedor || loadingProductos || productosActivos.length === 0
          }
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          {submitting ? "Registrando…" : "Registrar compra"}
        </button>
      </div>
    </form>
  );
}
