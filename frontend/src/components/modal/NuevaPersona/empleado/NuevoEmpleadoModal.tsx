import { PersonaModal } from "../PersonaModal";
import { FormNuevoEmpleado } from "./FormNuevoEmpleado";
import type { EmpleadoListItem } from "../../../../types/empleado";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
  /** Pass to open in edit mode with prefilled data */
  editEmpleado?: EmpleadoListItem | null;
};

export function NuevoEmpleadoModal({
  open,
  onClose,
  onSuccess,
  requestHeaders,
  editEmpleado = null,
}: Props) {
  const title = editEmpleado ? "Editar empleado" : "Nuevo Empleado";

  return (
    <PersonaModal open={open} onClose={onClose} title={title}>
      <FormNuevoEmpleado
        key={editEmpleado?.nit_empleado ?? "create"}
        onClose={onClose}
        onSuccess={onSuccess}
        requestHeaders={requestHeaders}
        initial={editEmpleado}
      />
    </PersonaModal>
  );
}
