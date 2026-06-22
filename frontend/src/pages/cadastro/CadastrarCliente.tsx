"use client";

import { useState } from "react";
import { ArrowLeft, User, CheckCircle2, Check } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const getCircleStyle = (step: number) => {
    if (currentStep > step)
      return "bg-[#22c55e] text-white border-none shadow-[0_0_10px_rgba(34,197,94,0.3)]";
    if (currentStep === step) return "bg-[#f4f4f4] text-black border-none";
    return "bg-[#1c1c1c] text-[#555] border border-[#2a2a2a]";
  };

  const getLineStyle = (step: number) => {
    if (currentStep > step) return "bg-[#22c55e] h-[2px]";
    return "bg-[#2a2a2a] h-px";
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-8 mt-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${getCircleStyle(1)}`}
      >
        1
      </div>
      <div
        className={`w-6 transition-all duration-500 ${getLineStyle(1)}`}
      ></div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${getCircleStyle(2)}`}
      >
        2
      </div>
      <div
        className={`w-6 transition-all duration-500 ${getLineStyle(2)}`}
      ></div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${getCircleStyle(3)}`}
      >
        3
      </div>
    </div>
  );
};

export default function CadastrarCliente() {
  const [passoAtual, setPassoAtual] = useState(1);

  const [dadosFormulario, setDadosFormulario] = useState({
    nome: "",
    sobrenome: "",
    celular: "",
    email: "",
    senha: "",
  });

  const atualizarDados = (novosDados: Partial<typeof dadosFormulario>) => {
    setDadosFormulario((prev) => ({ ...prev, ...novosDados }));
  };

  const avancarPasso = () => setPassoAtual((prev) => prev + 1);
  const voltarPasso = () => setPassoAtual((prev) => prev - 1);
  const voltarParaLogin = () => {
    window.location.href = "/login";
  };

  const handleFinalizarCadastro = async () => {
    // Normalize name/surname: trim, lowercase then capitalize first letter
    const capitalize = (s: string) =>
      s
        ? s
            .trim()
            .toLowerCase()
            .replace(/^./, (c) => c.toUpperCase())
        : "";

    const nomeCap = capitalize(dadosFormulario.nome);
    const sobrenomeCap = capitalize(dadosFormulario.sobrenome);
    const nomeCompleto = sobrenomeCap ? `${nomeCap} ${sobrenomeCap}` : nomeCap;

    // Remove non-numeric chars from celular
    const celularOnly = (dadosFormulario.celular || "").replace(/\D/g, "");

    const payload = {
      nome: nomeCompleto,
      email: dadosFormulario.email,
      senha: dadosFormulario.senha,
      celular: celularOnly || null,
    };

    const payloadJson = JSON.stringify(payload);

    try {
      const response = await fetch("http://localhost:81/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadJson,
      });

      if (response.ok) {
        toast.success("Usuário cadastrado com sucesso!", { duration: 1250 });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1250);
      } else {
        toast.error("Erro ao processar o cadastro no servidor.", { duration: 1250 });
      }
    } catch (error) {
      toast.error("Erro na requisição.", { duration: 1250 });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <Toaster position="top-right" />
      <div className="w-full max-w-[420px] p-8 rounded-[24px] bg-[#141414] border border-[#222] shadow-2xl z-10">
        {passoAtual === 1 && (
          <RegisterStep1
            dados={dadosFormulario}
            atualizarDados={atualizarDados}
            onNext={avancarPasso}
            onBack={voltarParaLogin}
          />
        )}
        {passoAtual === 2 && (
          <RegisterStep2
            dados={dadosFormulario}
            atualizarDados={atualizarDados}
            onNext={avancarPasso}
            onBack={voltarPasso}
          />
        )}
        {passoAtual === 3 && (
          <RegisterStep3
            dados={dadosFormulario}
            onNext={handleFinalizarCadastro}
            onBack={voltarPasso}
          />
        )}
      </div>
    </div>
  );
}

function RegisterStep1({ dados, atualizarDados, onNext, onBack }: any) {
  // Estados para a validação do celular
  const [celularErro, setCelularErro] = useState("");
  const [validandoCelular, setValidandoCelular] = useState(false);
  const [celularDisponivel, setCelularDisponivel] = useState(false);

  const verificarCelularNoBanco = async (celular: string) => {
    // Verifica se tem no mínimo 14 caracteres (formato com máscara)
    if (!celular || celular.length < 14) {
      setCelularDisponivel(false);
      return;
    }

    setValidandoCelular(true);
    setCelularErro("");
    setCelularDisponivel(false);

    try {
      // AQUÍ ENTRA O SEU CÓDIGO REAL DA API (exemplo):
      // const celularLimpo = celular.replace(/\D/g, "");
      // const response = await fetch(`http://localhost:81/api/clientes/verificar-celular?celular=${celularLimpo}`);
      // if (!response.ok) throw new Error("Este celular já está cadastrado.");

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Regra para testes (Remova depois)
      if (celular === "(11) 90000-0000") {
        throw new Error("Este número de celular já está cadastrado.");
      }

      setCelularDisponivel(true);
    } catch (error: any) {
      setCelularErro(error.message || "Celular indisponível.");
      setCelularDisponivel(false);
    } finally {
      setValidandoCelular(false);
    }
  };

  const lidarComTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (valor.length > 8) valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

    atualizarDados({ celular: valor });
    
    // Limpa erros e status quando o usuário volta a digitar
    setCelularErro("");
    setCelularDisponivel(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (celularErro || validandoCelular) return;
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <button
        type="button"
        onClick={onBack}
        className="self-start flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-6 text-[#9ca3af] hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Voltar ao login
      </button>

      <div
        className="mx-auto flex items-center justify-center rounded-full mb-4 bg-transparent border border-[#333]"
        style={{ width: 56, height: 56 }}
      >
        <User size={22} color="#9ca3af" strokeWidth={1.5} />
      </div>

      <h1 className="text-center text-[28px] font-bold mb-1 text-white tracking-tight">
        Criar conta
      </h1>
      <p className="text-center mb-2 text-[#9ca3af] text-[15px]">
        Dados <span className="text-[#3b82f6]">pessoais</span>
      </p>

      <StepIndicator currentStep={1} />

      <div className="flex flex-col gap-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Nome
            </label>
            <input
              required
              type="text"
              placeholder="João"
              value={dados.nome}
              onChange={(e) => atualizarDados({ nome: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Sobrenome
            </label>
            <input
              required
              type="text"
              placeholder="Silva"
              value={dados.sobrenome}
              onChange={(e) => atualizarDados({ sobrenome: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Celular
          </label>
          <div className="relative">
            <input
              required
              minLength={14}
              type="tel"
              placeholder="(11) 90000-0000"
              value={dados.celular}
              onChange={lidarComTelefone}
              onBlur={(e) => verificarCelularNoBanco(e.target.value)}
              className={`w-full bg-[#1c1c1c] text-white p-3.5 rounded-2xl outline-none transition-colors placeholder-[#6b7280] text-[15px] border ${
                celularErro
                  ? "border-red-500"
                  : celularDisponivel
                  ? "border-[#22c55e] focus:border-[#22c55e]"
                  : "border-[#2a2a2a] focus:border-[#4a4a4a]"
              }`}
            />
            {/* Feedback Loading Celular */}
            {validandoCelular && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-5 h-5 text-[#3b82f6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {/* Feedback Sucesso Celular */}
            {celularDisponivel && !validandoCelular && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                <Check size={20} className="text-[#22c55e]" strokeWidth={2.5} />
              </div>
            )}
          </div>
          {celularErro && (
            <p className="text-red-500 text-xs font-medium mt-1.5 animate-in fade-in">
              {celularErro}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={validandoCelular || !!celularErro}
        className={`w-full rounded-2xl font-semibold transition-all py-4 border-none text-[15px] ${
          validandoCelular || celularErro
            ? "bg-[#333] text-[#777] cursor-not-allowed"
            : "hover:bg-white active:scale-[0.98] cursor-pointer bg-[#f4f4f4] text-black"
        }`}
      >
        Continuar
      </button>
    </form>
  );
}

function RegisterStep2({ dados, atualizarDados, onNext, onBack }: any) {
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  // Estados para a validação do e-mail
  const [emailErro, setEmailErro] = useState("");
  const [validandoEmail, setValidandoEmail] = useState(false);
  const [emailDisponivel, setEmailDisponivel] = useState(false);

  const verificarEmailNoBanco = async (email: string) => {
    if (!email || !email.includes("@")) {
      setEmailDisponivel(false);
      return;
    }

    setValidandoEmail(true);
    setEmailErro("");
    setEmailDisponivel(false);

    try {
      // AQUÍ ENTRA O SEU CÓDIGO REAL DA API (exemplo):
      // const response = await fetch(`http://localhost:81/api/clientes/verificar-email?email=${email}`);
      // if (!response.ok) throw new Error("Este e-mail já está cadastrado.");

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Regra para testes (Remova depois)
      if (email === "teste@teste.com") {
        throw new Error("Este e-mail já está cadastrado.");
      }

      setEmailDisponivel(true);
    } catch (error: any) {
      setEmailErro(error.message || "E-mail indisponível.");
      setEmailDisponivel(false);
    } finally {
      setValidandoEmail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (emailErro || validandoEmail) return;

    if (dados.senha !== confirmarSenha) {
      setErro("As senhas não coincidem. Tente novamente.");
      return;
    }
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <button
        type="button"
        onClick={onBack}
        className="self-start flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-6 text-[#9ca3af] hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div
        className="mx-auto flex items-center justify-center rounded-full mb-4 bg-transparent border border-[#333]"
        style={{ width: 56, height: 56 }}
      >
        <User size={22} color="#9ca3af" strokeWidth={1.5} />
      </div>

      <h1 className="text-center text-[28px] font-bold mb-1 text-white tracking-tight">
        Criar conta
      </h1>
      <p className="text-center mb-2 text-[#9ca3af] text-[15px]">
        Dados de <span className="text-[#3b82f6]">acesso</span>
      </p>

      <StepIndicator currentStep={2} />

      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            E-mail
          </label>
          <div className="relative">
            <input
              required
              type="email"
              placeholder="seu@email.com"
              value={dados.email}
              onChange={(e) => {
                atualizarDados({ email: e.target.value });
                setEmailErro("");
                setEmailDisponivel(false);
              }}
              onBlur={(e) => verificarEmailNoBanco(e.target.value)}
              className={`w-full bg-[#1c1c1c] text-white p-3.5 rounded-2xl outline-none transition-colors placeholder-[#6b7280] text-[15px] border ${
                emailErro
                  ? "border-red-500"
                  : emailDisponivel
                  ? "border-[#22c55e] focus:border-[#22c55e]"
                  : "border-[#2a2a2a] focus:border-[#4a4a4a]"
              }`}
            />
            {/* Feedback Loading Email */}
            {validandoEmail && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-5 h-5 text-[#3b82f6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {/* Feedback Sucesso Email */}
            {emailDisponivel && !validandoEmail && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                <Check size={20} className="text-[#22c55e]" strokeWidth={2.5} />
              </div>
            )}
          </div>
          {emailErro && (
            <p className="text-red-500 text-xs font-medium mt-1.5 animate-in fade-in">
              {emailErro}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Senha
            </label>
            <input
              required
              minLength={6}
              type="password"
              placeholder="••••••••"
              value={dados.senha}
              onChange={(e) => atualizarDados({ senha: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Confirmar Senha
            </label>
            <input
              required
              minLength={6}
              type="password"
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`w-full bg-[#1c1c1c] text-white p-3.5 rounded-2xl outline-none transition-colors placeholder-[#6b7280] text-[15px] border ${
                erro ? "border-red-500" : "border-[#2a2a2a] focus:border-[#4a4a4a]"
              }`}
            />
          </div>
        </div>
        {erro && (
          <p className="text-red-500 text-sm font-medium mt-1 animate-in fade-in">
            {erro}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={validandoEmail || !!emailErro}
        className={`w-full rounded-2xl font-semibold transition-all py-4 border-none text-[15px] ${
          validandoEmail || emailErro
            ? "bg-[#333] text-[#777] cursor-not-allowed"
            : "hover:bg-white active:scale-[0.98] cursor-pointer bg-[#f4f4f4] text-black"
        }`}
      >
        Continuar
      </button>
    </form>
  );
}

function RegisterStep3({ dados, onNext, onBack }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <button
        type="button"
        onClick={onBack}
        className="self-start flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-6 text-[#9ca3af] hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div
        className="mx-auto flex items-center justify-center rounded-full mb-4 bg-transparent border border-[#333]"
        style={{ width: 56, height: 56 }}
      >
        <CheckCircle2 size={24} color="#22c55e" strokeWidth={2} />
      </div>

      <h1 className="text-center text-[28px] font-bold mb-1 text-white tracking-tight">
        Tudo certo?
      </h1>
      <p className="text-center mb-2 text-[#9ca3af] text-[15px]">
        Confirme seus <span className="text-[#3b82f6]">dados</span>
      </p>

      <StepIndicator currentStep={3} />

      <div className="flex flex-col gap-4 mb-8 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-5">
        <div className="border-b border-[#2a2a2a] pb-3">
          <p className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-1">
            Nome Completo
          </p>
          <p className="text-white font-medium text-[15px]">
            {dados.nome} {dados.sobrenome}
          </p>
        </div>

        <div className="border-b border-[#2a2a2a] pb-3">
          <p className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-1">
            Celular
          </p>
          <p className="text-white font-medium text-[15px]">{dados.celular}</p>
        </div>

        <div>
          <p className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-1">
            E-mail de Acesso
          </p>
          <p className="text-white font-medium text-[15px]">{dados.email}</p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl font-semibold hover:bg-[#22c55e] hover:text-white active:scale-[0.98] transition-all cursor-pointer bg-[#f4f4f4] text-black py-4 border-none text-[15px]"
      >
        Confirmar e Criar Conta
      </button>
    </form>
  );
}