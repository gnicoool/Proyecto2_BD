import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
  ariaLabel?: string;
};

export function FloatingButton({ onClick, ariaLabel = "Agregar" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <Plus size={28} aria-hidden />
    </button>
  );
}