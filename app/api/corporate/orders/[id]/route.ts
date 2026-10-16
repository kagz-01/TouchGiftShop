import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { guard } from "@/lib/portal-guard";
import { maybeAutoIssueOnDispatch } from "@/lib/invoice-automation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* Mirrors corporate_order_status in Postgres. Forward-only, with the two
   exceptions that are corrections rather than progress. */
const TRANSITIONS: Record<string, string[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["processing", "cancelled"],
  processing: ["wrapped", "cancelled"],
  wrapped: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

/**
 * PATCH /api/corporate/orders/[id]
 *
 * Corporate orders had no status route at all: they were created
 * pending_payment, moved to processing by the payment IPN, and never got past
 * that. Ops had no way to say a corporate order was wrapped or on its way, and
 * invoicing has nothing to hang off without this.
 *
 * Moving an order also moves its fulfilment rows, because a company order is
 * one shipment — fifty hampers leave together or not at all, and leaving the
 * children behind is how "delivered" ends up disagreeing with itself across
 * fifty rows.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string; note?: string };
  const next = body.status?.trim();

  if (!next) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const { data: order, error: readErr } = await supabase
    .from("corporate_orders")
    .select("id, status, corporate_account_id, recipient_count, total_amount")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const from = order.status as string;
  if (from === next) {
    return NextResponse.json({ order, unchanged: true });
  }
  if (!TRANSITIONS[from]?.includes(next)) {
    return NextResponse.json(
      { error: `An order cannot move from "${from}" to "${next}".` },
      { status: 409 }
    );
  }

  const { data: updated, error: writeErr } = await supabase
    .from("corporate_orders")
    .update({ status: next })
    .eq("id", id)
    .eq("status", from)
    .select("id, status")
    .maybeSingle();

  if (writeErr) {
    return NextResponse.json({ error: writeErr.message }, { status: 500 });
  }
  if (!updated) {
    /* Someone else moved it between our read and our write. Saying so beats
       silently overwriting their change. */
    return NextResponse.json(
      { error: "This order changed while you were looking at it. Refresh and try again." },
      { status: 409 }
    );
  }

  const childStatus = next as
    | "processing"
    | "wrapped"
    | "dispatched"
    | "delivered"
    | "cancelled";

  /* `count: "exact"` combined with an update is rejected by PostgREST, so the
     row count comes back separately rather than pretending we can get both. */
  const { error: childErr } = await supabase
    .from("orders")
    .update({ status: childStatus })
    .eq("corporate_order_id", id);
  if (childErr) console.error(`[corporate/orders] children not updated: ${childErr.message}`);

  const { count: childRows } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("corporate_order_id", id);

  /* Dispatch is the point of supply: it is where tax becomes due and where the
     client's invoice is owed. Issued here rather than on payment, because
     payment can arrive before a single hamper is made. */
  let invoice: { invoice_number: string; created: boolean } | null = null;
  if (next === "dispatched") {
    invoice = await maybeAutoIssueOnDispatch(id, { actor: "ops" });
  }

  return NextResponse.json({
    order: updated,
    childrenUpdated: childRows ?? 0,
    invoice,
  });
}