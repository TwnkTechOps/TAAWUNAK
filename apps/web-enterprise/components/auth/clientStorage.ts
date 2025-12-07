export function setToken(_token: string) {
  // Cookie-based session in use; no-op for client storage.
}
export function getToken(): string | null {
  // HttpOnly cookie is not readable by JS; return null.
  return null;
}
export async function clearToken(apiBase?: string) {
  try {
    if (apiBase) {
      await fetch(`${apiBase}/auth/logout`, {method: 'POST', credentials: 'include'});
    }
  } catch {}
}

