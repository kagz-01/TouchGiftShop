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

// POST /api/orders
// 1. Insert the order as pending_payment.
// 2. Trigger an M-Pesa STK push to the sender's phone.
// 3. Store the checkoutRequestId so the callback can find this order again.
// The order is NOT marked paid here — only /api/mpesa/callback does that,
// once Safaricom confirms the payment actually went through.
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
    // Order stays as pending_payment — the buyer can retry payment for the
    // same order rather than us silently losing it.
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
