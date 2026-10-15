import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Session check that says *why* it failed.
 *
 * `.single()` hands back `data: null` both when the token is bogus and when
 * Supabase itself is unreachable — and the pooler drops connections often
 * enough that we kept seeing a 401 "Your session expired — sign in again" on a
 * perfectly valid session. Callers that can tell the difference should answer
 * 503 for `unavailable` so the client retries instead of logging the operator
 * out of a working session.
 */
export async function verifyAdmin(): Promise<
  { ok: true } | { ok: false; reason: "invalid" | "unavailable" }
> {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session) return { ok: false, reason: "invalid" };

  const { data, error } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", session)
    .maybeSingle();

  if (error) return { ok: false, reason: "unavailable" };
  if (!data) return { ok: false, reason: "invalid" };
  if (new Date(data.expires_at).getTime() <= Date.now()) return { ok: false, reason: "invalid" };

  return { ok: true };
}

/**
 * Shared admin auth check — verifies the session token against Supabase.
 * Use in any route that needs admin protection.
 */
export async function requireAdmin(): Promise<boolean> {
  return (await verifyAdmin()).ok;
}
