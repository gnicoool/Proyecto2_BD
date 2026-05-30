import { createContext } from "react";
import type { ProductoListItem } from "../types/producto";
import type { NuevaVentaDraftLine } from "./nuevaVentaDraftTypes";

export type NuevaVentaDraftContextValue = {
  lineas: NuevaVentaDraftLine[];
  totalUnidades: number;
  totalLineas: number;
  addOrIncrementProduct: (
    p: ProductoListItem,
    delta?: number,
  ) => { ok: true } | { ok: false; reason: string };
  setCantidad: (
    id_producto: number,
    cantidad: number,
  ) => { ok: true } | { ok: false; reason: string };
  removeLine: (id_producto: number) => void;
  clearDraft: () => void;
  getProductosPayload: () => {
    id_producto: number;
    cantidad_venta: number;
    precio_venta: number;
  }[];
};

export const NuevaVentaDraftContext = createContext<NuevaVentaDraftContextValue | null>(
  null,
);
