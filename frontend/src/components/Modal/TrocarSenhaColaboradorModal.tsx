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

interface TrocarSenhaColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  colaborador: Colaborador;
}

export function TrocarSenhaColaboradorModal({
  isOpen,
  onClose,
  onSuccess,
  colaborador,
}: TrocarSenhaColaboradorModalProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNovaSenha("");
      setConfirmarSenha("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      showToast({
        type: "error",
        message: "As senhas não coincidem!",
      });
      return;
    }

    setLoading(true);

    try {
      await apiFetch.patch("/api/colaboradores/trocarSenhaAdmin", {
        id_colaborador: colaborador.id_colaborador,
        senha: novaSenha,
      });

      showToast({
        type: "success",
        message: "Senha do colaborador atualizada com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar a senha.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Alterar Senha - ${colaborador?.nome || ""}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nova Senha
          </label>
          <input
            required
            type="password"
            placeholder="Digite a nova senha"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Confirmar Nova Senha
          </label>
          <input
            required
            type="password"
            placeholder="Confirme a nova senha"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white outline-none focus:border-blue-500"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>
        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Alterar Senha"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
