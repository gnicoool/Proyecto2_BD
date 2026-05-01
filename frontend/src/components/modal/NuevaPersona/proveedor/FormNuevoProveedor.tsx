import { useEffect, useState } from "react";
import { apiClient } from "../../../../lib/apiClient";
import { Field, INPUT_CLASS } from "../personaModalShared";
import type { ProveedorListItem } from "../../../../types/proveedor";

export type FormNuevoProveedorProps = {
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
  /** When set, PATCH this supplier. When null, POST new. */
  initial: ProveedorListItem | null;
};

type FormState = {
  nombre: string;
  nit: string;
  telefono: string;
  correo: string;
  activo: boolean;
};

function emptyForm(): FormState {
  return { nombre: "", nit: "", telefono: "", correo: "", activo: true };
}

function formFromInitial(p: ProveedorListItem): FormState {
  return {
    nombre: p.nombre,
    nit: p.nit_proveedor,
    telefono: p.tel_proveedor,
    correo: p.correo,
    activo: p.activo,
  };
}

export function FormNuevoProveedor({
  onClose,
  onSuccess,
  requestHeaders,
  initial,
}: FormNuevoProveedorProps) {
  const isEdit = initial !== null;

  const [form, setForm] = useState<FormState>(() =>
    initial ? formFromInitial(initial) : emptyForm(),
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    setForm(initial ? formFromInitial(initial) : emptyForm());
  }, [initial]);

  const set =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleClose = () => {
    setForm(emptyForm());
    setErr(null);
    onClose();
  };

  const handleSubmit = async () => {
    setErr(null);
    if (!form.nombre.trim()) {
      setErr("El nombre es requerido.");
      return;
    }
    if (!isEdit && !form.nit.trim()) {
      setErr("El NIT es requerido.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initial) {
        await apiClient.patch(
          `/proveedores/${encodeURIComponent(initial.nit_proveedor)}`,
          {
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            tel_proveedor: form.telefono.trim(),
            activo: form.activo,
          },
          { headers: requestHeaders },
        );
      } else {
        await apiClient.post(
          "/proveedores/",
          {
            nit_proveedor: form.nit.trim(),
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            tel_proveedor: form.telefono.trim(),
          },
          { headers: requestHeaders },
        );
      }
      onSuccess?.();
      handleClose();
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : isEdit
            ? "Error al actualizar el proveedor."
            : "Error al crear el proveedor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 px-5 py-5">
        <Field label="Nombre" id="prov-nombre">
          <input
            id="prov-nombre"
            type="text"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Nombre del proveedor"
            autoFocus={!isEdit}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="NIT Sin guiones" id="prov-nit">
          <input
            id="prov-nit"
            type="text"
            value={form.nit}
            onChange={set("nit")}
            placeholder="00000000"
            disabled={isEdit}
            readOnly={isEdit}
            className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-70`}
          />
        </Field>

        <Field label="Teléfono" id="prov-telefono">
          <input
            id="prov-telefono"
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="5555-0000"
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Correo" id="prov-correo">
          <input
            id="prov-correo"
            type="email"
            value={form.correo}
            onChange={set("correo")}
            placeholder="correo@proveedor.com"
            className={INPUT_CLASS}
          />
        </Field>

        {isEdit ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-sky-800">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              className="rounded border-sky-300 text-sky-600 focus:ring-sky-500"
            />
            Activo
          </label>
        ) : null}

        {err ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {err}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-sky-100 bg-sky-50 px-5 py-4">
        <button
          type="button"
          onClick={handleClose}
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
          {loading ? (isEdit ? "Guardando…" : "Creando…") : isEdit ? "Guardar" : "Crear"}
        </button>
      </div>
    </>
  );
}
