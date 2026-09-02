"use client";

import { useState } from "react";

import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { useAuth } from "../../hooks/useAuth";

interface CadastrarServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId?: string | number;
}

export function CadastrarServicoModal({
  isOpen,
  onClose,
  onSuccess,
  empresaId: empresaIdProp,
}: CadastrarServicoModalProps) {
  const { usuario } = useAuth();
  const empresaId = empresaIdProp || usuario?.id_empresa;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaId) {
      showToast({
        type: "error",
        message: "Não foi possível identificar a empresa do usuário.",
      });
      return;
    }

    setLoading(true);

    try {
      await apiFetch.post("/api/servicos", {
        id_empresa: empresaId,
        nome,
        descricao,
      });

      showToast({
        type: "success",
        message: "Serviço cadastrado com sucesso!",
      });

      onSuccess();
      onClose();

      setNome("");
      setValor("");
    } catch (error) {
      console.error("Erro ao cadastrar serviço:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível cadastrar o serviço.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Serviço"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome do serviço
          </label>

          <input
            required
            placeholder="Ex: Instalação de Equipamento"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Descricao
            </label>

            <textarea
              className={inputClass}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>

            <Button
              type="submit"
              disabled={loading || !empresaId}
              className="rounded-xl border border-violet-400/10 bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-none transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Cadastrar serviço"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
