"use client";

import { useState } from "react";

import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { useAuth } from "../../hooks/useAuth";

interface CadastrarFilialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId?: string | number;
}

export function CadastrarFilialModal({
  isOpen,
  onClose,
  onSuccess,
  empresaId: empresaIdProp,
}: CadastrarFilialModalProps) {
  const { usuario } = useAuth();
  const empresaId = empresaIdProp || usuario?.id_empresa;

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
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
      await apiFetch.post("/api/filiais", {
        id_empresa: empresaId,
        nome,
        endereco,
        bairro,
        cidade,
        uf,
      });

      showToast({
        type: "success",
        message: "Filial cadastrada com sucesso!",
      });

      onSuccess();
      onClose();

      setNome("");
      setEndereco("");
      setBairro("");
      setCidade("");
      setUf("");
    } catch (error) {
      console.error("Erro ao cadastrar filial:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível cadastrar a filial.";

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
      title="Cadastrar Nova Filial"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome da filial
          </label>

          <input
            required
            placeholder="Ex: Filial Centro"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Endereço
          </label>

          <input
            placeholder="Rua, número, complemento"
            className={inputClass}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Bairro
          </label>

          <input
            placeholder="Bairro"
            className={inputClass}
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Cidade
            </label>

            <input
              placeholder="Cidade"
              className={inputClass}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              UF
            </label>

            <input
              maxLength={2}
              placeholder="UF"
              className={inputClass}
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
            />
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
              {loading ? "Salvando..." : "Cadastrar filial"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
