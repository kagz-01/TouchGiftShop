import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase-server";

function normalizePhone(p?: string | null): string | null {
  if (!p) return null;
  const d = p.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("254")) return `+${d}`;
  if (d.startsWith("0")) return `+254${d.slice(1)}`;
  if (d.startsWith("7") || d.startsWith("1")) return `+254${d}`;
  return `+${d}`;
}

/**
 * GET /api/auth/check-duplicates
 *
 * Detects whether the signed-in user shares a phone or email with ANOTHER
 * account — the classic "I signed up with my number, later with Google"
 * duplicate. We can't auto-merge (orders/points/referrals live on both),
 * so we surface it so the user can contact support.
 */
export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ duplicates: [] });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Walk the user list (paged) and compare normalised identities
  const myEmail = (user.email ?? "").toLowerCase().trim() || null;
  const myPhone = normalizePhone(user.phone);

  if (!myEmail && !myPhone) {
    return NextResponse.json({ duplicates: [] });
  }

  const duplicates: { method: string; masked: string }[] = [];
  let page = 1;
  const perPage = 200;
  let done = false;

  while (!done && page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;

    for (const u of data.users) {
      if (u.id === user.id) continue;
      const theirEmail = (u.email ?? "").toLowerCase().trim() || null;
      const theirPhone = normalizePhone(u.phone);

      if (myEmail && theirEmail && myEmail === theirEmail) {
        duplicates.push({ method: "email", masked: maskEmail(theirEmail) });
      } else if (myPhone && theirPhone && myPhone === theirPhone) {
        duplicates.push({ method: "phone", masked: maskPhone(theirPhone) });
      }
    }

    if (data.users.length < perPage) done = true;
    page++;
  }

  return NextResponse.json({ duplicates });
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "hidden";
  return `${name.slice(0, 2)}${"•".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}•••${phone.slice(-3)}`;
}
