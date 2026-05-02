import { PersonaModal } from "../NuevaPersona/PersonaModal";
import { FormNuevaCategoria } from "./FormNuevaCategoria";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function NuevaCategoriaModal({ open, onClose, onSuccess }: Props) {
  return (
    <PersonaModal open={open} onClose={onClose} title="Nueva categoría">
      <FormNuevaCategoria open={open} onClose={onClose} onSuccess={onSuccess} />
    </PersonaModal>
  );
}
