import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  // ── Corporate Orders (corporate_orders table) ─────────────────────────────
  const { count: totalCorpOrders } = await supabase
    .from("corporate_orders").select("id", { count: "exact", head: true });

  const { count: monthCorpOrders } = await supabase
    .from("corporate_orders").select("id", { count: "exact", head: true })
    .gte("created_at", monthAgo);

  const { count: draftOrders } = await supabase
    .from("corporate_orders").select("id", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: pendingOrders } = await supabase
    .from("corporate_orders").select("id", { count: "exact", head: true })
    .eq("status", "pending_payment");

  const { count: processingOrders } = await supabase
    .from("corporate_orders").select("id", { count: "exact", head: true })
    .eq("status", "processing");

  const { count: deliveredOrders } = await supabase
    .from("corporate_orders").select("id", { count: "exact", head: true })
    .eq("status", "delivered");

  // ── Invoices ──────────────────────────────────────────────────────────────
  const { data: paidInvData } = await supabase
    .from("corporate_invoices").select("total_amount").eq("status", "paid");
  const totalRevenuePaid = (paidInvData ?? []).reduce(
    (s, r) => s + Number(r.total_amount), 0
  );

  const { data: unpaidInvData } = await supabase
    .from("corporate_invoices").select("total_amount").eq("status", "unpaid");
  const totalRevenueUnpaid = (unpaidInvData ?? []).reduce(
    (s, r) => s + Number(r.total_amount), 0
  );
  const unpaidInvoices = unpaidInvData?.length ?? 0;

  const { count: overdueInvoices } = await supabase
    .from("corporate_invoices").select("id", { count: "exact", head: true })
    .eq("status", "overdue");

  const { count: draftInvoices } = await supabase
    .from("corporate_invoices").select("id", { count: "exact", head: true })
    .eq("status", "draft");

  // ── Accounts & clients ────────────────────────────────────────────────────
  const { count: totalAccounts } = await supabase
    .from("corporate_accounts").select("id", { count: "exact", head: true });

  const { count: totalClients } = await supabase
    .from("client_profiles").select("id", { count: "exact", head: true });

  // ── Quotes ────────────────────────────────────────────────────────────────
  const { count: pendingQuotes } = await supabase
    .from("corporate_quote_requests").select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: quotedQuotes } = await supabase
    .from("corporate_quote_requests").select("id", { count: "exact", head: true })
    .eq("status", "quoted");

  const { count: totalQuotes } = await supabase
    .from("corporate_quote_requests").select("id", { count: "exact", head: true });

  // ── Pools & milestones ────────────────────────────────────────────────────
  const { count: activePools } = await supabase
    .from("corporate_gift_pools").select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalPools } = await supabase
    .from("corporate_gift_pools").select("id", { count: "exact", head: true });

  const { count: activeMilestones } = await supabase
    .from("milestone_rules").select("id", { count: "exact", head: true })
    .eq("is_active", true);

  // ── Monthly activity (last 6 months) ─────────────────────────────────────
  const monthlyActivity = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.toISOString();
    const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();

    const { count: orders } = await supabase
      .from("corporate_orders").select("id", { count: "exact", head: true })
      .gte("created_at", monthStart).lte("created_at", monthEnd);

    const { data: revData } = await supabase
      .from("corporate_invoices").select("total_amount")
      .eq("status", "paid")
      .gte("paid_at", monthStart).lte("paid_at", monthEnd);

    const revenue = (revData ?? []).reduce((s, r) => s + Number(r.total_amount), 0);

    monthlyActivity.push({
      month:   d.toLocaleString("en", { month: "short" }),
      orders:  orders ?? 0,
      revenue,
    });
  }

  // ── Recent invoices ───────────────────────────────────────────────────────
  const { data: recentInvoices } = await supabase
    .from("corporate_invoices")
    .select("id, invoice_number, buyer_name, total_amount, status, created_at, due_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // ── Recent orders ─────────────────────────────────────────────────────────
  const { data: recentOrders } = await supabase
    .from("corporate_orders")
    .select("id, company_name, sender_name, status, recipient_count, subtotal, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    totalCorpOrders:   totalCorpOrders  ?? 0,
    monthCorpOrders:   monthCorpOrders  ?? 0,
    draftOrders:       draftOrders      ?? 0,
    pendingOrders:     pendingOrders    ?? 0,
    processingOrders:  processingOrders ?? 0,
    deliveredOrders:   deliveredOrders  ?? 0,
    totalRevenuePaid,
    totalRevenueUnpaid,
    unpaidInvoices,
    overdueInvoices:   overdueInvoices  ?? 0,
    draftInvoices:     draftInvoices    ?? 0,
    totalAccounts:     totalAccounts    ?? 0,
    totalClients:      totalClients     ?? 0,
    pendingQuotes:     pendingQuotes    ?? 0,
    quotedQuotes:      quotedQuotes     ?? 0,
    totalQuotes:       totalQuotes      ?? 0,
    activePools:       activePools      ?? 0,
    totalPools:        totalPools       ?? 0,
    activeMilestones:  activeMilestones ?? 0,
    monthlyActivity,
    recentInvoices:    recentInvoices   ?? [],
    recentOrders:      recentOrders     ?? [],
  });
}
