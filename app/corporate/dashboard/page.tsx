"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  LayoutDashboard, FileText, Inbox, Users, Gift, TrendingUp,
  Calendar, Settings, ChevronRight, RefreshCw, ArrowUp, ArrowDown,
  Building2, Package, DollarSign, Target, Clock, CheckCircle,
  AlertCircle, Plus, Zap, CreditCard, Bell, ShoppingBag, Loader2,
} from "lucide-react";

// Lazy-load heavy tabs so initial bundle stays small
const ShopTab         = dynamic(() => import("@/components/corporate/tabs/ShopTab"),         { loading: () => <TabLoader /> });
const HamperBuilderTab = dynamic(() => import("@/components/corporate/tabs/HamperBuilderTab"), { loading: () => <TabLoader /> });
const GiftPoolsTab    = dynamic(() => import("@/components/corporate/tabs/GiftPoolsTab"),    { loading: () => <TabLoader /> });
const ClientsTab      = dynamic(() => import("@/components/corporate/tabs/ClientsTab"),      { loading: () => <TabLoader /> });
const MilestonesTab   = dynamic(() => import("@/components/corporate/tabs/MilestonesTab"),   { loading: () => <TabLoader /> });
const QuoteOpsPanel   = dynamic(() => import("@/components/corporate/QuoteOpsPanel"),        { loading: () => <TabLoader /> });
const PortalAccessPanel = dynamic(() => import("@/components/corporate/PortalAccessPanel"),  { loading: () => <TabLoader /> });
const InvoiceOpsPanel   = dynamic(() => import("@/components/corporate/InvoiceOpsPanel"),    { loading: () => <TabLoader /> });

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalCorpOrders: number; monthCorpOrders: number;
  draftOrders: number; pendingOrders: number;
  processingOrders: number; deliveredOrders: number;
  totalRevenuePaid: number; totalRevenueUnpaid: number;
  unpaidInvoices: number; overdueInvoices: number; draftInvoices: number;
  totalAccounts: number; totalClients: number;
  pendingQuotes: number; quotedQuotes: number; totalQuotes: number;
  activePools: number; totalPools: number; activeMilestones: number;
  monthlyActivity: { month: string; orders: number; revenue: number }[];
  recentInvoices: RecentInvoice[];
  recentOrders: RecentOrder[];
}
interface RecentInvoice {
  id: string; invoice_number: string; buyer_name: string;
  total_amount: number; status: string; created_at: string; due_at: string | null;
}
interface RecentOrder {
  id: string; company_name: string | null; sender_name: string;
  status: string; recipient_count: number; subtotal: number; created_at: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV = [
  { key: "overview",   label: "Overview",       icon: LayoutDashboard, group: "workspace" },
  { key: "shop",       label: "Shop",           icon: ShoppingBag,     group: "workspace" },
  { key: "hamper",     label: "Build Hamper",   icon: Gift,            group: "workspace" },
  { key: "pools",      label: "Gift Pools",     icon: Target,          group: "workspace" },
  { key: "orders",     label: "Orders",         icon: Package,         group: "ops" },
  { key: "invoices",   label: "Invoices",       icon: FileText,        group: "ops" },
  { key: "quotes",     label: "Quotes",         icon: Inbox,           group: "ops" },
  { key: "clients",    label: "Clients",        icon: Users,           group: "ops" },
  { key: "milestones", label: "Milestones",     icon: TrendingUp,      group: "ops" },
  { key: "calendar",   label: "Calendar",       icon: Calendar,        group: "ops" },
  { key: "portal",     label: "Portal Settings",icon: Settings,        group: "settings" },
] as const;
type Tab = typeof NAV[number]["key"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtKsh(n: number) {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `KES ${Math.round(n / 1_000)}K`;
  return `KES ${n.toLocaleString()}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500", pending_payment: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700", delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600", paid: "bg-green-50 text-green-700",
  unpaid: "bg-amber-50 text-amber-700", overdue: "bg-red-50 text-red-600",
  pending: "bg-amber-50 text-amber-700", quoted: "bg-blue-50 text-blue-700",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", pending_payment: "Pending", processing: "Processing",
  delivered: "Delivered", cancelled: "Cancelled", paid: "Paid",
  unpaid: "Unpaid", overdue: "Overdue", pending: "Pending", quoted: "Quoted",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Skeleton({ h = 4, w = "full" }: { h?: number; w?: string }) {
  return <div className={`h-${h} w-${w} bg-gray-100 rounded animate-pulse`} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconBg, loading, alert }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>; iconBg: string;
  loading?: boolean; alert?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-lg p-5 hover:shadow-sm transition-shadow ${alert ? "border-red-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
      </div>
      <div className="mt-4">
        {loading
          ? <><Skeleton h={6} /><div className="mt-1"><Skeleton h={3} w="2/3" /></div></>
          : <>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              {sub && <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">{sub}</p>}
            </>
        }
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MonthlyChart({ data, loading }: { data: Stats["monthlyActivity"]; loading: boolean }) {
  const rows = data.length ? data : Array.from({ length: 6 }, (_, i) => ({ month: ["May","Jun","Jul","Aug","Sep","Oct"][i], orders: 0, revenue: 0 }));
  const maxO = Math.max(...rows.map(d => d.orders), 1);
  const maxR = Math.max(...rows.map(d => d.revenue), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Monthly Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Orders & revenue · last 6 months</p>
        </div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" />Orders</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-green-400 inline-block" />Revenue</span>
        </div>
      </div>
      {loading ? (
        <div className="flex items-end gap-3 h-36">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1 items-center">
              <div className="w-full bg-gray-100 rounded animate-pulse" style={{ height: `${30 + i * 12}%` }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3 h-36 mb-3">
            {rows.map(d => (
              <div key={d.month} className="flex-1 flex gap-0.5 items-end">
                <div className="flex-1 bg-amber-400 hover:bg-amber-500 rounded-t transition-colors"
                  style={{ height: `${Math.max((d.orders / maxO) * 130, d.orders > 0 ? 4 : 2)}px` }} title={`${d.orders} orders`} />
                <div className="flex-1 bg-green-400 hover:bg-green-500 rounded-t transition-colors"
                  style={{ height: `${Math.max((d.revenue / maxR) * 130, d.revenue > 0 ? 4 : 2)}px` }} title={fmtKsh(d.revenue)} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {rows.map(d => <div key={d.month} className="flex-1 text-center"><span className="text-[10px] text-gray-400 font-medium">{d.month}</span></div>)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
function Pipeline({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const stages = [
    { label: "Draft",      val: stats?.draftOrders ?? 0,      color: "bg-gray-300" },
    { label: "Pending",    val: stats?.pendingOrders ?? 0,    color: "bg-amber-400" },
    { label: "Processing", val: stats?.processingOrders ?? 0, color: "bg-blue-400" },
    { label: "Delivered",  val: stats?.deliveredOrders ?? 0,  color: "bg-green-500" },
  ];
  const total = Math.max(stages.reduce((a, s) => a + s.val, 0), 1);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Order Pipeline</h3>
          <p className="text-xs text-gray-400 mt-0.5">Status breakdown</p>
        </div>
      </div>
      <div className="space-y-4">
        {stages.map(s => {
          const pct = Math.round((s.val / total) * 100);
          return (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-gray-600 font-medium">{s.label}</span>
                <span className="text-sm font-bold text-gray-900">{loading ? "—" : s.val}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: loading ? "0%" : `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedTable({ items, type, loading }: { items: (RecentInvoice | RecentOrder)[]; type: "invoice" | "order"; loading: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{type === "invoice" ? "Recent Invoices" : "Recent Orders"}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest activity</p>
        </div>
        <Link href={type === "invoice" ? "/corporate/invoices" : "/corporate/orders"}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton /><Skeleton w="1/2" h={3} /></div>
              <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-gray-400">
          {type === "invoice" ? <FileText className="w-7 h-7 mb-2 opacity-30" /> : <Package className="w-7 h-7 mb-2 opacity-30" />}
          <p className="text-sm">No {type === "invoice" ? "invoices" : "orders"} yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map((item: any) => (
            <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${type === "invoice" ? "bg-amber-50 border border-amber-100" : "bg-blue-50 border border-blue-100"}`}>
                {type === "invoice" ? <FileText className="w-4 h-4 text-amber-600" /> : <Package className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {type === "invoice" ? item.buyer_name : (item.company_name || item.sender_name)}
                </p>
                <p className="text-xs text-gray-400">
                  {type === "invoice" ? item.invoice_number : `${item.recipient_count} recipients`} · {fmtDate(item.created_at)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {type === "invoice" ? `KES ${Number(item.total_amount).toLocaleString()}` : `KES ${Number(item.subtotal).toLocaleString()}`}
                </p>
                <Badge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading, onTab }: { stats: Stats | null; loading: boolean; onTab: (t: Tab) => void }) {
  const s = stats;
  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Corp Orders",     value: s ? String(s.totalCorpOrders)  : "—", sub: `${s?.monthCorpOrders ?? 0} this month`, icon: Package,    iconBg: "bg-amber-50 text-amber-600" },
          { label: "Revenue",         value: s ? fmtKsh(s.totalRevenuePaid) : "—", sub: `${s?.unpaidInvoices ?? 0} unpaid`,       icon: DollarSign,  iconBg: "bg-green-50 text-green-600" },
          { label: "Pending Quotes",  value: s ? String(s.pendingQuotes)    : "—", sub: `${s?.totalQuotes ?? 0} total`,           icon: Inbox,       iconBg: s?.pendingQuotes ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400", alert: (s?.pendingQuotes ?? 0) > 0 },
          { label: "Corp Accounts",   value: s ? String(s.totalAccounts)    : "—", sub: `${s?.totalClients ?? 0} contacts`,       icon: Building2,   iconBg: "bg-blue-50 text-blue-600" },
          { label: "Outstanding",     value: s ? fmtKsh(s.totalRevenueUnpaid): "—",sub: `${s?.overdueInvoices ?? 0} overdue`,     icon: CreditCard,  iconBg: s?.overdueInvoices ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400", alert: (s?.overdueInvoices ?? 0) > 0 },
          { label: "Active Pools",    value: s ? String(s.activePools)      : "—", sub: `${s?.totalPools ?? 0} total`,            icon: Target,      iconBg: "bg-indigo-50 text-indigo-600" },
          { label: "Milestones",      value: s ? String(s.activeMilestones) : "—", sub: "Gifting automations on",                  icon: Zap,         iconBg: "bg-yellow-50 text-yellow-600" },
          { label: "Draft Invoices",  value: s ? String(s.draftInvoices)    : "—", sub: "Awaiting issue",                         icon: FileText,    iconBg: "bg-gray-50 text-gray-400" },
        ].map(k => <KpiCard key={k.label} {...k} loading={loading} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><MonthlyChart data={stats?.monthlyActivity ?? []} loading={loading} /></div>
        <Pipeline stats={stats} loading={loading} />
      </div>

      {/* Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeedTable items={stats?.recentInvoices ?? []} type="invoice" loading={loading} />
        <FeedTable items={stats?.recentOrders ?? []} type="order" loading={loading} />
      </div>

      {/* Quick action tiles — navigate inside the corp shell */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { tab: "shop"    as Tab, icon: ShoppingBag, label: "Shop",         sub: "Browse corp catalog",      color: "border-amber-200 bg-amber-50 text-amber-700" },
          { tab: "hamper"  as Tab, icon: Gift,        label: "Build Hamper",  sub: "Step-by-step builder",     color: "border-green-200 bg-green-50 text-green-700" },
          { tab: "pools"   as Tab, icon: Target,      label: "Gift Pools",    sub: `${stats?.activePools ?? "—"} active`, color: "border-indigo-200 bg-indigo-50 text-indigo-700" },
          { tab: "milestones" as Tab, icon: Zap,      label: "Milestones",    sub: "Auto-gift rules",          color: "border-yellow-200 bg-yellow-50 text-yellow-700" },
        ].map(t => (
          <button key={t.tab} onClick={() => onTab(t.tab)}
            className={`group flex flex-col gap-2 p-4 rounded-lg border text-left ${t.color} hover:shadow-sm transition-all`}>
            <t.icon className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{t.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────
function OrdersTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const statuses = ["all", "draft", "pending_payment", "processing", "delivered", "cancelled"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",      val: stats?.totalCorpOrders ?? 0,   icon: Package,       bg: "bg-gray-50 text-gray-500" },
          { label: "Processing", val: stats?.processingOrders ?? 0,  icon: Clock,         bg: "bg-blue-50 text-blue-600" },
          { label: "Delivered",  val: stats?.deliveredOrders ?? 0,   icon: CheckCircle,   bg: "bg-green-50 text-green-600" },
          { label: "Draft",      val: stats?.draftOrders ?? 0,       icon: FileText,      bg: "bg-gray-50 text-gray-400" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${k.bg}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : k.val}</p>
            <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Status filter strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              statusFilter === s ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
            }`}>
            {s === "all" ? "All" : STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <FeedTable items={stats?.recentOrders ?? []} type="order" loading={loading} />
      <div className="text-center">
        <Link href="/corporate/orders" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:border-amber-300 text-sm font-semibold text-gray-700 rounded-lg transition-all">
          <Package className="w-4 h-4" /> View All Orders
        </Link>
      </div>
    </div>
  );
}

// ─── Invoices tab ─────────────────────────────────────────────────────────────
function InvoicesTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Paid Revenue",  val: stats ? fmtKsh(stats.totalRevenuePaid)    : "—", icon: DollarSign,  border: "border-green-200", bg: "bg-green-50 text-green-600" },
          { label: "Outstanding",   val: stats ? fmtKsh(stats.totalRevenueUnpaid)  : "—", icon: CreditCard,  border: "border-amber-200", bg: "bg-amber-50 text-amber-600" },
          { label: "Overdue",       val: stats ? String(stats.overdueInvoices)     : "—", icon: AlertCircle, border: "border-red-200",   bg: "bg-red-50 text-red-500" },
          { label: "Draft",         val: stats ? String(stats.draftInvoices)       : "—", icon: FileText,    border: "border-gray-200",  bg: "bg-gray-50 text-gray-400" },
        ].map(k => (
          <div key={k.label} className={`bg-white border ${k.border} rounded-lg p-5`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${k.bg}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : k.val}</p>
            <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>
      <InvoiceOpsPanel />
    </div>
  );
}

// ─── Calendar stub ────────────────────────────────────────────────────────────
function CalendarTab() {
  return (
    <div className="flex flex-col items-center py-24 gap-3">
      <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center">
        <Calendar className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold text-gray-800">Event Calendar</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">Schedule bulk dispatches around key dates — end-of-year, national holidays, client birthdays.</p>
      </div>
      <Link href="/corporate/calendar" className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
        <Plus className="w-4 h-4" /> Schedule Event
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CorporateDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/corporate/stats");
      if (r.ok) setStats(await r.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const alertCount = (stats?.pendingQuotes ?? 0) + (stats?.overdueInvoices ?? 0);

  // Group nav items
  const workspaceTabs = NAV.filter(n => n.group === "workspace");
  const opsTabs       = NAV.filter(n => n.group === "ops");
  const settingsTabs  = NAV.filter(n => n.group === "settings");

  function NavBtn({ n }: { n: typeof NAV[number] }) {
    const active = activeTab === n.key;
    const badge =
      n.key === "quotes"   ? (stats?.pendingQuotes ?? 0) :
      n.key === "invoices" ? (stats?.overdueInvoices ?? 0) : 0;
    return (
      <button onClick={() => setActiveTab(n.key)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all group ${
          active
            ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}>
        <n.icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-600" : "text-gray-400 group-hover:text-gray-600"}`} />
        <span className="flex-1 truncate">{n.label}</span>
        {badge > 0 && (
          <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
            {badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-gray-100 shrink-0">
          <Link href="/corporate" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Corporate</p>
              <p className="text-[10px] text-gray-400 mt-0.5">TouchGift B2B</p>
            </div>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-3 space-y-4">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 mb-1.5">Workspace</p>
            <div className="space-y-0.5">{workspaceTabs.map(n => <NavBtn key={n.key} n={n} />)}</div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 mb-1.5">Operations</p>
            <div className="space-y-0.5">{opsTabs.map(n => <NavBtn key={n.key} n={n} />)}</div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 mb-1.5">Settings</p>
            <div className="space-y-0.5">{settingsTabs.map(n => <NavBtn key={n.key} n={n} />)}</div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-gray-100 shrink-0 space-y-0.5">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all">
            <Building2 className="w-4 h-4" /> Main Store
          </Link>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shrink-0">
          {/* Mobile scroll tabs */}
          <div className="lg:hidden flex items-center gap-1 flex-1 overflow-x-auto hide-scrollbar">
            {NAV.map(n => (
              <button key={n.key} onClick={() => setActiveTab(n.key)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === n.key ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-gray-400 hover:text-gray-700"
                }`}>
                {n.label}
              </button>
            ))}
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
            <span>Corporate</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-gray-800">{NAV.find(n => n.key === activeTab)?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {alertCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                <Bell className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-600">{alertCount} need attention</span>
              </div>
            )}
            <button onClick={refresh} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button onClick={() => setActiveTab("hamper")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">
              <Gift className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Build Hamper</span>
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-5 lg:p-6 max-w-screen-xl w-full mx-auto">
          {activeTab === "overview"    && <OverviewTab stats={stats} loading={loading} onTab={setActiveTab} />}
          {activeTab === "shop"        && <ShopTab />}
          {activeTab === "hamper"      && <HamperBuilderTab />}
          {activeTab === "pools"       && <GiftPoolsTab />}
          {activeTab === "orders"      && <OrdersTab stats={stats} loading={loading} />}
          {activeTab === "invoices"    && <InvoicesTab stats={stats} loading={loading} />}
          {activeTab === "quotes"      && <QuoteOpsPanel initialPending={stats?.pendingQuotes ?? 0} />}
          {activeTab === "clients"     && <ClientsTab />}
          {activeTab === "milestones"  && <MilestonesTab />}
          {(activeTab as string) === "calendar" && <CalendarTab />}
          {activeTab === "portal"      && <div className="max-w-lg"><PortalAccessPanel /></div>}
        </main>
      </div>
    </div>
  );
}
