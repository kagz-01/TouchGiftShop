import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/cron/close-pools
// Invoked by Vercel Cron to expire pools that have passed their deadline
export async function GET(req: Request) {
  try {
    // 1. Close Consumer Pools
    const { error: consumerError } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());

    if (consumerError) throw consumerError;

    // 2. Close Corporate Pools
    const { error: corpError } = await supabaseAdmin
      .from("corporate_gift_pools")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("deadline", new Date().toISOString());

    if (corpError) throw corpError;

    return NextResponse.json({ success: true, message: "Expired pools closed" });
  } catch (error) {
    console.error("Cron Error (close-pools):", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
