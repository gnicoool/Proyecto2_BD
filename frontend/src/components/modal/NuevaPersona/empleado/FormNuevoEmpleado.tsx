import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "../../../../lib/apiClient";
import { Field, INPUT_CLASS } from "../personaModalShared";
import type { EmpleadoListItem } from "../../../../types/empleado";

export type FormNuevoEmpleadoProps = {
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
  initial: EmpleadoListItem | null;
};

type FormState = {
  nombre: string;
  nit: string;
  numero: string;
  correo: string;
  contrasena: string;
  id_rol: number;
  activo: boolean;
};

function emptyForm(): FormState {
  return {
    nombre: "",
    nit: "",
    numero: "",
    correo: "",
    contrasena: "",
    id_rol: 2,
    activo: true,
  };
}

function formFromInitial(e: EmpleadoListItem): FormState {
  return {
    nombre: e.nombre,
    nit: e.nit_empleado,
    numero: e.tel_empleado ?? "",
    correo: e.correo,
    contrasena: "",
    id_rol: e.id_rol,
    activo: e.activo,
  };
}

function isAdminEmployee(initial: EmpleadoListItem): boolean {
  return initial.id_rol === 1 || initial.nombre_rol.trim().toLowerCase() === "admin";
}

export function FormNuevoEmpleado({
  onClose,
  onSuccess,
  requestHeaders,
  initial,
}: FormNuevoEmpleadoProps) {
  const isEdit = initial !== null;
  const adminLocked = isEdit && initial !== null && isAdminEmployee(initial);

  const [form, setForm] = useState<FormState>(() =>
    initial ? formFromInitial(initial) : emptyForm(),
  );
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{ nombre: string; contrasena: string } | null>(null);

  useEffect(() => {
    setErr(null);
    setCreated(null);
    setShowPass(false);
    setForm(initial ? formFromInitial(initial) : emptyForm());
  }, [initial]);

  const set =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleClose = () => {
    setForm(emptyForm());
    setErr(null);
    setCreated(null);
    setShowPass(false);
    onClose();
  };

  const handleSubmit = async () => {
    setErr(null);
    if (!form.nombre.trim()) {
      setErr("El nombre es requerido.");
      return;
    }
    if (!isEdit && !form.nit.trim()) {
      setErr("El NIT del empleado es requerido.");
      return;
    }
    if (!form.correo.trim()) {
      setErr("El correo es requerido.");
      return;
    }
    if (!isEdit && !form.contrasena.trim()) {
      setErr("La contraseña es requerida.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initial) {
        const nit = initial.nit_empleado;
        const tel = form.numero.trim();
        const patchBody: Record<string, unknown> = {
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          tel_empleado: tel || null,
        };
        if (!adminLocked) {
          patchBody.id_rol = form.id_rol;
          patchBody.activo = form.activo;
        }
        await apiClient.patch(`/empleados/${encodeURIComponent(nit)}`, patchBody, {
          headers: requestHeaders,
        });
        onSuccess?.();
        handleClose();
      } else {
        const tel = form.numero.trim();
        await apiClient.post(
          "/empleados/",
          {
            nit_empleado: form.nit.trim(),
            nombre: form.nombre.trim(),
            tel_empleado: tel || undefined,
            correo: form.correo.trim(),
            id_rol: form.id_rol,
            contrasena: form.contrasena,
          },
          { headers: requestHeaders },
        );
        setCreated({ nombre: form.nombre.trim(), contrasena: form.contrasena });
        onSuccess?.();
      }
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : isEdit
            ? "Error al actualizar el empleado."
            : "Error al crear el empleado.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 px-5 py-5">
        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-sky-800">
              El empleado <span className="font-semibold">{created.nombre}</span> fue creado
              correctamente.
            </p>
            <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Guarda la contraseña para brindarla al empleado
              </p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-amber-800">
                {created.contrasena}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Nombre" id="emp-nombre">
              <input
                id="emp-nombre"
                type="text"
                value={form.nombre}
                onChange={set("nombre")}
                placeholder="Nombre completo"
                autoFocus={!isEdit}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="NIT empleado sin guiones" id="emp-nit">
              <input
                id="emp-nit"
                type="text"
                value={form.nit}
                onChange={set("nit")}
                placeholder="00000000"
                disabled={isEdit}
                readOnly={isEdit}
                className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-70`}
              />
            </Field>

            <Field label="Rol" id="emp-rol">
              <select
                id="emp-rol"
                value={form.id_rol}
                onChange={(e) =>
                  setForm((f) => ({ ...f, id_rol: Number(e.target.value) }))
                }
                disabled={adminLocked}
                className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <option value={2}>Vendedor</option>
                <option value={1}>Administrador</option>
              </select>
              {adminLocked ? (
                <p className="mt-1 text-xs text-neutral-500">
                  No se puede cambiar el rol de un administrador desde aquí.
                </p>
              ) : null}
            </Field>

            <Field label="Teléfono" id="emp-numero">
              <input
                id="emp-numero"
                type="tel"
                value={form.numero}
                onChange={set("numero")}
                placeholder="55550000"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Correo" id="emp-correo">
              <input
                id="emp-correo"
                type="email"
                value={form.correo}
                onChange={set("correo")}
                placeholder="correo@ejemplo.com"
                className={INPUT_CLASS}
              />
            </Field>

            {isEdit ? (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-sky-800">
                <input
                  type="checkbox"
                  checked={form.activo}
                  disabled={adminLocked}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, activo: e.target.checked }))
                  }
                  className="rounded border-sky-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50"
                />
                Activo
                {adminLocked ? (
                  <span className="text-xs text-neutral-500">
                    (los administradores no se pueden desactivar aquí)
                  </span>
                ) : null}
              </label>
            ) : null}

            {!isEdit ? (
              <>
                <Field label="Contraseña" id="emp-pass">
                  <div className="relative">
                    <input
                      id="emp-pass"
                      type={showPass ? "text" : "password"}
                      value={form.contrasena}
                      onChange={set("contrasena")}
                      placeholder="Contraseña temporal"
                      className={`${INPUT_CLASS} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600"
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5">
                  <p className="text-xs font-medium text-sky-600">
                    Guarda la contraseña para brindarla al empleado.
                  </p>
                </div>
              </>
            ) : null}

            {err ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {err}
              </p>
            ) : null}
          </>
        )}
      </div>

      {!created ? (
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
      ) : null}
    </>
  );
}
