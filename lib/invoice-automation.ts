import { createClient } from "@supabase/supabase-js";
import { issueInvoiceForOrder, sellerReadiness, recordInvoiceEvent } from "@/lib/invoicing";

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * Issue the invoice when a corporate order is dispatched.
 *
 * Dispatch is the point of supply: the goods have left, tax becomes due, and
 * the client is owed a document. Issuing on payment instead would invoice for
 * gifts that have not been made yet, and issuing by hand means somebody forgets
 * — with fifty-hamper orders there are fifty chances to forget.
 *
 * It is deliberately idempotent and deliberately quiet. If the seller details
 * are not configured yet the order still dispatches; the invoice is simply not
 * raised, and the reason is recorded rather than surfaced as a failed
 * dispatch. A missing invoice is an ops problem, not a reason to hold a van at
 * the gate.
 */
export async function maybeAutoIssueOnDispatch(
  corporateOrderId: string,
  opts: { actor?: string; force?: boolean } = {}
): Promise<{ invoice_number: string; created: boolean } | null> {
  const db = supabase();

  const { missing } = sellerReadiness();
  if (missing.length > 0 && !opts.force) {
    await recordInvoiceEvent({
      event: "invoice.skipped",
      corporateOrderId,
      actor: opts.actor ?? "system",
      detail: { reason: "seller_details_incomplete", missing },
    });
    console.warn(
      `[invoices] not auto-issuing ${corporateOrderId}: ${missing.join(", ")} unset`
    );
    return null;
  }

  const result = await issueInvoiceForOrder(corporateOrderId, {
    draft: false,
    issuedBy: opts.actor,
  }).catch((e) => {
    console.error("[invoices] auto-issue threw:", e);
    return { ok: false as const, code: "error" as const };
  });

  if (!result.ok) {
    // already_issued is the normal steady state, not a problem.
    if (result.code !== "already_issued") {
      await recordInvoiceEvent({
        event: "invoice.failed",
        corporateOrderId,
        actor: opts.actor ?? "system",
        detail: { code: result.code },
      });
      console.warn(`[invoices] auto-issue declined for ${corporateOrderId}: ${result.code}`);
    }
    if (result.code === "already_issued" && "invoice" in result && result.invoice) {
      return { invoice_number: result.invoice.invoice_number, created: false };
    }
    return null;
  }

  await recordInvoiceEvent({
    event: "invoice.issued",
    corporateOrderId,
    invoiceId: result.invoice.id,
    actor: opts.actor ?? "system",
    detail: { invoice_number: result.invoice.invoice_number, trigger: "dispatch" },
  });

  console.log(
    `[invoices] ${result.invoice.invoice_number} issued automatically on dispatch of ${corporateOrderId}`
  );

  return { invoice_number: result.invoice.invoice_number, created: true };
}

/**
 * Promote the parent when its last fulfilment row reaches a state.
 *
 * Ops will sometimes dispatch recipient by recipient through the normal admin
 * order screen rather than the corporate one. When the final row catches up, the
 * parent should follow on its own — otherwise the corporate order sits at
 * "wrapped" forever while all fifty hampers are on a van.
 */
export async function syncParentFromChildren(corporateOrderId: string): Promise<void> {
  const db = supabase();

  const { data: parent } = await db
    .from("corporate_orders")
    .select("id, status")
    .eq("id", corporateOrderId)
    .maybeSingle();
  if (!parent) return;

  const { data: children } = await db
    .from("orders")
    .select("status")
    .eq("corporate_order_id", corporateOrderId);

  if (!children?.length) return;

  const all = children.map((c) => c.status as string);
  const settled = all.every((s) =>
    ["dispatched", "delivered", "cancelled", "refunded"].includes(s)
  );
  const allDelivered = all.every((s) => ["delivered", "cancelled", "refunded"].includes(s));

  let next: string | null = null;
  if (allDelivered) next = "delivered";
  else if (settled && parent.status === "wrapped") next = "dispatched";
  else if (all.every((s) => ["wrapped", "dispatched", "delivered", "cancelled"].includes(s)) && parent.status === "processing") {
    next = "wrapped";
  }

  if (!next) return;

  const { data: updated } = await db
    .from("corporate_orders")
    .update({ status: next })
    .eq("id", corporateOrderId)
    .eq("status", parent.status)
    .select("id, status")
    .maybeSingle();

  if (!updated) return;

  if (next === "dispatched") {
    await maybeAutoIssueOnDispatch(corporateOrderId, { actor: "sync" });
  }
}