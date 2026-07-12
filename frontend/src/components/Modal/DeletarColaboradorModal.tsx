"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface Colaborador {
  id_colaborador: number;
  nome: string;
}

interface DeletarColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  colaborador: Colaborador;
}

export function DeletarColaboradorModal({
  isOpen,
  onClose,
  onSuccess,
  colaborador,
}: DeletarColaboradorModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDeletar = async () => {
    setLoading(true);
    try {
      await apiFetch.delete(`/api/colaboradores`, {
        data: {
          id_colaborador: colaborador.id_colaborador,
        },
      });
      showToast({
        type: "success",
        message: "Colaborador excluída com sucesso!",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir colaborador:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível excluir a colaborador.";
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
          Deseja deletar o colaborador?
        </h3>
        <p className="text-[#9ca3af] text-sm">
          Você deseja deletar a colaborador{" "}
          <span className="font-bold text-white">{colaborador.nome}</span>, essa
          ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
}
