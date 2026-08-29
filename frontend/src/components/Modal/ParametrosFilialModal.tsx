"use client";

import { Modal } from "../Modal";
import { ParametrosFilialFormulario } from "../Formularios/ParametrosFilialFormulario";

interface Filial {
  id: string;
  nome: string;
}

interface ParametrosFilialModalProps {
  isOpen: boolean;
  onClose: () => void;
  filial: Filial | null;
}

export function ParametrosFilialModal({
  isOpen,
  onClose,
  filial,
}: ParametrosFilialModalProps) {
  if (!filial) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Parâmetros da Filial: ${filial.nome}`}
      size="xl"
    >
      <div className="py-2">
        <ParametrosFilialFormulario filialId={filial.id} />
      </div>
    </Modal>
  );
}
