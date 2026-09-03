"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import apiFetch from "../../config/apiFetch";
import { Button } from "../Button";
import { showToast } from "../Toast";
import { Loader2 } from "lucide-react";

interface Filial {
  id: string;
  nome: string;
}

interface Servico {
  id: string;
  nome: string;
}

interface ParametrosFilialServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servico: Servico | null;
  filial: Filial | null;
}

export function ParametrosFilialServicoModal({
  isOpen,
  onClose,
  onSuccess,
  servico,
  filial,
}: ParametrosFilialServicoModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [valor, setValor] = useState("");
  const [duracao, setDuracao] = useState("");
  const [bufferAntes, setBufferAntes] = useState("");
  const [bufferDepois, setBufferDepois] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!isOpen || !servico || !filial) return;

    const idServico = servico.id;
    const idFilial = filial.id;

    async function carregarConfiguracao() {
      setCarregando(true);
      try {
        const response = await apiFetch.get(
          `/api/servicos/filial/config?id_servico=${idServico}&id_filial=${idFilial}`,
        );
        const config = response.data?.dados;

        if (config) {
          setValor(config.valor !== undefined ? String(config.valor) : "");
          setDuracao(
            config.duracao !== undefined ? String(config.duracao) : "",
          );
          setBufferAntes(
            config.buffer_antes !== undefined
              ? String(config.buffer_antes)
              : "",
          );
          setBufferDepois(
            config.buffer_depois !== undefined
              ? String(config.buffer_depois)
              : "",
          );
          setAtivo(config.ativo ?? true);
        } else {
          setValor("");
          setDuracao("");
          setBufferAntes("");
          setBufferDepois("");
          setAtivo(true);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações da filial:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarConfiguracao();
  }, [isOpen, servico, filial]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servico || !filial) return;

    setSalvando(true);
    try {
      await apiFetch.post("/api/servicos/filial/config", {
        id_servico: servico.id,
        id_filial: filial.id,
        valor: valor ? Number(valor) : null,
        duracao: duracao ? Number(duracao) : null,
        buffer_antes: bufferAntes ? Number(bufferAntes) : 0,
        buffer_depois: bufferDepois ? Number(bufferDepois) : 0,
        ativo,
      });

      showToast({
        type: "success",
        message: "Configurações salvas com sucesso!",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      showToast({
        type: "error",
        message: "Não foi possível salvar as configurações.",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (!servico || !filial) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Parametros: ${servico.nome} (${filial.nome})`}
      size="md"
    >
      {carregando ? (
        <div className="py-12 text-center text-sm text-zinc-400 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          Carregando configurações...
        </div>
      ) : (
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Duração (minutos)
            </label>
            <input
              type="number"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              placeholder="Ex: 30"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Buffer Antes (min)
              </label>
              <input
                type="number"
                value={bufferAntes}
                onChange={(e) => setBufferAntes(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Buffer Depois (min)
              </label>
              <input
                type="number"
                value={bufferDepois}
                onChange={(e) => setBufferDepois(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="ativo-filial"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-white/[0.03] text-violet-600 focus:ring-violet-500"
            />
            <label
              htmlFor="ativo-filial"
              className="text-xs font-medium text-zinc-300 cursor-pointer"
            >
              Serviço ativo nesta filial
            </label>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-end gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 flex items-center gap-2"
            >
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
