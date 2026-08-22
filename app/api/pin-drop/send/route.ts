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

  // Check if link already used or expired
  if (order.pin_drop_token && order.expires_at) {
    const expires = new Date(order.expires_at);
    const now = new Date();
    if (now > expires) {
      return NextResponse.json({ error: "Link has expired. Contact sender to resend." }, { status: 410 });
    }
    if (order.pin_drop_token_used) {
      return NextResponse.json({ error: "This link has already been used." }, { status: 411 });
    }
  }

  // Reuse existing token if already generated and not used/expired
  let token = order.pin_drop_token;
  let now = new Date();
  
  // Generate token if missing or expired
  if (!token || new Date(order.expires_at) < now) {
    const expiryDays = 1; // Token valid for 1 day
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    token = crypto.randomBytes(32).toString("hex");
    
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        pin_drop_token: token,
        expires_at: expiresAt.toISOString(),
        pin_drop_token_used: false,
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
    `Hey! 🎁\n\nSomeone sent you a gift on TouchGift! To receive it, please tap the link below and drop your delivery pin (your exact location) and pick a time window that works for you.\n\n📍 Drop your pin here:\n${pinDropUrl}\n\n⏰ If you don't complete this within 24 hours, we'll send you a gentle reminder. If you still need help, we'll contact the sender to arrange an alternative delivery point.\n\nThank you! 🎁`
  );
  const whatsappUrl = `https://wa.me/${order.recipient_phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  return NextResponse.json({
    success: true,
    pinDropUrl,
    whatsappUrl,
    token,
  });
}
