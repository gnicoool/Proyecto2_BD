import { useState } from "react";
import { Field, INPUT_CLASS } from "../NuevaPersona/personaModalShared";
import { apiClient } from "../../../lib/apiClient";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export function FormNuevaMarca({ onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErr(null);
    if (!nombre.trim()) { setErr("El nombre es requerido."); return; }

    setLoading(true);
    try {
      await apiClient.post("/marcas", { nombre: nombre.trim() });
      onSuccess?.();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear la marca.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="px-5 py-5">
        <Field label="Nombre" id="marca-nombre">
          <input
            id="marca-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la marca"
            autoFocus
            className={INPUT_CLASS}
          />
        </Field>

        {err && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {err}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-sky-100 bg-sky-50 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear"}
        </button>
      </div>
    </>
  );
}