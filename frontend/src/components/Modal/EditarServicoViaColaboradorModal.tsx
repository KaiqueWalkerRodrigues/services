"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";

interface Servico {
  id: string;
  nome: string;
  peso?: number | string;
  valor?: number | string;
  criadoEm?: string;
}

interface EditarServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servico: Servico | null;
}

export function EditarServicoModal({
  isOpen,
  onClose,
  onSuccess,
  servico,
}: EditarServicoModalProps) {
  const [nome, setNome] = useState("");
  const [peso, setPeso] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!servico) {
      setNome("");
      setPeso("");
      setValor("");
      return;
    }

    setNome(servico.nome || "");
    setPeso(
      servico.peso !== undefined && servico.peso !== null
        ? String(servico.peso)
        : "",
    );
    setValor(
      servico.valor !== undefined && servico.valor !== null
        ? String(servico.valor)
        : "",
    );
  }, [servico]);

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!servico?.id) {
      showToast({
        type: "error",
        message: "ID do serviço não encontrado.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        id_servico: servico.id,
        nome,
        peso: peso ? Number(peso) : null,
        valor: valor ? Number(valor) : null,
      };

      await apiFetch.put(`/api/servicos/${servico.id}`, payload);

      showToast({
        type: "success",
        message: "Serviço atualizado com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar o serviço.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Serviço" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome do serviço
          </label>
          <input
            required
            type="text"
            placeholder="Nome do serviço"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Peso e Valor */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Peso
            </label>
            <input
              type="number"
              step="any"
              placeholder="Ex: 1.0"
              className={inputClass}
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 150.00"
              className={inputClass}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
        </div>

        {/* Ações */}
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
              disabled={loading}
              className="rounded-xl border border-violet-400/10 bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-none transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
