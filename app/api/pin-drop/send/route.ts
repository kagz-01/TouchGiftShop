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
    .select("id, recipient_phone, recipient_name, pin_drop_token, pin_drop_token_expires_at, delivery_lat")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Check if pin was already dropped
  if (order.delivery_lat !== null) {
    return NextResponse.json({ error: "This order already has a delivery pin.", status: 411 });
  }

  // Check if existing token is still valid
  let token = order.pin_drop_token;
  const now = new Date();

  if (token && order.pin_drop_token_expires_at) {
    const expires = new Date(order.pin_drop_token_expires_at);
    if (now < expires) {
      // Token still valid — reuse it
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
      const pinDropUrl = `${baseUrl}/pin-drop/${orderId}?token=${token}`;
      const whatsappMessage = encodeURIComponent(
        `Hey! 🎁\n\nSomeone sent you a gift on TouchGift! To receive it, please tap the link below and drop your delivery pin (your exact location) and pick a time window that works for you.\n\n📍 Drop your pin here:\n${pinDropUrl}\n\n⏰ If you don't complete this within 24 hours, we'll send you a gentle reminder.\n\nThank you! 🎁`
      );
      const whatsappUrl = `https://wa.me/${order.recipient_phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;
      return NextResponse.json({ success: true, pinDropUrl, whatsappUrl, token });
    }
  }

  // Generate new token
  const expiryMs = 24 * 60 * 60 * 1000; // 24 hours
  const expiresAt = new Date(now.getTime() + expiryMs);
  token = crypto.randomBytes(32).toString("hex");

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      pin_drop_token: token,
      pin_drop_token_expires_at: expiresAt.toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  const pinDropUrl = `${baseUrl}/pin-drop/${orderId}?token=${token}`;

  const whatsappMessage = encodeURIComponent(
    `Hey! 🎁\n\nSomeone sent you a gift on TouchGift! To receive it, please tap the link below and drop your delivery pin (your exact location) and pick a time window that works for you.\n\n📍 Drop your pin here:\n${pinDropUrl}\n\n⏰ If you don't complete this within 24 hours, we'll send you a gentle reminder.\n\nThank you! 🎁`
  );
  const whatsappUrl = `https://wa.me/${order.recipient_phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  return NextResponse.json({
    success: true,
    pinDropUrl,
    whatsappUrl,
    token,
  });
}
