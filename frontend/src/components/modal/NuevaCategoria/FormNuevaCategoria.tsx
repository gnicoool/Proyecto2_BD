import { useEffect, useState } from "react";
import { Field, INPUT_CLASS } from "../NuevaPersona/personaModalShared";
import { apiClient } from "../../../lib/apiClient";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function FormNuevaCategoria({ open, onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNombre("");
      setDescripcion("");
      setErr(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setErr(null);
    if (!nombre.trim()) {
      setErr("El nombre es requerido.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/categorias/", {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear la categoría.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 overflow-y-auto px-5 py-5">
        <Field label="Nombre" id="cat-nombre">
          <input
            id="cat-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            autoFocus
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Descripción" id="cat-desc">
          <textarea
            id="cat-desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción opcional"
            rows={3}
            className={`${INPUT_CLASS} resize-none`}
          />
        </Field>

        {err && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>
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
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear"}
        </button>
      </div>
    </>
  );
}
