import { useEffect, useState } from "react";
import { Field, INPUT_CLASS } from "../NuevaPersona/personaModalShared";
import { apiClient } from "../../../lib/apiClient";
import type { ProveedorListItem } from "../../../types/proveedor";

type CategoriaOpt = { id_categoria: number; nombre: string };
type MarcaOpt = { id_marca: number; nombre: string };

type FormState = {
  nombre: string;
  descripcion: string;
  precio_venta: string;
  precio_compra: string;
  cant_disponible: string;
  id_categoria: string;
  id_marca: string;
  nit_proveedor: string;
};

const EMPTY: FormState = {
  nombre: "",
  descripcion: "",
  precio_venta: "",
  precio_compra: "",
  cant_disponible: "",
  id_categoria: "",
  id_marca: "",
  nit_proveedor: "",
};

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
};

export function FormNuevoProducto({ onClose, onSuccess, requestHeaders }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categorias, setCategorias] = useState<CategoriaOpt[]>([]);
  const [marcas, setMarcas] = useState<MarcaOpt[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, mrcs] = await Promise.all([
          apiClient.get<CategoriaOpt[]>("/categorias/"),
          apiClient.get<MarcaOpt[]>("/marcas/"),
        ]);
        if (cancelled) return;
        setCategorias(cats);
        setMarcas(mrcs);

        if (requestHeaders) {
          const provs = await apiClient.get<ProveedorListItem[]>("/proveedores/", {
            headers: requestHeaders,
          });
          if (!cancelled) {
            setProveedores(provs.filter((p) => p.activo));
          }
        } else if (!cancelled) {
          setProveedores([]);
        }
      } catch {
        if (!cancelled) {
          setErr("No se pudieron cargar categorías, marcas o proveedores.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestHeaders]);

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr(null);
    if (!form.nombre.trim()) {
      setErr("El nombre es requerido.");
      return;
    }
    if (!form.precio_venta || Number.isNaN(Number(form.precio_venta))) {
      setErr("Precio de venta inválido.");
      return;
    }
    if (!form.precio_compra || Number.isNaN(Number(form.precio_compra))) {
      setErr("Precio de compra inválido.");
      return;
    }
    if (!form.id_categoria) {
      setErr("Seleccione una categoría.");
      return;
    }
    if (!form.id_marca) {
      setErr("Seleccione una marca.");
      return;
    }
    if (!form.nit_proveedor.trim()) {
      setErr("Seleccione el proveedor con el que podrá comprar este producto.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/productos/", {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        precio_venta: Number(form.precio_venta),
        precio_compra: Number(form.precio_compra),
        cant_disponible: form.cant_disponible ? Number(form.cant_disponible) : 0,
        id_categoria: Number(form.id_categoria),
        id_marca: Number(form.id_marca),
        nit_proveedor: form.nit_proveedor.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-y-auto px-5 py-5 space-y-4">

        <Field label="Nombre" id="prod-nombre">
          <input
            id="prod-nombre"
            type="text"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Nombre del producto"
            autoFocus
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Descripción" id="prod-desc">
          <textarea
            id="prod-desc"
            value={form.descripcion}
            onChange={set("descripcion")}
            placeholder="Descripción opcional"
            rows={2}
            className={INPUT_CLASS + " resize-none"}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio compra (Q)" id="prod-pcompra">
            <input
              id="prod-pcompra"
              type="number"
              min={0}
              step="0.01"
              value={form.precio_compra}
              onChange={set("precio_compra")}
              placeholder="0.00"
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Precio venta (Q)" id="prod-pventa">
            <input
              id="prod-pventa"
              type="number"
              min={0}
              step="0.01"
              value={form.precio_venta}
              onChange={set("precio_venta")}
              placeholder="0.00"
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Cantidad disponible" id="prod-cant">
          <input
            id="prod-cant"
            type="number"
            min={0}
            value={form.cant_disponible}
            onChange={set("cant_disponible")}
            placeholder="0"
            className={INPUT_CLASS}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría" id="prod-cat">
            <select
              id="prod-cat"
              value={form.id_categoria}
              onChange={set("id_categoria")}
              className={INPUT_CLASS}
            >
              <option value="">— Seleccionar —</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Marca" id="prod-marca">
            <select
              id="prod-marca"
              value={form.id_marca}
              onChange={set("id_marca")}
              className={INPUT_CLASS}
            >
              <option value="">— Seleccionar —</option>
              {marcas.map((m) => (
                <option key={m.id_marca} value={m.id_marca}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Proveedor" id="prod-prov">
          <select
            id="prod-prov"
            value={form.nit_proveedor}
            onChange={set("nit_proveedor")}
            className={INPUT_CLASS}
          >
            <option value="">— Seleccionar —</option>
            {proveedores.map((p) => (
              <option key={p.nit_proveedor} value={p.nit_proveedor}>
                {p.nombre} ({p.nit_proveedor})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-sky-500">
            Se guarda la relación para que el producto aparezca al registrar compras con ese proveedor.
          </p>
        </Field>

        {err && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {err}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-sky-100 bg-sky-50 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear"}
        </button>
      </div>
    </>
  );
}