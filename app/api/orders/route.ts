import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { initiateStkPush } from "@/lib/mpesa";

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
});

// GET /api/orders?phone=0712345678 — fetch orders by sender phone
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { error: "phone query param required" },
      { status: 400 }
    );
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, status, recipient_name, created_at, pre_dispatch_photo_url, quantity")
    .eq("sender_phone", phone)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

// POST /api/orders
export async function POST(req: Request) {
  const parsed = OrderInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const { data: order, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
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
    })
    .select()
    .single();

  if (insertError || !order) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  try {
    const { checkoutRequestId } = await initiateStkPush({
      phoneNumber: input.senderPhone,
      amount: input.totalAmount,
      accountReference: order.id,
      transactionDesc: "TouchGift order",
    });

    await supabaseAdmin
      .from("orders")
      .update({ mpesa_checkout_request_id: checkoutRequestId })
      .eq("id", order.id);

    return NextResponse.json({ order, checkoutRequestId });
  } catch (err) {
    return NextResponse.json(
      {
        order,
        error:
          err instanceof Error ? err.message : "STK push failed to start",
      },
      { status: 502 }
    );
  }
}
