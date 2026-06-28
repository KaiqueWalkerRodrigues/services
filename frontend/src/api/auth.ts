import { API_BASE_URL } from "../config/api";

export async function realizarLoginCliente(email: string, senha: string) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensagem || "Erro ao realizar login");
  }
  return data;
}

export const realizarLoginEmpresa = async (
  id_empresa: string,
  login: string,
  senha: string,
) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/loginColaborador`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_empresa, login, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || "Erro ao realizar login");
  }

  return data;
};
