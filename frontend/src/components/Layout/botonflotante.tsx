import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export function FloatingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 hover:scale-105"
    >
      <Plus size={28} />
    </button>
  );
}