import { useId, type ReactNode } from "react";
import { X } from "lucide-react";

type PersonaModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function PersonaModal({ open, onClose, title, children }: PersonaModalProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-sky-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50 px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-sky-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-sky-400 transition hover:bg-sky-100 hover:text-sky-700"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
