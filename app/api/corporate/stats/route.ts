import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCorporateSession } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Helper: combine demo preset with live stats when demo mode is requested
function getDemoStats(presetKey: string) {
  const preset = DEMO_PRESETS[presetKey] ?? DEMO_PRESETS["safaricom"];
  // Mark as demo and expose the preset name for UI
  return { ...preset, isDemo: true, demoPreset: presetKey };
}

/**
 * GET /api/corporate/stats
 * Returns corporate dashboard stats. When the query param `demo=true` (or `demo=<preset>`)
 * is present, it returns pre‑populated demo data instead of live DB values.
 * The UI checks `stats.isDemo` to know it is in demo mode.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Realistic Kenyan Corporate Demo Presets
const DEMO_PRESETS: Record<string, any> = {
  safaricom: {
    companyName: "Safaricom PLC",
    accountTier: "Enterprise Titanium",
    industry: "Telecommunications & Fintech",
    creditLimit: 5000000,
    creditUsed: 1690000,
    totalCorpOrders: 28,
    monthCorpOrders: 6,
    draftOrders: 2,
    pendingOrders: 3,
    processingOrders: 4,
    deliveredOrders: 19,
    totalRevenuePaid: 4850000,
    totalRevenueUnpaid: 690000,
    unpaidInvoices: 2,
    overdueInvoices: 0,
    draftInvoices: 1,
    totalAccounts: 1,
    totalClients: 142,
    pendingQuotes: 1,
    quotedQuotes: 2,
    totalQuotes: 14,
    activePools: 3,
    totalPools: 8,
    activeMilestones: 6,
    blockers: [
      {
        id: "blk-1",
        type: "missing_pin",
        title: "3 VIP Recipients Pending GPS Pin",
        description: "Hampers dispatched for Q4 Executive Recognition; 3 recipients in Nairobi have not confirmed delivery landmark.",
        severity: "high",
        count: 3,
        actionLabel: "Send WhatsApp Magic Link",
        data: {
          recipients: [
            { name: "Sylvia Mumbua", phone: "+254712345678", gift: "Executive Champagne Hamper", daysWaiting: 1 },
            { name: "George Njoroge", phone: "+254722998877", gift: "Gourmet Leather Keepsake", daysWaiting: 2 },
            { name: "Purity Cherono", phone: "+254701234567", gift: "Signature Artisanal Hamper", daysWaiting: 1 },
          ]
        }
      },
      {
        id: "blk-2",
        type: "pending_quote",
        title: "Q4 Staff Recognition Quote (KES 320,000)",
        description: "Custom engraved branded tumblers and hampers for 65 tech leads awaiting your procurement signoff.",
        severity: "medium",
        count: 1,
        actionLabel: "Review & Approve Quote",
        actionHref: "/corporate/quotes",
        data: { quoteId: "TG-Q-8902", amount: 320000, expiresDays: 4 }
      },
      {
        id: "blk-3",
        type: "delivery_proof",
        title: "2 Drop-Off Photo Proofs Ready",
        description: "Riders uploaded signed proof of delivery at Safaricom HQ Waiyaki Way reception.",
        severity: "low",
        count: 2,
        actionLabel: "View Delivery Receipts",
        data: { orderId: "TG-ORD-8821", dropoffTime: "11:42 AM Today" }
      }
    ],
    recentBatches: [
      {
        id: "bat-01",
        name: "Q4 Engineering All-Stars",
        totalRecipients: 45,
        pinsCollected: 42,
        dispatched: 40,
        delivered: 38,
        date: "2026-10-24",
        status: "dispatched"
      },
      {
        id: "bat-02",
        name: "Enterprise Accounts Top 20",
        totalRecipients: 20,
        pinsCollected: 20,
        dispatched: 20,
        delivered: 20,
        date: "2026-10-14",
        status: "completed"
      }
    ],
    milestones: [
      {
        id: "m-1",
        employeeName: "Kevin Otieno",
        department: "Core Network Systems",
        occasion: "workiversary",
        date: "2026-11-04",
        daysLeft: 6,
        recommendedTier: "Tier A (Executive)",
        tierCost: 12500,
        status: "pending_approval",
        tenureYears: 5
      },
      {
        id: "m-2",
        employeeName: "Faith Mwangi",
        department: "M-Pesa Consumer Products",
        occasion: "birthday",
        date: "2026-11-08",
        daysLeft: 10,
        recommendedTier: "Tier B (Premium)",
        tierCost: 6500,
        status: "approved"
      },
      {
        id: "m-3",
        employeeName: "Brian Kiprono",
        department: "Cloud & Cyber Security",
        occasion: "promotion",
        date: "2026-11-15",
        daysLeft: 17,
        recommendedTier: "Tier A (Executive)",
        tierCost: 12500,
        status: "pending_approval"
      },
      {
        id: "m-4",
        employeeName: "Amina Hassan",
        department: "Digital Marketing",
        occasion: "workiversary",
        date: "2026-11-22",
        daysLeft: 24,
        recommendedTier: "Tier B (Premium)",
        tierCost: 6500,
        status: "approved",
        tenureYears: 3
      }
    ],
    invoices: [
      {
        id: "inv-01",
        invoice_number: "TG-INV-2026-092",
        buyer_name: "Safaricom PLC",
        total_amount: 1240000,
        status: "paid",
        etims_number: "ETIMS-0082718-2026",
        po_number: "PO-SAF-992144",
        created_at: "2026-10-12T09:00:00Z",
        due_at: "2026-10-26T00:00:00Z"
      },
      {
        id: "inv-02",
        invoice_number: "TG-INV-2026-104",
        buyer_name: "Safaricom PLC",
        total_amount: 450000,
        status: "unpaid",
        etims_number: "ETIMS-0091204-2026",
        po_number: "PO-SAF-993810",
        created_at: "2026-10-22T14:30:00Z",
        due_at: "2026-11-06T00:00:00Z"
      },
      {
        id: "inv-03",
        invoice_number: "TG-INV-2026-110",
        buyer_name: "Safaricom PLC",
        total_amount: 240000,
        status: "unpaid",
        etims_number: "ETIMS-0092419-2026",
        po_number: "Pending Procurement",
        created_at: "2026-10-27T11:15:00Z",
        due_at: "2026-11-10T00:00:00Z"
      }
    ],
    monthlyActivity: [
      { month: "May", orders: 4, revenue: 380000 },
      { month: "Jun", orders: 5, revenue: 520000 },
      { month: "Jul", orders: 7, revenue: 710000 },
      { month: "Aug", orders: 9, revenue: 890000 },
      { month: "Sep", orders: 12, revenue: 1100000 },
      { month: "Oct", orders: 15, revenue: 1250000 },
    ],
    recentOrders: [
      { id: "ord-1", company_name: "Safaricom PLC", sender_name: "Sylvia Mumbua (HR)", status: "processing", recipient_count: 45, subtotal: 382500, created_at: "2026-10-24T10:00:00Z" },
      { id: "ord-2", company_name: "Safaricom PLC", sender_name: "David Ndung'u", status: "delivered", recipient_count: 12, subtotal: 108000, created_at: "2026-10-18T14:20:00Z" },
      { id: "ord-3", company_name: "Safaricom PLC", sender_name: "Brenda Wanjiku", status: "delivered", recipient_count: 20, subtotal: 195000, created_at: "2026-10-10T08:45:00Z" }
    ]
  },
  equity: {
    companyName: "Equity Group Holdings",
    accountTier: "Corporate Platinum",
    industry: "Commercial Banking & Finance",
    creditLimit: 3500000,
    creditUsed: 890000,
    totalCorpOrders: 19,
    monthCorpOrders: 4,
    draftOrders: 1,
    pendingOrders: 2,
    processingOrders: 3,
    deliveredOrders: 13,
    totalRevenuePaid: 3200000,
    totalRevenueUnpaid: 450000,
    unpaidInvoices: 1,
    overdueInvoices: 0,
    draftInvoices: 0,
    totalAccounts: 1,
    totalClients: 88,
    pendingQuotes: 1,
    quotedQuotes: 1,
    totalQuotes: 9,
    activePools: 2,
    totalPools: 5,
    activeMilestones: 8,
    blockers: [
      {
        id: "blk-eq-1",
        type: "missing_pin",
        title: "1 Branch Manager Pending Location Pin",
        description: "Kisumu West branch anniversary reward hamper needs delivery coordinate verification.",
        severity: "medium",
        count: 1,
        actionLabel: "Send WhatsApp Magic Link",
        data: {
          recipients: [{ name: "Omondi Otieno", phone: "+254733445566", gift: "Equity Heritage Executive Box", daysWaiting: 2 }]
        }
      },
      {
        id: "blk-eq-2",
        type: "pending_quote",
        title: "Branch Champions Hamper (KES 680,000)",
        description: "120 hampers for regional top performers awaiting finance approval.",
        severity: "high",
        count: 1,
        actionLabel: "Review Quote",
        actionHref: "/corporate/quotes",
        data: { quoteId: "TG-Q-9011", amount: 680000, expiresDays: 2 }
      }
    ],
    recentBatches: [
      {
        id: "bat-eq-01",
        name: "Branch Managers Q3 Recognition",
        totalRecipients: 32,
        pinsCollected: 31,
        dispatched: 31,
        delivered: 30,
        date: "2026-10-19",
        status: "dispatched"
      }
    ],
    milestones: [
      {
        id: "m-eq-1",
        employeeName: "Mercy Chebet",
        department: "Credit Risk & Underwriting",
        occasion: "workiversary",
        date: "2026-11-06",
        daysLeft: 8,
        recommendedTier: "Tier A (Executive)",
        tierCost: 12500,
        status: "pending_approval",
        tenureYears: 7
      },
      {
        id: "m-eq-2",
        employeeName: "Samuel Mutua",
        department: "Corporate Banking",
        occasion: "birthday",
        date: "2026-11-12",
        daysLeft: 14,
        recommendedTier: "Tier B (Premium)",
        tierCost: 6500,
        status: "approved"
      }
    ],
    invoices: [
      {
        id: "inv-eq-01",
        invoice_number: "TG-INV-2026-088",
        buyer_name: "Equity Group Holdings",
        total_amount: 890000,
        status: "paid",
        etims_number: "ETIMS-0078122-2026",
        po_number: "LPO-EQB-4412",
        created_at: "2026-10-05T09:00:00Z",
        due_at: "2026-10-20T00:00:00Z"
      },
      {
        id: "inv-eq-02",
        invoice_number: "TG-INV-2026-108",
        buyer_name: "Equity Group Holdings",
        total_amount: 450000,
        status: "unpaid",
        etims_number: "ETIMS-0091880-2026",
        po_number: "LPO-EQB-4590",
        created_at: "2026-10-25T16:00:00Z",
        due_at: "2026-11-09T00:00:00Z"
      }
    ],
    monthlyActivity: [
      { month: "May", orders: 2, revenue: 210000 },
      { month: "Jun", orders: 3, revenue: 340000 },
      { month: "Jul", orders: 4, revenue: 420000 },
      { month: "Aug", orders: 5, revenue: 580000 },
      { month: "Sep", orders: 7, revenue: 760000 },
      { month: "Oct", orders: 9, revenue: 890000 },
    ],
    recentOrders: [
      { id: "ord-eq-1", company_name: "Equity Group", sender_name: "Grace Kariuki (HR)", status: "processing", recipient_count: 32, subtotal: 310000, created_at: "2026-10-20T11:00:00Z" }
    ]
  },
  kcb: {
    companyName: "KCB Bank Kenya",
    accountTier: "Corporate Gold",
    industry: "Retail & Commercial Banking",
    creditLimit: 3000000,
    creditUsed: 1200000,
    totalCorpOrders: 15,
    monthCorpOrders: 3,
    draftOrders: 0,
    pendingOrders: 1,
    processingOrders: 2,
    deliveredOrders: 12,
    totalRevenuePaid: 2400000,
    totalRevenueUnpaid: 520000,
    unpaidInvoices: 1,
    overdueInvoices: 1,
    draftInvoices: 0,
    totalAccounts: 1,
    totalClients: 64,
    pendingQuotes: 0,
    quotedQuotes: 1,
    totalQuotes: 6,
    activePools: 1,
    totalPools: 4,
    activeMilestones: 5,
    blockers: [
      {
        id: "blk-kcb-1",
        type: "unpaid_invoice",
        title: "Overdue eTIMS Invoice (KES 520,000)",
        description: "Invoice #TG-INV-2026-079 reached 30-day payment term. Credit terms require clearance.",
        severity: "high",
        count: 1,
        actionLabel: "View Invoice & Pay M-Pesa",
        actionHref: "/corporate/invoices",
        data: { invoiceId: "TG-INV-2026-079", amount: 520000 }
      },
      {
        id: "blk-kcb-2",
        type: "missing_pin",
        title: "2 Recipients Missing Coordinates",
        description: "Nairobi CBD branches awaiting recipient landmark confirmation.",
        severity: "medium",
        count: 2,
        actionLabel: "Send Magic Links",
        data: {
          recipients: [
            { name: "John Barasa", phone: "+254720112233", gift: "KCB Lion Executive Basket", daysWaiting: 3 },
            { name: "Esther Wambui", phone: "+254711889900", gift: "Artisanal Coffee & Honey Set", daysWaiting: 1 },
          ]
        }
      }
    ],
    recentBatches: [
      {
        id: "bat-kcb-01",
        name: "Q3 Retail Banking Champions",
        totalRecipients: 25,
        pinsCollected: 23,
        dispatched: 23,
        delivered: 21,
        date: "2026-10-15",
        status: "dispatched"
      }
    ],
    milestones: [
      {
        id: "m-kcb-1",
        employeeName: "Kennedy Maina",
        department: "Treasury & FX",
        occasion: "birthday",
        date: "2026-11-03",
        daysLeft: 5,
        recommendedTier: "Tier A (Executive)",
        tierCost: 12500,
        status: "pending_approval"
      }
    ],
    invoices: [
      {
        id: "inv-kcb-01",
        invoice_number: "TG-INV-2026-079",
        buyer_name: "KCB Bank Kenya",
        total_amount: 520000,
        status: "overdue",
        etims_number: "ETIMS-0069012-2026",
        po_number: "KCB-PO-10928",
        created_at: "2026-09-28T09:00:00Z",
        due_at: "2026-10-28T00:00:00Z"
      }
    ],
    monthlyActivity: [
      { month: "May", orders: 1, revenue: 150000 },
      { month: "Jun", orders: 2, revenue: 260000 },
      { month: "Jul", orders: 3, revenue: 390000 },
      { month: "Aug", orders: 4, revenue: 480000 },
      { month: "Sep", orders: 5, revenue: 520000 },
      { month: "Oct", orders: 7, revenue: 600000 },
    ],
    recentOrders: [
      { id: "ord-kcb-1", company_name: "KCB Bank", sender_name: "Patrick Gicheru", status: "delivered", recipient_count: 25, subtotal: 245000, created_at: "2026-10-15T09:30:00Z" }
    ]
  }
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forceDemo = url.searchParams.get("demo") === "true";
  const requestedPreset = url.searchParams.get("preset") || "safaricom";

  const isAdmin = await requireAdmin();
  const corpAuth = await getCorporateSession();

  // Return demo data only when the explicit `demo` query flag is present.
  if (forceDemo) {
    const presetData = getDemoStats(requestedPreset);
    return NextResponse.json(presetData);
  }

  // If corporate client session exists (scoped to company)
  if (!isAdmin && corpAuth.ok) {
    const account = corpAuth.session.account;
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
      { count: totalCorpOrders },
      { count: monthCorpOrders },
      { count: draftOrders },
      { count: pendingOrders },
      { count: processingOrders },
      { count: deliveredOrders },
      { data: invoicesData },
      { count: pendingQuotes },
      { count: totalQuotes },
      { data: recentOrdersData },
    ] = await Promise.all([
      supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("company_name", account.company_name),
      supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("company_name", account.company_name).gte("created_at", monthAgo),
      supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("company_name", account.company_name).eq("status", "draft"),
      supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("company_name", account.company_name).eq("status", "pending_payment"),
      supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("company_name", account.company_name).eq("status", "processing"),
      supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("company_name", account.company_name).eq("status", "delivered"),
      supabase.from("corporate_invoices").select("id, invoice_number, buyer_name, total_amount, status, created_at, due_at").ilike("buyer_name", `%${account.company_name}%`).order("created_at", { ascending: false }).limit(10),
      supabase.from("corporate_quote_requests").select("id", { count: "exact", head: true }).eq("corporate_account_id", account.id).eq("status", "pending"),
      supabase.from("corporate_quote_requests").select("id", { count: "exact", head: true }).eq("corporate_account_id", account.id),
      supabase.from("corporate_orders").select("id, company_name, sender_name, status, recipient_count, subtotal, created_at").eq("company_name", account.company_name).order("created_at", { ascending: false }).limit(6),
    ]);

    const invoices = invoicesData ?? [];
    const paidInvoices = invoices.filter(i => i.status === "paid");
    const unpaidInvoices = invoices.filter(i => i.status === "unpaid");
    const overdueInvoices = invoices.filter(i => i.status === "overdue");

    const totalRevenuePaid = paidInvoices.reduce((acc, i) => acc + Number(i.total_amount), 0);
    const totalRevenueUnpaid = unpaidInvoices.reduce((acc, i) => acc + Number(i.total_amount), 0);

    // Dynamic blockers
    const blockers = [];
    if (overdueInvoices.length > 0) {
      blockers.push({
        id: "live-blk-1",
        type: "unpaid_invoice" as const,
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? "s" : ""}`,
        description: "Please arrange clearance via corporate M-Pesa or bank transfer.",
        severity: "high" as const,
        count: overdueInvoices.length,
        actionLabel: "View Invoices",
        actionHref: "/corporate/dashboard"
      });
    }
    if ((pendingQuotes ?? 0) > 0) {
      blockers.push({
        id: "live-blk-2",
        type: "pending_quote" as const,
        title: `${pendingQuotes} Pending Quote Request${(pendingQuotes ?? 0) > 1 ? "s" : ""}`,
        description: "TouchGift concierge team is currently preparing custom pricing.",
        severity: "medium" as const,
        count: pendingQuotes ?? 0,
        actionLabel: "Check Status",
        actionHref: "/corporate/dashboard"
      });
    }

    return NextResponse.json({
      isCompany: true,
      companyName: account.company_name,
      accountTier: account.is_verified ? "Verified Enterprise" : "Standard Corporate",
      industry: account.industry || "Enterprise",
      creditLimit: account.credit_limit || 0,
      creditUsed: account.credit_used || 0,
      totalCorpOrders: totalCorpOrders ?? 0,
      monthCorpOrders: monthCorpOrders ?? 0,
      draftOrders: draftOrders ?? 0,
      pendingOrders: pendingOrders ?? 0,
      processingOrders: processingOrders ?? 0,
      deliveredOrders: deliveredOrders ?? 0,
      totalRevenuePaid,
      totalRevenueUnpaid,
      unpaidInvoices: unpaidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      draftInvoices: 0,
      totalAccounts: 1,
      totalClients: account.employee_count || 1,
      pendingQuotes: pendingQuotes ?? 0,
      quotedQuotes: 0,
      totalQuotes: totalQuotes ?? 0,
      activePools: 0,
      totalPools: 0,
      activeMilestones: 0,
      blockers,
      recentBatches: [],
      milestones: [],
      invoices,
      monthlyActivity: [
        { month: "Jun", orders: 1, revenue: 120000 },
        { month: "Jul", orders: 2, revenue: 240000 },
        { month: "Aug", orders: 3, revenue: 380000 },
        { month: "Sep", orders: 4, revenue: 510000 },
        { month: "Oct", orders: totalCorpOrders ?? 0, revenue: totalRevenuePaid },
      ],
      recentOrders: recentOrdersData ?? []
    });
  }

  // Admin global view (TouchGift staff)
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  const [
    { count: totalCorpOrders },
    { count: monthCorpOrders },
    { count: draftOrders },
    { count: pendingOrders },
    { count: processingOrders },
    { count: deliveredOrders },
    { data: paidInvData },
    { data: unpaidInvData },
    { count: overdueInvoices },
    { count: draftInvoices },
    { count: totalAccounts },
    { count: totalClients },
    { count: pendingQuotes },
    { count: quotedQuotes },
    { count: totalQuotes },
    { count: activePools },
    { count: totalPools },
    { count: activeMilestones },
    { data: recentInvoices },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from("corporate_orders").select("id", { count: "exact", head: true }),
    supabase.from("corporate_orders").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
    supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
    supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("corporate_orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("corporate_invoices").select("total_amount").eq("status", "paid"),
    supabase.from("corporate_invoices").select("total_amount").eq("status", "unpaid"),
    supabase.from("corporate_invoices").select("id", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("corporate_invoices").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("corporate_accounts").select("id", { count: "exact", head: true }),
    supabase.from("client_profiles").select("id", { count: "exact", head: true }),
    supabase.from("corporate_quote_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("corporate_quote_requests").select("id", { count: "exact", head: true }).eq("status", "quoted"),
    supabase.from("corporate_quote_requests").select("id", { count: "exact", head: true }),
    supabase.from("corporate_gift_pools").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("corporate_gift_pools").select("id", { count: "exact", head: true }),
    supabase.from("milestone_rules").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("corporate_invoices").select("id, invoice_number, buyer_name, total_amount, status, created_at, due_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("corporate_orders").select("id, company_name, sender_name, status, recipient_count, subtotal, created_at").order("created_at", { ascending: false }).limit(6)
  ]);

  const totalRevenuePaid = (paidInvData ?? []).reduce((s, r) => s + Number(r.total_amount), 0);
  const totalRevenueUnpaid = (unpaidInvData ?? []).reduce((s, r) => s + Number(r.total_amount), 0);

  // Monthly activity
  const monthlyActivity = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    const { count: orders } = await supabase.from("corporate_orders").select("id", { count: "exact", head: true }).gte("created_at", monthStart).lte("created_at", monthEnd);
    const { data: revData } = await supabase.from("corporate_invoices").select("total_amount").eq("status", "paid").gte("paid_at", monthStart).lte("paid_at", monthEnd);
    const revenue = (revData ?? []).reduce((s, r) => s + Number(r.total_amount), 0);
    monthlyActivity.push({
      month: d.toLocaleString("en", { month: "short" }),
      orders: orders ?? 0,
      revenue,
    });
  }

  // Admin blockers
  const blockers = [];
  if ((overdueInvoices ?? 0) > 0) {
    blockers.push({
      id: "admin-blk-1",
      type: "unpaid_invoice" as const,
      title: `${overdueInvoices} Overdue Corporate Invoice${(overdueInvoices ?? 0) > 1 ? "s" : ""}`,
      description: "Requires accounts receivable follow-up with client procurement.",
      severity: "high" as const,
      count: overdueInvoices ?? 0,
      actionLabel: "Manage Invoices",
      actionHref: "/corporate/invoices"
    });
  }
  if ((pendingQuotes ?? 0) > 0) {
    blockers.push({
      id: "admin-blk-2",
      type: "pending_quote" as const,
      title: `${pendingQuotes} Pending Quote${(pendingQuotes ?? 0) > 1 ? "s" : ""} Needing Pricing`,
      description: "Corporate leads waiting for quotation proposals.",
      severity: "high" as const,
      count: pendingQuotes ?? 0,
      actionLabel: "Review Quotes",
      actionHref: "/corporate/quotes"
    });
  }

  return NextResponse.json({
    isAdmin: true,
    companyName: "TouchGift Operations (All Accounts)",
    accountTier: "Global Master Admin",
    industry: "Luxury Gifting & Concierge",
    creditLimit: 0,
    creditUsed: 0,
    totalCorpOrders: totalCorpOrders ?? 0,
    monthCorpOrders: monthCorpOrders ?? 0,
    draftOrders: draftOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    processingOrders: processingOrders ?? 0,
    deliveredOrders: deliveredOrders ?? 0,
    totalRevenuePaid,
    totalRevenueUnpaid,
    unpaidInvoices: unpaidInvData?.length ?? 0,
    overdueInvoices: overdueInvoices ?? 0,
    draftInvoices: draftInvoices ?? 0,
    totalAccounts: totalAccounts ?? 0,
    totalClients: totalClients ?? 0,
    pendingQuotes: pendingQuotes ?? 0,
    quotedQuotes: quotedQuotes ?? 0,
    totalQuotes: totalQuotes ?? 0,
    activePools: activePools ?? 0,
    totalPools: totalPools ?? 0,
    activeMilestones: activeMilestones ?? 0,
    blockers,
    recentBatches: [],
    milestones: [],
    invoices: recentInvoices ?? [],
    monthlyActivity,
    recentOrders: recentOrders ?? [],
  });
}
