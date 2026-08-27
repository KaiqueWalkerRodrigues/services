"use client";

import { useState } from "react";

import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { KeyRound, RefreshCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface CadastrarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CadastrarClienteModal({
  isOpen,
  onClose,
  onSuccess,
}: CadastrarClienteModalProps) {
  const { usuario } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const gerarSenhaFacil = () => {
    const palavras = [
      "Alfa",
      "Beta",
      "Luz",
      "Sol",
      "Top",
      "Max",
      "Prime",
      "VIP",
    ];

    const palavraAleatoria =
      palavras[Math.floor(Math.random() * palavras.length)];

    const numeroAleatorio = Math.floor(100 + Math.random() * 900);

    setSenha(`${palavraAleatoria}${numeroAleatorio}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario?.id_empresa) {
      showToast({
        type: "error",
        message: "Não foi possível identificar a empresa do usuário.",
      });
      return;
    }

    setLoading(true);

    try {
      await apiFetch.post("/api/clientes", {
        id_empresa: usuario.id_empresa,
        nome,
        email,
        celular,
        senha,
      });

      showToast({
        type: "success",
        message: "Cliente cadastrado com sucesso!",
      });

      onSuccess();
      onClose();

      setNome("");
      setEmail("");
      setCelular("");
      setSenha("");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.mensagem ||
        "Não foi possível cadastrar o cliente.";

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
      title="Cadastrar Novo Cliente"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nome completo
          </label>

          <input
            required
            placeholder="Ex: João da Silva"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            E-mail
          </label>

          <input
            required
            type="email"
            placeholder="exemplo@email.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Celular / WhatsApp
          </label>

          <input
            required
            placeholder="(11) 99999-9999"
            className={inputClass}
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-400">
              Senha temporária
            </label>

            <button
              type="button"
              onClick={gerarSenhaFacil}
              className="
                flex items-center gap-1.5
                rounded-lg
                px-2
                py-1
                text-[11px]
                font-medium
                text-zinc-500
                transition-colors
                hover:bg-violet-500/10
                hover:text-violet-400
              "
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Gerar senha
            </button>
          </div>

          <div className="relative">
            <input
              required
              type="text"
              placeholder="Digite ou gere uma senha"
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
            Senha padrão para o primeiro acesso do cliente.
          </p>
        </div>

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
              disabled={loading || !usuario?.id_empresa}
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
              {loading ? "Salvando..." : "Cadastrar cliente"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
