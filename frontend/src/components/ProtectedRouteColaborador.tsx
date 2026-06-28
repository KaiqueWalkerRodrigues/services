import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRouteColaborador({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/loginColaborador" replace />;
  }

  return <>{children}</>;
}
