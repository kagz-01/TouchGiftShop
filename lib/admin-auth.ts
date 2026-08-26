import { cookies } from "next/headers";

/**
 * Shared admin auth check — verifies the session token against the in-memory store.
 * Use in any route that needs admin protection.
 */
export function requireAdmin(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session) return false;

  if (globalThis.__adminSessions) {
    const expiresAt = globalThis.__adminSessions.get(session);
    if (!expiresAt || expiresAt < Date.now()) return false;
  }

  return true;
}

declare global {
  var __adminSessions: Map<string, number> | undefined;
}
