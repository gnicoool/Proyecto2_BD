import { PersonaModal } from "../PersonaModal";
import { FormNuevoProveedor } from "./FormNuevoProveedor";
import type { ProveedorListItem } from "../../../../types/proveedor";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
  editProveedor?: ProveedorListItem | null;
};

export function NuevoProveedorModal({
  open,
  onClose,
  onSuccess,
  requestHeaders,
  editProveedor = null,
}: Props) {
  const title = editProveedor ? "Editar proveedor" : "Nuevo Proveedor";

  return (
    <PersonaModal open={open} onClose={onClose} title={title}>
      <FormNuevoProveedor
        key={editProveedor?.nit_proveedor ?? "create"}
        onClose={onClose}
        onSuccess={onSuccess}
        requestHeaders={requestHeaders}
        initial={editProveedor}
      />
    </PersonaModal>
  );
}
