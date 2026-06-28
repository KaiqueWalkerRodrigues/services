interface UserMeta {
  is_sa: boolean;
  grupos: number[];
  sub: number;
}

export function getUserMeta(): UserMeta | null {
  if (typeof document === "undefined") return null;

  console.log("[jwt] todos os cookies:", document.cookie); // <-- debug

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_meta="));

  if (!match) {
    console.warn("[jwt] cookie user_meta não encontrado");
    return null;
  }

  try {
    const raw = decodeURIComponent(match.split("=")[1]);
    console.log("[jwt] raw base64:", raw); // <-- debug
    const decoded = JSON.parse(atob(raw));
    console.log("[jwt] decoded:", decoded); // <-- debug
    return decoded as UserMeta;
  } catch (err) {
    console.error("[jwt] erro ao decodificar user_meta:", err);
    return null;
  }
}

/** Atalho: retorna true se o usuário logado for Super Admin */
export function isSuperAdmin(): boolean {
  return getUserMeta()?.is_sa === true;
}
