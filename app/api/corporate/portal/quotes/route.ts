import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireCorporate } from "@/lib/corporate-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* The allowlist is the whole point of this route. This table holds customer
   emails, phone numbers and free text, and the service-role key bypasses RLS —
   so the field list below is the only thing standing between the internet and
   an internal note. Adding a column here is a decision, not a convenience.

   Never returned: internal_notes, assignee, design_payload, design_preview_url,
   unit_price, company_email of other companies, anything not scoped below. */
const CUSTOMER_FIELDS =
  "id, reference, product_name, quantity, category, moq_tier, " +
  "total_estimate, quoted_amount, valid_until, status, created_at, " +
  "quoted_at, customer_response, customer_responded_at";

export async function GET(req: NextRequest) {
  const auth = await requireCorporate();
  if (!auth.ok) return auth.response;

  const { session } = auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";

  let query = supabase
    .from("corporate_quote_requests")
    .select(CUSTOMER_FIELDS, { count: "exact" })
    .eq("corporate_account_id", session.account.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    const allowed = new Set(["pending", "quoted", "accepted", "declined"]);
    if (!allowed.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[portal/quotes]", error.message);
    return NextResponse.json({ error: "Could not load your quotes" }, { status: 500 });
  }

  return NextResponse.json({ quotes: data ?? [], total: count ?? 0 });
}
