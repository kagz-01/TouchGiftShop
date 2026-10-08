import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSms, sendEmail } from "@/lib/notifications";

// POST /api/pools/[slug]/close-action
// Body: { action: "extend" | "downgrade" | "refund", newDeadline?: string }
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const body = await req.json();
  const { action, newDeadline } = body as { action: "extend" | "downgrade" | "refund"; newDeadline?: string };

  const { data: pool } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("id, title, status, current_balance, target_amount, organiser_user_id, slug")
    .eq("slug", slug)
    .single();

  if (!pool) return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  if (pool.status !== "expired") return NextResponse.json({ error: "Pool is not expired" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

  if (action === "extend") {
    if (!newDeadline) return NextResponse.json({ error: "newDeadline required" }, { status: 400 });
    const { error } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "active", expires_at: new Date(newDeadline).toISOString() })
      .eq("id", pool.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "extended" });
  }

  if (action === "downgrade") {
    // Mark as completed with current balance as the new "target"
    const { error } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "completed", target_amount: pool.current_balance })
      .eq("id", pool.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "downgraded" });
  }

  if (action === "refund") {
    // Fetch all verified contributions to refund
    const { data: contribs } = await supabaseAdmin
      .from("pool_contributions")
      .select("id, amount, contributor_name, payment_ref")
      .eq("pool_id", pool.id)
      .eq("is_verified", true);

    // Mark pool as refunded
    const { error } = await supabaseAdmin
      .from("group_gifting_pools")
      .update({ status: "refunded" })
      .eq("id", pool.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // In a real system, trigger Pesapal refunds here per contribution receipt
    // For now, log each refund for manual processing
    console.log(`[Refund] Pool ${slug}: ${contribs?.length ?? 0} contributions to refund`, contribs);

    return NextResponse.json({
      success: true,
      action: "refunded",
      contributions: contribs?.length ?? 0,
      totalAmount: pool.current_balance
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
