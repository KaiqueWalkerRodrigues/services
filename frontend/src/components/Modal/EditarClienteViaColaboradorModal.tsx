"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { KeyRound } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  criadoEm?: string;
}

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente: Cliente | null;
}

export function EditarClienteModal({
  isOpen,
  onClose,
  onSuccess,
  cliente,
}: EditarClienteModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cliente) {
      setNome("");
      setEmail("");
      setCelular("");
      setSenha("");
      return;
    }

    setNome(cliente.nome || "");
    setEmail(cliente.email || "");
    setCelular(cliente.telefone || "");
    setSenha("");
  }, [cliente]);

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente?.id) {
      showToast({
        type: "error",
        message: "ID do cliente não encontrado.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        id_cliente: cliente.id, // Adicionado conforme solicitado
        nome,
        email,
        celular,
      };

      // Envia a senha apenas se foi preenchida
      if (senha.trim() !== "") {
        payload.senha = senha;
      }

      await apiFetch.put(`/api/clientes/${cliente.id}`, payload);

      showToast({
        type: "success",
        message: "Cliente atualizado com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível atualizar o cliente.";

      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome completo
          </label>

          <input
            required
            type="text"
            placeholder="Nome do cliente"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* E-mail */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            E-mail
          </label>

          <input
            required
            type="email"
            placeholder="E-mail do cliente"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Celular */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Celular / WhatsApp
          </label>

          <input
            required
            type="text"
            placeholder="(11) 99999-9999"
            className={inputClass}
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
        </div>

        {/* Senha */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nova senha
            <span className="ml-1 font-normal text-zinc-600">(opcional)</span>
          </label>

          <div className="relative">
            <input
              type="text"
              placeholder="Deixe vazio para manter a atual"
              className={`${inputClass} pr-10 font-mono`}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <KeyRound
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-zinc-600
              "
            />
          </div>

          <p className="mt-1.5 text-[11px] text-zinc-600">
            Preencha somente se quiser alterar a senha.
          </p>
        </div>

        {/* Ações */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-xl
                border border-white/5
                bg-white/[0.03]
                px-4
                py-2.5
                text-sm
                font-medium
                text-zinc-400
                transition-colors
                hover:bg-white/[0.06]
                hover:text-white
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <Button
              type="submit"
              disabled={loading}
              className="
                rounded-xl
                border border-violet-400/10
                bg-violet-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-none
                transition-colors
                hover:bg-violet-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
