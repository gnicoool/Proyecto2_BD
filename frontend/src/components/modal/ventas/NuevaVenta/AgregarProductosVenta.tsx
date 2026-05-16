import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import type { ProductoListItem } from "../../../../types/producto";
import { DEBOUNCE_MS, formatMoney, type LineaForm } from "./nuevaVentaUtils";

type AgregarProductosVentaProps = {
  formId: string;
  lineas: LineaForm[];
  productoById: Map<number, ProductoListItem>;
  productMenuOpenKey: string | null;
  onProductMenuOpenChange: (lineKey: string | null) => void;
  setProductContainerRef: (lineKey: string, el: HTMLDivElement | null) => void;
  makeProductFilter: (line: LineaForm, debouncedInput: string) => ProductoListItem[];
  onAddLinea: () => void;
  onUpdateLinea: (key: string, patch: Partial<LineaForm>) => void;
  onRemoveLinea: (key: string) => void;
};

export function AgregarProductosVenta({
  formId,
  lineas,
  productoById,
  productMenuOpenKey,
  onProductMenuOpenChange,
  setProductContainerRef,
  makeProductFilter,
  onAddLinea,
  onUpdateLinea,
  onRemoveLinea,
}: AgregarProductosVentaProps) {
  return (
    <div className="relative z-20 overflow-visible">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-800">Productos</span>
        <button
          type="button"
          onClick={onAddLinea}
          className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir producto
        </button>
      </div>

      <ul className="space-y-3 overflow-visible">
        {lineas.map((line) => (
          <LineaProductoRow
            key={line.key}
            formId={formId}
            line={line}
            productoById={productoById}
            menuOpen={productMenuOpenKey === line.key}
            onMenuOpenChange={(open) => onProductMenuOpenChange(open ? line.key : null)}
            containerRef={(el) => setProductContainerRef(line.key, el)}
            onUpdate={(patch) => onUpdateLinea(line.key, patch)}
            onRemove={() => onRemoveLinea(line.key)}
            makeFiltered={makeProductFilter}
          />
        ))}
      </ul>
    </div>
  );
}

type LineaProductoRowProps = {
  formId: string;
  line: LineaForm;
  productoById: Map<number, ProductoListItem>;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  containerRef: (el: HTMLDivElement | null) => void;
  onUpdate: (patch: Partial<LineaForm>) => void;
  onRemove: () => void;
  makeFiltered: (line: LineaForm, debouncedInput: string) => ProductoListItem[];
};

function LineaProductoRow({
  formId,
  line,
  productoById,
  menuOpen,
  onMenuOpenChange,
  containerRef,
  onUpdate,
  onRemove,
  makeFiltered,
}: LineaProductoRowProps) {
  const debouncedProducto = useDebouncedValue(line.productoInput, DEBOUNCE_MS);
  const filtered = useMemo(
    () => makeFiltered(line, debouncedProducto),
    [makeFiltered, line, debouncedProducto],
  );

  const sel = line.id_producto === "" ? null : productoById.get(line.id_producto);
  const inputDisplay =
    line.id_producto !== "" && sel ? sel.nombre : line.productoInput;

  return (
    <li
      className={`flex flex-wrap items-end gap-2 rounded-lg border border-neutral-200 p-3 ${menuOpen ? "relative z-[110]" : ""}`}
    >
      <div ref={containerRef} className="relative min-w-[180px] flex-1">
        <label className="mb-1 block text-xs text-neutral-500">Producto</label>
        <input
          type="text"
          autoComplete="off"
          placeholder="Buscar por nombre…"
          value={inputDisplay}
          onChange={(e) => {
            onUpdate({
              id_producto: "",
              productoInput: e.target.value,
            });
            onMenuOpenChange(true);
          }}
          onFocus={() => onMenuOpenChange(true)}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          id={`${formId}-prod-${line.key}`}
        />
        {menuOpen && line.id_producto === "" ? (
          <ul className="absolute bottom-full left-0 right-0 z-[110] mb-1 max-h-52 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-xl">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-neutral-500">
                {debouncedProducto.trim() ? "Sin coincidencias" : "Escribe para filtrar"}
              </li>
            ) : (
              filtered.map((p) => (
                <li key={p.id_producto}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-sky-50"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      onUpdate({
                        id_producto: p.id_producto,
                        productoInput: p.nombre,
                      });
                      onMenuOpenChange(false);
                    }}
                  >
                    <span className="font-medium text-neutral-900">{p.nombre}</span>
                    <span className="ml-2 text-neutral-500">
                      stock {p.cant_disponible} · Q {formatMoney(p.precio_venta)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs text-neutral-500">Cantidad</label>
        <input
          type="number"
          min={1}
          max={sel ? sel.cant_disponible : undefined}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm tabular-nums"
          value={line.cantidad}
          onChange={(e) =>
            onUpdate({
              cantidad: Math.max(1, Number(e.target.value) || 1),
            })
          }
        />
      </div>
      {sel ? (
        <p className="text-xs text-neutral-600">P/U Q {formatMoney(sel.precio_venta)}</p>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto rounded p-1.5 text-red-600 hover:bg-red-50"
        aria-label="Quitar línea"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
