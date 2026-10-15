import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/corporate/order-summary?id=<order id>
 *
 * Backs the thank-you page after a bulk order. The page used to read its whole
 * result out of sessionStorage, which meant it was unreloadable and
 * unshareable: refresh it and the buyer lost their gift links, and a colleague
 * could not open the link they were sent.
 *
 * This is deliberately unauthenticated — the buyer has just paid and may not
 * have an account — so the id is the capability, and it is a UUID for that
 * reason. The response is scoped to exactly what a receipt needs: the gift
 * links, the count, and how it was paid. No sender phone, no recipient numbers,
 * no account id.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid order reference" }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("corporate_orders")
    .select("id, company_name, status, recipient_count, total_amount, payment_method, delivery_method, unit_amount, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[corporate/order-summary]", error.message);
    return NextResponse.json({ error: "Could not load this order" }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "No such order" }, { status: 404 });
  }

  const { data: cards } = await supabase
    .from("digital_gift_cards")
    .select("slug, metadata")
    .eq("corporate_order_id", id)
    .order("created_at", { ascending: true });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://touchgift.shop";

  return NextResponse.json({
    orderId: order.id,
    companyName: order.company_name,
    status: order.status,
    count: order.recipient_count ?? cards?.length ?? 0,
    totalAmount: order.total_amount,
    unitAmount: order.unit_amount,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method,
    createdAt: order.created_at,
    links: (cards ?? []).map((c: { slug: string; metadata: unknown }) => ({
      slug: c.slug,
      url: `${site}/open/gc/${c.slug}`,
      phone: (c.metadata as { phone?: string } | null)?.phone ?? null,
    })),
  });
}
