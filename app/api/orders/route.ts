import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

const OrderInput = z.object({
  productId: z.string().uuid(),
  totalAmount: z.number().positive(),
  senderName: z.string().min(1),
  senderPhone: z.string().min(9),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(9),
  isAnonymous: z.boolean().default(false),
  dontCallRecipient: z.boolean().default(false),
  deliveryLat: z.number().nullable().optional(),
  deliveryLng: z.number().nullable().optional(),
  deliveryLandmark: z.string().optional(),
  recipientPinRequested: z.boolean().default(false),
  giftNote: z.string().optional(),
  engraving: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  shippingFee: z.number().default(0),
});

// GET /api/orders — fetch orders for the currently authenticated user only.
// The phone param is retained for display purposes but the query is scoped
// to auth.uid() so users cannot enumerate another person's orders.
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, status, recipient_name, created_at, pre_dispatch_photo_url, quantity, product_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

// POST /api/orders — creates the order record. Payment is handled separately
// via /api/payment/create-order (PesaPal checkout redirect).
export async function POST(req: Request) {
  const parsed = OrderInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // Link the order to the authenticated user if they are logged in.
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      product_id: input.productId,
      total_amount: input.totalAmount,
      status: "pending_payment",
      sender_name: input.senderName,
      sender_phone: input.senderPhone,
      recipient_name: input.recipientName,
      recipient_phone: input.recipientPhone,
      is_anonymous: input.isAnonymous,
      dont_call_recipient: input.dontCallRecipient,
      delivery_lat: input.deliveryLat ?? null,
      delivery_lng: input.deliveryLng ?? null,
      delivery_landmark: input.deliveryLandmark ?? null,
      recipient_pin_requested: input.recipientPinRequested,
      gift_note: input.giftNote ?? null,
      engraving: input.engraving ?? null,
      quantity: input.quantity,
      shipping_fee: input.shippingFee,
    })
    .select()
    .single();

  if (insertError || !order) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ order });
}
