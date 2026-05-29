import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

export default function NoAutorizadoPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <ShieldOff className="h-16 w-16 text-red-400" />
      <h1 className="text-2xl font-bold text-neutral-800">Acceso denegado</h1>
      <p className="text-neutral-500">
        No tienes permiso para ver esta página con tu rol actual.
      </p>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-lg bg-[#5bb0cf] px-6 py-2.5 font-semibold text-white hover:bg-[#4a9ab8] transition-colors"
      >
        Volver
      </button>
    </div>
  );
}
