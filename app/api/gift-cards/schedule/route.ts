import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { deliverGiftCard } from "@/lib/notifications";

// POST /api/gift-cards/schedule — send scheduled gift cards due now (admin/cron)
export async function POST() {
  const now = new Date().toISOString();

  // Find scheduled cards with send_date <= today and status = scheduled
  const { data: cards, error } = await supabaseAdmin
    .from("gift_cards")
    .select("id, code, recipient_email, recipient_phone, recipient_name, sender_name, message, delivery_methods, is_anonymous")
    .lte("send_date", new Date().toISOString().slice(0, 10))
    .eq("status", "scheduled");

  if (error) {
    console.error("Failed to query scheduled gift cards:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const c of cards ?? []) {
    try {
      // Activate the card
      await supabaseAdmin.from("gift_cards").update({ status: "active" }).eq("id", c.id).eq("status", "scheduled");

      const methods = Array.isArray(c.delivery_methods) && c.delivery_methods.length ? c.delivery_methods : [];

      // Default to email, sms when available
      if (methods.length === 0) {
        if (c.recipient_email) methods.push("email");
        if (c.recipient_phone) methods.push("sms", "whatsapp");
      }

      if (methods.length > 0) {
        await deliverGiftCard({
          code: c.code,
          recipientEmail: c.recipient_email,
          recipientPhone: c.recipient_phone,
          recipientName: c.recipient_name,
          senderName: c.sender_name,
          message: c.message,
          alias: c.is_anonymous ? c.sender_name : null,
          methods,
        });
      }
    } catch (e) {
      console.error("Failed to process scheduled card", c.id, e);
    }
  }

  return NextResponse.json({ processed: cards?.length ?? 0, now });
}
