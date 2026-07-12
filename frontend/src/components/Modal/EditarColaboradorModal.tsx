"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";

interface Colaborador {
  id_colaborador: string | number;
  nome: string;
  login: string;
}

interface EditarColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  colaborador: Colaborador;
}

export function EditarColaboradorModal({
  isOpen,
  onClose,
  onSuccess,
  colaborador,
}: EditarColaboradorModalProps) {
  const [nome, setNome] = useState(colaborador.nome ?? "");
  const [login, setLogin] = useState(colaborador.login ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNome(colaborador.nome ?? "");
    setLogin(colaborador.login ?? "");
  }, [colaborador]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch.put("/api/colaboradores", {
        id_colaborador: Number(colaborador.id_colaborador),
        nome,
        login,
      });
      showToast({
        type: "success",
        message: "Colaborador atualizado com sucesso!",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar o colaborador.";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Colaborador"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome do Colaborador
          </label>
          <input
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Login
          </label>
          <input
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>
        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
