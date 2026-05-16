import { createContext, useCallback, useContext, useMemo, useState, type ReactNode,} from "react";
import type { ProductoListItem } from "../types/producto";

export type NuevaVentaDraftLine = {
  id_producto: number;
  cantidad: number;
  precio_venta: number;
  nombre: string;
  cant_disponible: number;
};

type NuevaVentaDraftContextValue = {
  lineas: NuevaVentaDraftLine[];
  totalUnidades: number;
  totalLineas: number;
  addOrIncrementProduct: (p: ProductoListItem, delta?: number) => { ok: true } | { ok: false; reason: string };
  setCantidad: (id_producto: number, cantidad: number) => { ok: true } | { ok: false; reason: string };
  removeLine: (id_producto: number) => void;
  clearDraft: () => void;
  getProductosPayload: () => { id_producto: number; cantidad_venta: number; precio_venta: number }[];
};

const NuevaVentaDraftContext = createContext<NuevaVentaDraftContextValue | null>(null);

function toNum(v: number | string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}

function productoToDraftLine(p: ProductoListItem, cantidad: number): NuevaVentaDraftLine {
  return {
    id_producto: p.id_producto,
    cantidad,
    precio_venta: toNum(p.precio_venta),
    nombre: p.nombre,
    cant_disponible: p.cant_disponible,
  };
}

export function NuevaVentaDraftProvider({ children }: { children: ReactNode }) {
  const [lineas, setLineas] = useState<NuevaVentaDraftLine[]>([]);

  const addOrIncrementProduct = useCallback((p: ProductoListItem, delta = 1) => {
    if (!p.activo) {
      return { ok: false as const, reason: "El producto no está activo." };
    }
    if (p.cant_disponible < 1) {
      return { ok: false as const, reason: "Sin stock disponible." };
    }
    const precio = toNum(p.precio_venta);
    let outcome: { ok: true } | { ok: false; reason: string } = { ok: true };
    setLineas((prev) => {
      const idx = prev.findIndex((l) => l.id_producto === p.id_producto);
      if (idx === -1) {
        const cant = Math.min(delta, p.cant_disponible);
        if (cant < 1) {
          outcome = { ok: false, reason: "Sin stock disponible." };
          return prev;
        }
        return [...prev, productoToDraftLine(p, cant)];
      }
      const row = prev[idx]!;
      const newCant = row.cantidad + delta;
      if (newCant > p.cant_disponible) {
        outcome = {
          ok: false,
          reason: `Máximo ${p.cant_disponible} unidad(es) disponible(s).`,
        };
        return prev;
      }
      const next = [...prev];
      next[idx] = {
        ...row,
        cantidad: newCant,
        precio_venta: precio,
        cant_disponible: p.cant_disponible,
        nombre: p.nombre,
      };
      return next;
    });
    return outcome;
  }, []);

  const setCantidad = useCallback((id_producto: number, cantidad: number) => {
    if (cantidad < 1) {
      setLineas((prev) => prev.filter((l) => l.id_producto !== id_producto));
      return { ok: true as const };
    }
    let failReason = "";
    setLineas((prev) => {
      const idx = prev.findIndex((l) => l.id_producto === id_producto);
      if (idx === -1) return prev;
      const row = prev[idx]!;
      if (cantidad > row.cant_disponible) {
        failReason = `Máximo ${row.cant_disponible} unidades.`;
        return prev;
      }
      const next = [...prev];
      next[idx] = { ...row, cantidad };
      return next;
    });
    if (failReason) return { ok: false as const, reason: failReason };
    return { ok: true as const };
  }, []);

  const removeLine = useCallback((id_producto: number) => {
    setLineas((prev) => prev.filter((l) => l.id_producto !== id_producto));
  }, []);

  const clearDraft = useCallback(() => {
    setLineas([]);
  }, []);

  const getProductosPayload = useCallback(() => {
    return lineas.map((l) => ({
      id_producto: l.id_producto,
      cantidad_venta: l.cantidad,
      precio_venta: l.precio_venta,
    }));
  }, [lineas]);

  const totalUnidades = useMemo(() => lineas.reduce((s, l) => s + l.cantidad, 0), [lineas]);
  const totalLineas = lineas.length;

  const value = useMemo<NuevaVentaDraftContextValue>(
    () => ({
      lineas,
      totalUnidades,
      totalLineas,
      addOrIncrementProduct,
      setCantidad,
      removeLine,
      clearDraft,
      getProductosPayload,
    }),
    [
      lineas,
      totalUnidades,
      totalLineas,
      addOrIncrementProduct,
      setCantidad,
      removeLine,
      clearDraft,
      getProductosPayload,
    ],
  );

  return (
    <NuevaVentaDraftContext.Provider value={value}>{children}</NuevaVentaDraftContext.Provider>
  );
}

export function useNuevaVentaDraft(): NuevaVentaDraftContextValue {
  const ctx = useContext(NuevaVentaDraftContext);
  if (!ctx) {
    throw new Error("useNuevaVentaDraft must be used within NuevaVentaDraftProvider");
  }
  return ctx;
}

export function useNuevaVentaDraftOptional(): NuevaVentaDraftContextValue | null {
  return useContext(NuevaVentaDraftContext);
}
