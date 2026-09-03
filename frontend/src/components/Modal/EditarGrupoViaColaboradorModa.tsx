"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";

interface Grupo {
  id: string;
  nome: string;
  prestador?: boolean | number | string;
}

interface EditarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grupo: Grupo | null;
}

export function EditarGrupoModal({
  isOpen,
  onClose,
  onSuccess,
  grupo,
}: EditarGrupoModalProps) {
  const [nome, setNome] = useState("");
  const [prestador, setPrestador] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!grupo) {
      setNome("");
      setPrestador(false);
      return;
    }
    setNome(grupo.nome || "");
    setPrestador(
      grupo.prestador === true ||
        grupo.prestador === 1 ||
        grupo.prestador === "1",
    );
  }, [grupo]);

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grupo?.id) {
      showToast({
        type: "error",
        message: "ID do grupo não encontrado.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id_grupo: grupo.id,
        nome,
        prestador,
      };

      await apiFetch.put(`/api/grupos/${grupo.id}`, payload);

      showToast({
        type: "success",
        message: "Grupo atualizado com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar o grupo.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Grupo" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome do grupo
          </label>
          <input
            required
            type="text"
            placeholder="Nome do grupo"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={prestador}
            onChange={(e) => setPrestador(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/[0.03] text-violet-600 focus:ring-violet-500"
          />
          Grupo prestador
        </label>

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
