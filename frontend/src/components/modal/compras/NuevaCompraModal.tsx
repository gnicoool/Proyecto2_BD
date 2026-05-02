import { X } from "lucide-react";
import { FormNuevaCompra } from "./FormNuevaCompra";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
};

export function NuevaCompraModal({ open, onClose, onSuccess, requestHeaders }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nueva-compra-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <h2 id="nueva-compra-title" className="text-base font-semibold text-emerald-900">
            Nueva compra
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <FormNuevaCompra onClose={onClose} onSuccess={onSuccess} requestHeaders={requestHeaders} />
      </div>
    </div>
  );
}
