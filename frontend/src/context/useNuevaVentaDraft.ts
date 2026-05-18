import { useContext } from "react";
import { NuevaVentaDraftContext, type NuevaVentaDraftContextValue } from "./nuevaVentaDraftContext";

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
