import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Gift card code is required" },
        { status: 400 }
      );
    }

    const { data: giftCard, error } = await supabaseAdmin
      .from("gift_cards")
      .select("id, balance, status, expires_at")
      .eq("code", code)
      .single();

    if (error || !giftCard) {
      return NextResponse.json(
        { error: "Invalid gift card code" },
        { status: 404 }
      );
    }

    if (giftCard.status !== "active") {
      return NextResponse.json(
        { error: "This gift card is not active" },
        { status: 400 }
      );
    }

    if (giftCard.balance <= 0) {
      return NextResponse.json(
        { error: "This gift card has no remaining balance" },
        { status: 400 }
      );
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This gift card has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id: giftCard.id,
      balance: giftCard.balance,
    });
  } catch (error) {
    console.error("API error validating gift card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
