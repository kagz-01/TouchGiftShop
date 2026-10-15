import { createClient } from "@supabase/supabase-js";

/**
 * Corporate account housekeeping — reference codes and lazy tenancy.
 *
 * Quotes arrive from the public catalog with nothing but a company name and an
 * email. That is enough to file them against a company, and not enough to let
 * anyone in: creating an account here grants no access. Access is a
 * `corporate_account_members` row, and only ops can write one.
 */

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// No 0/O/1/I — a reference read aloud over the phone has to survive that.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function newQuoteReference(): string {
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `TGQ-${out}`;
}

const domainOf = (email: string) => email.trim().toLowerCase().split("@")[1] ?? "";

export type ResolvedAccount = { id: string; created: boolean };

/**
 * Find (or create) the corporate account a quote belongs to.
 *
 * Matching is deliberately conservative — exact company name first, then a
 * shared email domain — because the alternative, matching on anything loose,
 * files one company's orders under another. A duplicate created here is a
 * nuisance ops can merge; a mis-filed quote is a client's invoice for someone
 * else's order.
 */
export async function resolveCorporateAccount(args: {
  company: string;
  email: string;
  phone?: string | null;
}): Promise<ResolvedAccount | null> {
  const db = supabase();
  const company = args.company.trim();
  const email = args.email.trim().toLowerCase();
  const domain = domainOf(email);

  const { data: byName } = await db
    .from("corporate_accounts")
    .select("id")
    .ilike("company_name", company)
    .limit(1)
    .maybeSingle();

  if (byName?.id) return { id: byName.id, created: false };

  if (domain) {
    const { data: byDomain } = await db
      .from("corporate_accounts")
      .select("id, company_email")
      .not("company_email", "is", null)
      .limit(200);

    const match = (byDomain ?? []).find(
      (row) => domainOf(String(row.company_email)) === domain
    );
    if (match?.id) return { id: match.id, created: false };
  }

  const { data: created, error } = await db
    .from("corporate_accounts")
    .insert({
      company_name: company,
      company_email: email,
      company_phone: args.phone ?? null,
      // Unverified until ops says otherwise. Nothing in the portal reads this
      // yet, and it must never gate access on its own.
      is_verified: false,
    })
    .select("id")
    .single();

  if (error || !created?.id) {
    console.error("[corporate-accounts] could not create account:", error?.message);
    return null;
  }
  return { id: created.id, created: true };
}

/**
 * Assign a free reference to a quote, retrying on the rare collision.
 * Returns null if it could not be assigned — the quote is still valid, it just
 * has no human reference yet.
 */
export async function assignQuoteReference(quoteId: string): Promise<string | null> {
  const db = supabase();

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newQuoteReference();
    const { error } = await db
      .from("corporate_quote_requests")
      .update({ reference })
      .eq("id", quoteId)
      .is("reference", null);

    if (!error) return reference;
    if (error.code !== "23505") {
      console.error("[corporate-accounts] reference not assigned:", error.message);
      return null;
    }
  }
  return null;
}
