import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/corporate/gift-cards
// Returns gift cards issued by corporate accounts (sender_name set, not null).
// Ordered newest first, limited to 200 rows to keep payload manageable.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("gift_cards")
      .select(
        "code, sender_name, recipient_name, recipient_email, initial_amount, balance, status, send_date, created_at"
      )
      .not("sender_name", "is", null)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[corporate/gift-cards] DB error:", error.message);
      return NextResponse.json({ error: "Failed to fetch gift cards" }, { status: 500 });
    }

    const cards = (data ?? []).map((c) => ({
      code:           c.code,
      recipientName:  c.recipient_name,
      recipientEmail: c.recipient_email ?? "",
      amount:         c.initial_amount,
      balance:        c.balance ?? 0,
      status:         c.status as string,
      sendDate:       (c.send_date ?? c.created_at ?? "").slice(0, 10),
    }));

    return NextResponse.json(cards, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[corporate/gift-cards] Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
