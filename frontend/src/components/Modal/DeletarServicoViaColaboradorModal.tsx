"use client";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { showToast } from "../Toast";

interface Servico {
  id: string;
  nome: string;
}

interface DeletarServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servico: Servico | null;
}

export function DeletarServicoModal({
  isOpen,
  onClose,
  onSuccess,
  servico,
}: DeletarServicoModalProps) {
  if (!servico) return null;

  const handleDeletar = async () => {
    try {
      await apiFetch.delete(`/api/servicos`, {
        data: {
          id_servico: servico.id,
        },
      });
      showToast({ type: "success", message: "Serviço excluído com sucesso!" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      const errorData = (
        error as {
          response?: { data?: { message?: string; mensagem?: string } };
        }
      )?.response?.data;
      const errorMessage =
        errorData?.message ||
        errorData?.mensagem ||
        "Não foi possível excluir o serviço.";
      showToast({ type: "error", message: errorMessage });
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
          Deseja deletar o serviço?
        </h3>
        <p className="text-[#9ca3af] text-sm">
          Você deseja deletar o serviço{" "}
          <span className="font-bold text-white">{servico.nome}</span>, essa
          ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
}
