"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface Filial {
  id: string;
  nome: string;
}

interface DeletarFilialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  filial: Filial | null;
}

export function DeletarFilialModal({
  isOpen,
  onClose,
  onSuccess,
  filial,
}: DeletarFilialModalProps) {
  const [loading, setLoading] = useState(false);

  if (!filial) return null;

  const handleDeletar = async () => {
    setLoading(true);
    try {
      await apiFetch.delete(`/api/filiais`, {
        data: {
          id_filial: filial.id,
        },
      });
      showToast({ type: "success", message: "Filial excluída com sucesso!" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir filial:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível excluir a filial.";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="delete"
      size="sm"
      onConfirm={handleDeletar}
    >
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">
          Deseja deletar a filial?
        </h3>
        <p className="text-[#9ca3af] text-sm">
          Você deseja deletar a filial{" "}
          <span className="font-bold text-white">{filial.nome}</span>, essa ação
          não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
}
