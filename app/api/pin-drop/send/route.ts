import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/pin-drop/send — generate token + send link to recipient
export async function POST(req: Request) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, recipient_phone, recipient_name, pin_drop_token")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Reuse existing token if already generated
  let token = order.pin_drop_token;
  if (!token) {
    token = crypto.randomBytes(32).toString("hex");
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        pin_drop_token: token,
        recipient_pin_requested: true,
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const pinDropUrl = `${baseUrl}/pin-drop/${orderId}?token=${token}`;

  // Send via WhatsApp (using the existing WhatsApp number)
  const whatsappMessage = encodeURIComponent(
    `Hey ${order.recipient_name}! 🎁\n\nSomeone sent you a gift on TouchGift! To receive it, please tap the link below and drop your delivery pin (your exact location) and pick a time window that works for you.\n\nNobody will see the price — this is all about making sure the gift reaches you perfectly.\n\n📍 Drop your pin here:\n${pinDropUrl}\n\nThank you! 🎁`
  );
  const whatsappUrl = `https://wa.me/${order.recipient_phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  return NextResponse.json({
    success: true,
    pinDropUrl,
    whatsappUrl,
    token,
  });
}
