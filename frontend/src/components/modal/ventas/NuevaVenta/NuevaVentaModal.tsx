import { useId } from "react";
import { X } from "lucide-react";
import type { NuevaVentaDraftLine } from "../../../../context/nuevaVentaDraftTypes";
import { FormNuevaVenta } from "./FormNuevaVenta";

type Props = {
  open: boolean;
  onClose: () => void;
  nitEmpleado: string;
  onCreated: () => void;
  initialDraftLines?: NuevaVentaDraftLine[] | null;
};

export function NuevaVentaModal({
  open,
  onClose,
  nitEmpleado,
  onCreated,
  initialDraftLines,
}: Props) {
  const formId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50 px-4 py-3">
          <h2 id={`${formId}-title`} className="text-lg font-semibold text-sky-900">
            Nueva venta
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <FormNuevaVenta
          formId={formId}
          nitEmpleado={nitEmpleado}
          onClose={onClose}
          onCreated={onCreated}
          initialDraftLines={initialDraftLines}
        />
      </div>
    </div>
  );
}
