"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface Grupo {
  id: string;
  nome: string;
}

interface DeletarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grupo: Grupo | null;
}

export function DeletarGrupoModal({
  isOpen,
  onClose,
  onSuccess,
  grupo,
}: DeletarGrupoModalProps) {
  const [loading, setLoading] = useState(false);

  if (!grupo) return null;

  const handleDeletar = async () => {
    setLoading(true);
    try {
      await apiFetch.delete(`/api/grupos`, {
        data: {
          id_grupo: grupo.id,
        },
      });
      showToast({ type: "success", message: "Grupo excluído com sucesso!" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível excluir o grupo.";
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
          Deseja deletar o grupo?
        </h3>
        <p className="text-[#9ca3af] text-sm">
          Você deseja deletar o grupo{" "}
          <span className="font-bold text-white">{grupo.nome}</span>, essa ação
          não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
}
