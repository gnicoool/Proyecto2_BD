import { PersonaModal } from "../NuevaPersona/PersonaModal";
import { FormNuevoProducto, type ProductoEditInput } from "./FormNuevoProducto";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requestHeaders?: HeadersInit;
  editProduct?: ProductoEditInput | null;
};

export function NuevoProductoModal({
  open,
  onClose,
  onSuccess,
  requestHeaders,
  editProduct,
}: Props) {
  const isEdit = editProduct != null;

  return (
    <PersonaModal open={open} onClose={onClose} title={isEdit ? "Editar producto" : "Nuevo producto"}>
      <FormNuevoProducto
        open={open}
        onClose={onClose}
        onSuccess={onSuccess}
        requestHeaders={requestHeaders}
        editProduct={editProduct}
      />
    </PersonaModal>
  );
}
