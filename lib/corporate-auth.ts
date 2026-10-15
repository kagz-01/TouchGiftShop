import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase-server";

/**
 * Corporate client session resolution.
 *
 * The portal authenticates against `corporate_account_members`, not against
 * `corporate_accounts.user_id` — that column exists, nothing writes it, and one
 * company has more than one person. Membership is issued by ops: a visitor who
 * types a company name gets nothing, because `company_name` on a quote request
 * is free text that anyone can write.
 *
 * This module is the only place that answers "which company is this person?".
 * Route handlers must never take a company id from the client.
 */

export type CorporateRole = "owner" | "member" | "viewer";

export type CorporateMembership = {
  id: string;
  corporate_account_id: string;
  email: string;
  role: CorporateRole;
  status: "invited" | "active" | "revoked";
  full_name: string | null;
  job_title: string | null;
};

export type CorporateAccount = {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  industry: string | null;
  employee_count: number | null;
  credit_limit: number | null;
  credit_used: number | null;
  default_payment_terms: string | null;
  is_verified: boolean;
};

export type CorporateSession = {
  userId: string;
  email: string;
  name: string | null;
  membership: CorporateMembership;
  account: CorporateAccount;
};

export type CorporateAuthFailure =
  | "signed_out"      // no Supabase session
  | "no_membership"   // signed in, but no membership on any account
  | "unavailable";    // Supabase unreachable — not the same as signed out

export type CorporateAuthResult =
  | { ok: true; session: CorporateSession }
  | { ok: false; reason: CorporateAuthFailure };

type MemberRow = CorporateMembership & {
  user_id: string | null;
  corporate_accounts: CorporateAccount | CorporateAccount[] | null;
};

const service = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * Resolve the caller's corporate session.
 *
 * A membership is matched on `user_id` first, then on email — the email path is
 * what promotes an `invited` row to `active` the first time the person follows
 * their magic link. Revoked memberships are excluded here *and* by a partial
 * unique index, so a revoke cannot be undone by re-inviting the same address.
 */
export async function getCorporateSession(): Promise<CorporateAuthResult> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, reason: "signed_out" };

  const user = data.user;
  const email = (user.email ?? "").toLowerCase();
  if (!email) return { ok: false, reason: "no_membership" };

  const admin = service();
  const select =
    "id, corporate_account_id, user_id, email, role, status, full_name, job_title, " +
    "corporate_accounts!inner(id, company_name, company_email, company_phone, " +
    "industry, employee_count, credit_limit, credit_used, default_payment_terms, is_verified)";

  /* Two lookups rather than one .or(): PostgREST filter expressions are parsed
     out of the string, and a verified email is still a string someone typed. */
  const byId = await admin
    .from("corporate_account_members")
    .select(select)
    .eq("status", "active")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (byId.error) return { ok: false, reason: "unavailable" };

  let rows = byId.data as MemberRow | null;
  if (!rows) {
    const byEmail = await admin
      .from("corporate_account_members")
      .select(select)
      .eq("status", "active")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    if (byEmail.error) return { ok: false, reason: "unavailable" };
    rows = byEmail.data as MemberRow | null;
  }

  if (!rows) return { ok: false, reason: "no_membership" };

  const account = Array.isArray(rows.corporate_accounts)
    ? rows.corporate_accounts[0]
    : (rows.corporate_accounts as unknown as CorporateAccount);

  // Stamp first sight, and bind the auth user to the invited row so future
  // logins match on id rather than on an email someone could change.
  if (!rows.user_id || rows.email.toLowerCase() !== email) {
    await admin
      .from("corporate_account_members")
      .update({ user_id: user.id, email, last_seen_at: new Date().toISOString() })
      .eq("id", rows.id);
  } else {
    await admin
      .from("corporate_account_members")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", rows.id);
  }

  return {
    ok: true,
    session: {
      userId: user.id,
      email,
      name: rows.full_name ?? (user.user_metadata?.full_name as string) ?? null,
      membership: {
        id: rows.id,
        corporate_account_id: rows.corporate_account_id,
        email: rows.email,
        role: rows.role as CorporateRole,
        status: rows.status,
        full_name: rows.full_name,
        job_title: rows.job_title,
      },
      account,
    },
  };
}

/**
 * Promote an `invited` membership to `active` on a successful sign-in.
 *
 * Kept separate from getCorporateSession() because it is the one place that
 * turns an invitation into access, and it must only ever run for an address
 * that was invited — never for an address that merely signed in.
 */
export async function activatePendingMembership(userId: string, email: string): Promise<string | null> {
  const clean = email.toLowerCase();
  const admin = service();
  const { data } = await admin
    .from("corporate_account_members")
    .update({ status: "active", user_id: userId, last_seen_at: new Date().toISOString() })
    .eq("status", "invited")
    .ilike("email", clean)
    .select("corporate_account_id")
    .maybeSingle();

  return data?.corporate_account_id ?? null;
}

/** True when this role may see money, credit and contracts. `viewer` may not. */
export function canSeeFinancials(role: CorporateRole) {
  return role === "owner" || role === "member";
}

/**
 * Route-handler guard.
 *
 * Returns the resolved session, or a ready-to-return NextResponse. The 401 vs
 * 503 split is the same lesson as verifyAdmin(): a dropped pooler connection
 * must never read as "you are not signed in", because the portal's sign-in
 * screen would send a valid client round a loop they cannot escape.
 */
export async function requireCorporate(): Promise<
  { ok: true; session: CorporateSession } | { ok: false; response: NextResponse }
> {
  const result = await getCorporateSession();

  if (result.ok) return { ok: true, session: result.session };

  if (result.reason === "unavailable") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Could not verify your session right now. Try again." },
        { status: 503 }
      ),
    };
  }

  if (result.reason === "signed_out") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in to continue" }, { status: 401 }),
    };
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: "No corporate account is linked to this sign-in" },
      { status: 403 }
    ),
  };
}
