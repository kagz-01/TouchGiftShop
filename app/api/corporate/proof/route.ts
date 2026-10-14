import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/corporate/proof — public, aggregate-only social proof.
 *
 * Deliberately UNGATED, and deliberately returns nothing but counts.
 *
 * The corporate hub is a public sales page, so it can show real numbers — but
 * only if they are real. The previous hero claimed "2,400+ companies, KES 50M+
 * deployed, 4.9 stars" and none of it was readable from any table. This route
 * is the opposite: every figure below is computed from rows that exist, and it
 * returns empty rather than inventing.
 *
 * PII discipline: no company name, contact, email, phone or note ever leaves
 * this route. `company_name` is read server-side purely to compute a distinct
 * count and is discarded. Do not add a field here without asking whether a
 * prospect is entitled to see it.
 *
 * There is no corporate_orders table, so no fulfilment or revenue figure is
 * reported — we cannot count what we don't store.
 */

export const revalidate = 300;

const DISTINCT_CAP = 5000;

export async function GET() {
  try {
    const [
      { count: quoteCount },
      { count: inquiryCount },
      // Bounded reads used only for counts. company_name is discarded below and
      // never leaves this route; the quantity/recipient columns carry no identity.
      { data: companyNames },
      { data: inquiryRecipients },
      { data: quoteQuantities },
    ] = await Promise.all([
      supabase
        .from("corporate_quote_requests")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("corporate_inquiries")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("corporate_quote_requests")
        .select("company_name")
        .limit(DISTINCT_CAP),
      supabase
        .from("corporate_inquiries")
        .select("recipient_count")
        .limit(DISTINCT_CAP),
      supabase
        .from("corporate_quote_requests")
        .select("quantity")
        .limit(DISTINCT_CAP),
    ]);

    const companies = new Set(
      (companyNames ?? [])
        .map((r) => (r as { company_name?: string }).company_name?.trim())
        .filter((n): n is string => Boolean(n))
    );

    const recipients =
      (inquiryRecipients ?? []).reduce(
        (sum, r) => sum + ((r as { recipient_count?: number }).recipient_count ?? 0),
        0
      ) +
      (quoteQuantities ?? []).reduce(
        (sum, r) => sum + ((r as { quantity?: number }).quantity ?? 0),
        0
      );

    return NextResponse.json(
      {
        quoteRequests: quoteCount ?? 0,
        bulkInquiries: inquiryCount ?? 0,
        companies: companies.size,
        companiesCapped: (companyNames?.length ?? 0) >= DISTINCT_CAP,
        recipients,
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
    );
  } catch (err) {
    console.error("[corporate/proof]", err);
    // Never fail the page over a stats blip — the section has an empty state.
    return NextResponse.json(
      { quoteRequests: 0, bulkInquiries: 0, companies: 0, companiesCapped: false, recipients: 0, unavailable: true },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  }
}
