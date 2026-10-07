import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSms, sendEmail } from "@/lib/notifications";

// POST /api/pools/[slug]/nudge
// Sends an "Almost There!" nudge to the organiser to share with non-contributors
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: pool } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("id, title, current_balance, target_amount, organizer_id, slug")
    .eq("slug", slug)
    .single();

  if (!pool) return NextResponse.json({ error: "Pool not found" }, { status: 404 });

  const pct = pool.target_amount > 0 ? (pool.current_balance / pool.target_amount) * 100 : 0;
  if (pct < 70) return NextResponse.json({ error: "Pool not yet at 70% to trigger nudge" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  const poolUrl = `${siteUrl}/pool/${pool.slug}`;
  const remaining = pool.target_amount - pool.current_balance;
  const nudgeMessage = `🔥 Almost there! "${pool.title}" is ${Math.round(pct)}% funded — just KES ${remaining.toLocaleString()} to go!\n\nContribute now: ${poolUrl}`;

  // Get organizer contact
  const { data: organizer } = await supabaseAdmin
    .from("users")
    .select("email, phone")
    .eq("id", pool.organizer_id)
    .maybeSingle();

  const results: Record<string, unknown> = {};

  if (organizer?.phone) {
    const phone = organizer.phone.replace(/[^0-9+]/g, "");
    results.sms = await sendSms(phone, nudgeMessage);
  }

  if (organizer?.email) {
    const html = `<p>🔥 <strong>Almost there!</strong></p><p>"${pool.title}" is ${Math.round(pct)}% funded — just KES ${remaining.toLocaleString()} more to go!</p><p><a href="${poolUrl}">Share the link to reach the goal</a></p>`;
    results.email = await sendEmail(
      organizer.email,
      `🔥 Almost There! "${pool.title}" needs a final push`,
      html,
      nudgeMessage
    );
  }

  return NextResponse.json({ success: true, pct: Math.round(pct), results });
}
