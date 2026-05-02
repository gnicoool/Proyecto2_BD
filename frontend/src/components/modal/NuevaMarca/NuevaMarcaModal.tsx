import { PersonaModal } from "../NuevaPersona/PersonaModal";
import { FormNuevaMarca } from "./FormNuevaMarca";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function NuevaMarcaModal({ open, onClose, onSuccess }: Props) {
  return (
    <PersonaModal open={open} onClose={onClose} title="Nueva Marca">
      <FormNuevaMarca onClose={onClose} onSuccess={onSuccess} />
    </PersonaModal>
  );
}