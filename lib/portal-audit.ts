import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * Portal audit trail.
 *
 * The portal reads customer emails, phone numbers and free-text notes. The rule
 * is not "don't look" — ops legitimately needs to — it is that someone looking
 * can show that they looked. No customer content is stored here: who, what,
 * which record, from where, and whether it succeeded.
 *
 * Best-effort by design. A failed audit write must never fail the request that
 * was being audited; the log records the outcome of the thing, and the thing is
 * more important than the log. Failures are logged to the server console so a
 * broken audit table is still visible.
 */

type Action =
  | "quotes.list"
  | "quotes.respond"
  | "orders.list"
  | "orders.read"
  | "spend.read"
  | "people.read"
  | "session.resolve"
  | "members.invite"
  | "members.revoke"
  | "invoices.issue"
  | "invoices.void";

export async function auditPortal(args: {
  req?: NextRequest | Request;
  action: Action;
  corporateAccountId?: string | null;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  resource?: string | null;
  resourceRef?: string | null;
  outcome?: "ok" | "denied" | "error";
}): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const headers = args.req?.headers;
    const ip =
      headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headers?.get("x-real-ip") ??
      null;

    const { error } = await supabase.from("corporate_portal_audit").insert({
      corporate_account_id: args.corporateAccountId ?? null,
      actor_user_id: args.actorUserId ?? null,
      actor_email: args.actorEmail ?? null,
      actor_role: args.actorRole ?? null,
      action: args.action,
      resource: args.resource ?? null,
      resource_ref: args.resourceRef ?? null,
      outcome: args.outcome ?? "ok",
      ip,
    });

    if (error) console.error("[portal-audit] write failed:", error.message);
  } catch (e) {
    console.error("[portal-audit] threw:", e);
  }
}