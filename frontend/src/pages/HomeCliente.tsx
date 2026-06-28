import { useAuth } from "../hooks/useAuth";

export default function HomeColaborador() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <p>{/* Bem-vindo, {usuario?.nome} #{usuario?.id_cliente} */}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
