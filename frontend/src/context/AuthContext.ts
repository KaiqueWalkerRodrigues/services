import { createContext } from "react";
import { type Usuario } from "../types/auth";

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (userData: Usuario) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
export type { AuthContextType };
