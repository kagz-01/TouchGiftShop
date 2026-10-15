import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * Guard for ops-side corporate portal routes.
 *
 * These are staff endpoints: inviting a colleague into a client's account is an
 * operator action, never a client one. It reuses the admin session rather than
 * the corporate session on purpose — a client who could invite people would
 * hand out their own company's access.
 *
 * The 401 / 503 split is inherited from verifyAdmin(): an unreachable Supabase
 * must not read as "not authorised", or an operator signs out of a session that
 * still works.
 */
export async function guard(): Promise<NextResponse | null> {
  const auth = await verifyAdmin();
  if (auth.ok) return null;

  if (auth.reason === "unavailable") {
    return NextResponse.json(
      { error: "Could not verify your session right now. Try again." },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
