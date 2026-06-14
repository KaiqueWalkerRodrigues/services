export async function realizarLoginCliente(email: string, senha: string) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro ao realizar login');
  }
  return data;
}

export async function realizarLoginEmpresa(codigo: string, email: string, senha: string) {
  const response = await fetch('/api/loginEmpresa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, email, senha }) 
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro ao acessar o painel');
  }
  return data;
}