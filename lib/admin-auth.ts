import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Shared admin auth check — verifies the session token against Supabase.
 * Use in any route that needs admin protection.
 */
export async function requireAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session) return false;

  const { data } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", session)
    .single();

  if (!data) return false;

  return new Date(data.expires_at).getTime() > Date.now();
}
