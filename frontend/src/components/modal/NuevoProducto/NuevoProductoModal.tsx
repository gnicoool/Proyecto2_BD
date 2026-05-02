import { PersonaModal } from "../NuevaPersona/PersonaModal";
import { FormNuevoProducto } from "./FormNuevoProducto";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
};

export function NuevoProductoModal({ open, onClose, onSuccess, requestHeaders }: Props) {
  return (
    <PersonaModal open={open} onClose={onClose} title="Nuevo Producto">
      <FormNuevoProducto
        open={open}
        onClose={onClose}
        onSuccess={onSuccess}
        requestHeaders={requestHeaders}
      />
    </PersonaModal>
  );
}