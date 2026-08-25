import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Helper to generate a secure random code for the gift card
function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars (I, 1, O, 0)
  let code = "TG-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += "-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, senderName, recipientName, recipientEmail, message } = body;

    if (!amount || amount < 500) {
      return NextResponse.json(
        { error: "Amount must be at least KSh 500" },
        { status: 400 }
      );
    }

    if (!senderName || !recipientName) {
      return NextResponse.json(
        { error: "Sender and recipient names are required" },
        { status: 400 }
      );
    }

    const code = generateGiftCardCode();

    const { data: giftCard, error } = await supabaseAdmin
      .from("gift_cards")
      .insert({
        code,
        initial_amount: amount,
        balance: amount, // Technically balance will be updated on IPN, but we store it here too.
        sender_name: senderName,
        recipient_name: recipientName,
        recipient_email: recipientEmail || null,
        message: message || null,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating gift card in DB:", error);
      return NextResponse.json(
        { error: "Failed to create gift card record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: giftCard.id });
  } catch (error) {
    console.error("API error creating gift card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
