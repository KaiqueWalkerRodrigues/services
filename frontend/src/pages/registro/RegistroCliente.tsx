"use client";

import { useState } from "react";
import { ArrowLeft, User, CheckCircle2 } from "lucide-react";

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const getCircleStyle = (step: number) => {
    if (currentStep > step) return 'bg-[#22c55e] text-white border-none shadow-[0_0_10px_rgba(34,197,94,0.3)]';
    if (currentStep === step) return 'bg-[#f4f4f4] text-black border-none';
    return 'bg-[#1c1c1c] text-[#555] border border-[#2a2a2a]';
  };

  const getLineStyle = (step: number) => {
    if (currentStep > step) return 'bg-[#22c55e] h-[2px]';
    return 'bg-[#2a2a2a] h-px';
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-8 mt-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${getCircleStyle(1)}`}>1</div>
      <div className={`w-6 transition-all duration-500 ${getLineStyle(1)}`}></div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${getCircleStyle(2)}`}>2</div>
      <div className={`w-6 transition-all duration-500 ${getLineStyle(2)}`}></div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${getCircleStyle(3)}`}>3</div>
    </div>
  );
};

export default function RegistroCliente() {
  const [passoAtual, setPassoAtual] = useState(1);

  const [dadosFormulario, setDadosFormulario] = useState({
    nome: "",
    sobrenome: "",
    celular: "",
    email: "",
    senha: ""
  });


  const atualizarDados = (novosDados: Partial<typeof dadosFormulario>) => {
    setDadosFormulario((prev) => ({ ...prev, ...novosDados }));
  };

  const avancarPasso = () => setPassoAtual((prev) => prev + 1);
  const voltarPasso = () => setPassoAtual((prev) => prev - 1);
  const voltarParaLogin = () => { window.location.href = '/login'; };

  const handleFinalizarCadastro = async () => {
    const payloadJson = JSON.stringify(dadosFormulario);
    
    console.log("JSON pronto para envio:", payloadJson);
    
    try {
      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadJson
      });

      if (response.ok) {
        alert("Usuário cadastrado com sucesso!");
        window.location.href = '/login';
      } else {
        alert("Erro ao processar o cadastro no servidor.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
    window.location.href = '/login';
    };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
      
      {/* Opcional: Adicionando a mesma textura de fundo do Login para consistência */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      {/* Aplicação da animação cardIn no container principal */}
      <div 
        className="relative z-10 w-full max-w-[420px] p-8 rounded-[24px] bg-[#141414] border border-[#222] shadow-2xl"
        style={{ animation: "cardIn 0.6s 0.05s cubic-bezier(.22,1,.36,1) both" }}
      >
        {passoAtual === 1 && (
          <RegisterStep1 dados={dadosFormulario} atualizarDados={atualizarDados} onNext={avancarPasso} onBack={voltarParaLogin} />
        )}
        {passoAtual === 2 && (
          <RegisterStep2 dados={dadosFormulario} atualizarDados={atualizarDados} onNext={avancarPasso} onBack={voltarPasso} />
        )}
        {passoAtual === 3 && (
          <RegisterStep3 dados={dadosFormulario} onNext={handleFinalizarCadastro} onBack={voltarPasso} />
        )}
      </div>

      {/* Estilos de Animação */}
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function RegisterStep1({ dados, atualizarDados, onNext, onBack }: any) {
  
  const lidarComTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (valor.length > 8) valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    
    atualizarDados({ celular: valor }); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col w-full"
      style={{ animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1) both" }}
    >
      <button type="button" onClick={onBack} className="self-start flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-6 text-[#9ca3af] hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Voltar ao login
      </button>

      <div className="mx-auto flex items-center justify-center rounded-full mb-4 bg-transparent border border-[#333]" style={{ width: 56, height: 56 }}>
        <User size={22} color="#9ca3af" strokeWidth={1.5} />
      </div>

      <h1 className="text-center text-[28px] font-bold mb-1 text-white tracking-tight">Criar conta</h1>
      <p className="text-center mb-2 text-[#9ca3af] text-[15px]">
        Dados <span className="text-[#3b82f6]">pessoais</span>
      </p>

      <StepIndicator currentStep={1} />

      <div className="flex flex-col gap-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Nome</label>
            <input required type="text" placeholder="João" value={dados.nome} onChange={(e) => atualizarDados({ nome: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Sobrenome</label>
            <input required type="text" placeholder="Silva" value={dados.sobrenome} onChange={(e) => atualizarDados({ sobrenome: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Celular</label>
          <input required minLength={13} type="tel" placeholder="(11) 90000-0000" value={dados.celular} onChange={lidarComTelefone} className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]" />
        </div>
      </div>

      <button type="submit" className="w-full rounded-2xl font-semibold hover:bg-white active:scale-[0.98] transition-all cursor-pointer bg-[#f4f4f4] text-black py-4 border-none text-[15px]">
        Continuar
      </button>
    </form>
  );
}

function RegisterStep2({ dados, atualizarDados, onNext, onBack }: any) {
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (dados.senha !== confirmarSenha) {
      setErro("As senhas não coincidem. Tente novamente.");
      return;
    }
    onNext();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col w-full"
      style={{ animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1) both" }}
    >
      <button type="button" onClick={onBack} className="self-start flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-6 text-[#9ca3af] hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="mx-auto flex items-center justify-center rounded-full mb-4 bg-transparent border border-[#333]" style={{ width: 56, height: 56 }}>
        <User size={22} color="#9ca3af" strokeWidth={1.5} />
      </div>

      <h1 className="text-center text-[28px] font-bold mb-1 text-white tracking-tight">Criar conta</h1>
      <p className="text-center mb-2 text-[#9ca3af] text-[15px]">
        Dados de <span className="text-[#3b82f6]">acesso</span>
      </p>

      <StepIndicator currentStep={2} />

      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">E-mail</label>
          <input required type="email" placeholder="seu@email.com" value={dados.email} onChange={(e) => atualizarDados({ email: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Senha</label>
            <input required minLength={6} type="password" placeholder="••••••••" value={dados.senha} onChange={(e) => atualizarDados({ senha: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white p-3.5 rounded-2xl outline-none focus:border-[#4a4a4a] transition-colors placeholder-[#6b7280] text-[15px]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Confirmar Senha</label>
            <input required minLength={6} type="password" placeholder="••••••••" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={`w-full bg-[#1c1c1c] text-white p-3.5 rounded-2xl outline-none transition-colors placeholder-[#6b7280] text-[15px] border ${erro ? 'border-red-500' : 'border-[#2a2a2a] focus:border-[#4a4a4a]'}`} />
          </div>
        </div>
        {erro && <p className="text-red-500 text-sm font-medium mt-1 animate-in fade-in">{erro}</p>}
      </div>

      <button type="submit" className="w-full rounded-2xl font-semibold hover:bg-white active:scale-[0.98] transition-all cursor-pointer bg-[#f4f4f4] text-black py-4 border-none text-[15px]">
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
      className="flex flex-col w-full"
      style={{ animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1) both" }}
    >
      <button type="button" onClick={onBack} className="self-start flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 mb-6 text-[#9ca3af] hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="mx-auto flex items-center justify-center rounded-full mb-4 bg-transparent border border-[#333]" style={{ width: 56, height: 56 }}>
        <CheckCircle2 size={24} color="#22c55e" strokeWidth={2} />
      </div>

      <h1 className="text-center text-[28px] font-bold mb-1 text-white tracking-tight">Tudo certo?</h1>
      <p className="text-center mb-2 text-[#9ca3af] text-[15px]">
        Confirme seus <span className="text-[#3b82f6]">dados</span>
      </p>

      <StepIndicator currentStep={3} />

      <div className="flex flex-col gap-4 mb-8 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-5">
        
        <div className="border-b border-[#2a2a2a] pb-3">
          <p className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-1">Nome Completo</p>
          <p className="text-white font-medium text-[15px]">{dados.nome} {dados.sobrenome}</p>
        </div>

        <div className="border-b border-[#2a2a2a] pb-3">
          <p className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-1">Celular</p>
          <p className="text-white font-medium text-[15px]">{dados.celular}</p>
        </div>

        <div>
          <p className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-1">E-mail de Acesso</p>
          <p className="text-white font-medium text-[15px]">{dados.email}</p>
        </div>
        
      </div>

      <button type="submit" className="w-full rounded-2xl font-semibold hover:bg-[#22c55e] hover:text-white active:scale-[0.98] transition-all cursor-pointer bg-[#f4f4f4] text-black py-4 border-none text-[15px]">
        Confirmar e Criar Conta
      </button>
    </form>
  );
}