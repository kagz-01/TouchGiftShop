import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/orders/[id] — used both by the order detail page and by
// CheckoutForm's payment-status polling.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*, products(name, image_url)")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
