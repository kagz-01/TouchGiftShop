import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/subscriptions — get user's gift subscriptions
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: subscriptions } = await supabaseAdmin
    .from("gift_subscriptions")
    .select(`
      *,
      subscription_recipients (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ subscriptions: subscriptions ?? [] });
}

// POST /api/subscriptions — create a new gift subscription
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { plan, recipients } = await req.json();

  const plans: Record<string, { price: number; maxRecipients: number }> = {
    basic: { price: 500, maxRecipients: 3 },
    standard: { price: 1500, maxRecipients: 10 },
    premium: { price: 3500, maxRecipients: 25 },
  };

  const selectedPlan = plans[plan] || plans.basic;

  // Create subscription
  const { data: subscription, error } = await supabaseAdmin
    .from("gift_subscriptions")
    .insert({
      user_id: user.id,
      plan,
      monthly_price: selectedPlan.price,
      recipient_count: recipients?.length || 0,
      max_recipients: selectedPlan.maxRecipients,
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add recipients
  if (recipients && recipients.length > 0) {
    const recipientInserts = recipients.map((r: any) => ({
      subscription_id: subscription.id,
      recipient_name: r.name,
      recipient_phone: r.phone || null,
      relationship: r.relationship || null,
      occasion: r.occasion || null,
      occasion_month: r.occasionMonth || null,
      occasion_day: r.occasionDay || null,
      budget_range: r.budgetRange || "2000-5000",
      preferences: r.preferences || null,
    }));

    await supabaseAdmin.from("subscription_recipients").insert(recipientInserts);
  }

  return NextResponse.json({ subscription });
}
