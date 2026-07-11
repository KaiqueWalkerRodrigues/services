"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface Empresa {
  id_empresa: number;
  nome: string;
  codigo_empresa: string | number;
}

interface DeletarEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresa: Empresa;
}

export function DeletarEmpresaModal({
  isOpen,
  onClose,
  onSuccess,
  empresa,
}: DeletarEmpresaModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDeletar = async () => {
    setLoading(true);
    try {
      await apiFetch.delete(`/api/empresas`, {
        data: {
          id_empresa: empresa.id_empresa,
        },
      });
      showToast({ type: "success", message: "Empresa excluída com sucesso!" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível excluir a empresa.";
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
          Deseja deletar a empresa?
        </h3>
        <p className="text-[#9ca3af] text-sm">
          Você deseja deletar a empresa{" "}
          <span className="font-bold text-white">{empresa.nome}</span> (
          <span className="font-bold text-white">{empresa.codigo_empresa}</span>
          ), essa ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
}
