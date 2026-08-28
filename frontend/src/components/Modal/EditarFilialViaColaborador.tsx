"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";

interface Filial {
  id: string;
  nome: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  criadoEm?: string;
}

interface EditarFilialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  filial: Filial | null;
}

export function EditarFilialModal({
  isOpen,
  onClose,
  onSuccess,
  filial,
}: EditarFilialModalProps) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filial) {
      setNome("");
      setEndereco("");
      setBairro("");
      setCidade("");
      setUf("");
      return;
    }

    setNome(filial.nome || "");
    setEndereco(filial.endereco || "");
    setBairro(filial.bairro || "");
    setCidade(filial.cidade || "");
    setUf(filial.uf || "");
  }, [filial]);

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!filial?.id) {
      showToast({
        type: "error",
        message: "ID da filial não encontrado.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        id_filial: filial.id,
        nome,
        endereco,
        bairro,
        cidade,
        uf,
      };

      await apiFetch.put(`/api/filiais/${filial.id}`, payload);

      showToast({
        type: "success",
        message: "Filial atualizada com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar filial:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar a filial.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Filial" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome da filial
          </label>
          <input
            required
            type="text"
            placeholder="Nome da filial"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Endereço */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Endereço
          </label>
          <input
            type="text"
            placeholder="Rua, número, complemento"
            className={inputClass}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>

        {/* Bairro */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Bairro
          </label>
          <input
            type="text"
            placeholder="Bairro"
            className={inputClass}
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </div>

        {/* Cidade e UF */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Cidade
            </label>
            <input
              type="text"
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
              type="text"
              maxLength={2}
              placeholder="UF"
              className={inputClass}
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
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
