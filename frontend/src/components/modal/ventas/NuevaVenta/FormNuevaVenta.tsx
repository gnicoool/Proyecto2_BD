import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { apiClient } from "../../../../lib/apiClient";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import type { NuevaVentaDraftLine } from "../../../../context/NuevaVentaDraftContext";
import type { ProductoListItem } from "../../../../types/producto";
import type { ClienteListItem } from "../../../../types/cliente";
import type { VentaDetalleRespuesta } from "../../../../types/venta";
import { AgregarProductosVenta } from "./AgregarProductosVenta";
import { clienteSelectedLabel, DEBOUNCE_MS, genKey, matchesText, type LineaForm, toNum,} from "./nuevaVentaUtils";

type FormNuevaVentaProps = {
  formId: string;
  nitEmpleado: string;
  onClose: () => void;
  onCreated: () => void;
  initialDraftLines?: NuevaVentaDraftLine[] | null;
};

function lineasInicialesFromDraft(d: NuevaVentaDraftLine[] | null | undefined): LineaForm[] {
  if (!d?.length) {
    return [{ key: genKey(), id_producto: "", cantidad: 1, productoInput: "" }];
  }
  return d.map((l) => ({
    key: genKey(),
    id_producto: l.id_producto,
    cantidad: l.cantidad,
    productoInput: l.nombre,
  }));
}

export function FormNuevaVenta({
  formId,
  nitEmpleado,
  onClose,
  onCreated,
  initialDraftLines,
}: FormNuevaVentaProps) {
  const [lineas, setLineas] = useState<LineaForm[]>(() =>
    lineasInicialesFromDraft(initialDraftLines ?? null),
  );
  const [productos, setProductos] = useState<ProductoListItem[]>([]);
  const [clientes, setClientes] = useState<ClienteListItem[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);

  const [sinCliente, setSinCliente] = useState(true);
  const [idCliente, setIdCliente] = useState<number | "">("");
  const [clienteInput, setClienteInput] = useState("");
  const [clienteMenuOpen, setClienteMenuOpen] = useState(false);
  const clienteContainerRef = useRef<HTMLDivElement>(null);

  const [productMenuOpenKey, setProductMenuOpenKey] = useState<string | null>(null);
  const productContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const debouncedClienteQ = useDebouncedValue(clienteInput, DEBOUNCE_MS);

  const productoById = useMemo(() => {
    const m = new Map<number, ProductoListItem>();
    for (const p of productos) m.set(p.id_producto, p);
    return m;
  }, [productos]);

  const productosVenta = useMemo(
    () => productos.filter((p) => p.activo && p.cant_disponible > 0),
    [productos],
  );

  const loadCatalogo = useCallback(async () => {
    try {
      const [prods, clis] = await Promise.all([
        apiClient.get<ProductoListItem[]>("/productos/"),
        apiClient.get<ClienteListItem[]>("/clientes/"),
      ]);
      setProductos(prods);
      setClientes(clis);
      setLoadErr(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo cargar el catálogo";
      setLoadErr(
        msg === "Not Found"
          ? "No se encontró el catálogo en el servidor."
          : msg,
      );
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async() => {
      if(isMounted) setLoadingCatalogo(true);
      await loadCatalogo();
    };
    void fetchAll();
    return () => {
      isMounted = false;
    }
  }, [loadCatalogo]);

  useEffect(() => {
    function onDocMouseDown(ev: MouseEvent) {
      const t = ev.target as Node;
      if (clienteContainerRef.current?.contains(t)) return;
      setClienteMenuOpen(false);
      for (const el of productContainerRefs.current.values()) {
        if (el.contains(t)) return;
      }
      setProductMenuOpenKey(null);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const filteredClientes = useMemo(() => {
    if (sinCliente || idCliente !== "") return [];
    const q = debouncedClienteQ.trim();
    if (!q) return clientes.slice(0, 40);
    return clientes
      .filter((c) => matchesText(c.nombre, q) || matchesText(c.nit, q))
      .slice(0, 40);
  }, [sinCliente, idCliente, debouncedClienteQ, clientes]);

  const makeProductFilter = useCallback(
    (line: LineaForm, debouncedLineInput: string) => {
      if (line.id_producto !== "") return [];
      const q = debouncedLineInput.trim();
      if (!q) return productosVenta.slice(0, 40);
      return productosVenta
        .filter((p) => matchesText(p.nombre, q) || matchesText(String(p.id_producto), q))
        .slice(0, 40);
    },
    [productosVenta],
  );

  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      { key: genKey(), id_producto: "", cantidad: 1, productoInput: "" },
    ]);
  };

  const removeLinea = (key: string) => {
    setLineas((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
    productContainerRefs.current.delete(key);
  };

  const updateLinea = (key: string, patch: Partial<LineaForm>) => {
    setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const setProductContainerRef = (lineKey: string, el: HTMLDivElement | null) => {
    if (el) productContainerRefs.current.set(lineKey, el);
    else productContainerRefs.current.delete(lineKey);
  };

  const mergeLineasPayload = () => {
    const merged = new Map<number, { cant: number; precio: number; maxStock: number }>();
    for (const line of lineas) {
      if (line.id_producto === "" || line.cantidad < 1) continue;
      const p = productoById.get(line.id_producto);
      if (!p) continue;
      const precio = toNum(p.precio_venta);
      const prev = merged.get(line.id_producto);
      if (prev) {
        prev.cant += line.cantidad;
      } else {
        merged.set(line.id_producto, {
          cant: line.cantidad,
          precio,
          maxStock: p.cant_disponible,
        });
      }
    }
    const productosPayload: {
      id_producto: number;
      cantidad_venta: number;
      precio_venta: number;
    }[] = [];
    for (const [id_producto, v] of merged) {
      if (v.cant > v.maxStock) {
        throw new Error(
          `Stock insuficiente para el producto #${id_producto} (máx. ${v.maxStock})`,
        );
      }
      productosPayload.push({
        id_producto,
        cantidad_venta: v.cant,
        precio_venta: v.precio,
      });
    }
    return productosPayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    let productosPayload: { id_producto: number; cantidad_venta: number; precio_venta: number }[];
    try {
      productosPayload = mergeLineasPayload();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "Revisa las cantidades");
      return;
    }
    if (productosPayload.length === 0) {
      setFormErr("Agrega al menos un producto con cantidad válida.");
      return;
    }

    if (!sinCliente && idCliente === "") {
      setFormErr("Busca y selecciona un cliente de la lista, o marca «Sin cliente».");
      return;
    }

    const body: Record<string, unknown> = {
      nit_empleado: nitEmpleado,
      productos: productosPayload,
    };

    if (!sinCliente && idCliente !== "") {
      body.id_cliente = idCliente;
    }

    setSubmitting(true);
    try {
      await apiClient.post<VentaDetalleRespuesta>("/ventas/", body);
      onCreated();
      onClose();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "No se pudo registrar la venta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-4 overflow-visible px-4 pt-4">
        {loadingCatalogo ? (
          <p className="text-sm text-neutral-500">Cargando catálogo…</p>
        ) : null}

        {loadErr ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadErr}
          </p>
        ) : null}

        <fieldset className="relative z-30 space-y-2 overflow-visible">
          <legend className="text-sm font-medium text-neutral-800">Cliente</legend>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sinCliente}
              onChange={(e) => {
                const on = e.target.checked;
                setSinCliente(on);
                if (on) {
                  setIdCliente("");
                  setClienteInput("");
                  setClienteMenuOpen(false);
                }
              }}
            />
            Sin cliente (consumidor final)
          </label>

          {sinCliente ? (
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              Nombre: <span className="font-medium">cf</span> · NIT:{" "}
              <span className="font-medium">cf</span>
              <span className="mt-1 block text-xs text-neutral-500">
                La venta se guarda sin cliente registrado en base de datos.
              </span>
            </p>
          ) : (
            <div
              ref={clienteContainerRef}
              className={`relative ${clienteMenuOpen && idCliente === "" ? "z-[110]" : ""}`}
            >
              <label htmlFor={`${formId}-cliente`} className="mb-1 block text-xs text-neutral-500">
                Buscar cliente por nombre o NIT
              </label>
              <input
                id={`${formId}-cliente`}
                type="text"
                autoComplete="off"
                placeholder="Escribe y espera un momento…"
                value={
                  idCliente !== "" ? clienteSelectedLabel(clientes, idCliente) : clienteInput
                }
                onChange={(e) => {
                  setIdCliente("");
                  setClienteInput(e.target.value);
                  setClienteMenuOpen(true);
                }}
                onFocus={() => setClienteMenuOpen(true)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              {clienteMenuOpen && idCliente === "" ? (
                <ul className="absolute left-0 right-0 top-full z-[110] mt-1 max-h-52 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-xl">
                  {filteredClientes.length === 0 ? (
                    <li className="px-3 py-2 text-neutral-500">
                      {debouncedClienteQ.trim()
                        ? "Sin coincidencias"
                        : "Escribe para filtrar"}
                    </li>
                  ) : (
                    filteredClientes.map((c) => (
                      <li key={c.id_cliente}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-sky-50"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => {
                            setIdCliente(c.id_cliente);
                            setClienteInput(`${c.nombre} (${c.nit})`);
                            setClienteMenuOpen(false);
                          }}
                        >
                          <span className="font-medium text-neutral-900">{c.nombre}</span>
                          <span className="ml-2 text-neutral-500">{c.nit}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </div>
          )}
        </fieldset>
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-visible px-4 pb-4">
        <AgregarProductosVenta
          formId={formId}
          lineas={lineas}
          productoById={productoById}
          productMenuOpenKey={productMenuOpenKey}
          onProductMenuOpenChange={setProductMenuOpenKey}
          setProductContainerRef={setProductContainerRef}
          makeProductFilter={makeProductFilter}
          onAddLinea={addLinea}
          onUpdateLinea={updateLinea}
          onRemoveLinea={removeLinea}
        />

        {formErr ? (
          <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formErr}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !!loadErr || loadingCatalogo}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {submitting ? "Guardando…" : "Registrar venta"}
        </button>
      </div>
    </form>
  );
}
