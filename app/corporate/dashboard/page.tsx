"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, FileText, Inbox, Users, Gift, TrendingUp,
  Calendar, Settings, ChevronRight, RefreshCw, ArrowUp, ArrowDown,
  Building2, Package, DollarSign, Target, Clock, CheckCircle,
  AlertCircle, Plus, Zap, CreditCard, Bell, ShoppingBag, Loader2,
  Moon, Sun, Sparkles, ExternalLink,
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import CorporateHeader from "@/components/corporate/dashboard/CorporateHeader";
import ControlRoomOverview from "@/components/corporate/dashboard/ControlRoomOverview";

// Lazy-load heavy tabs so initial bundle stays small
const ShopTab         = dynamic(() => import("@/components/corporate/tabs/ShopTab"),         { loading: () => <TabLoader /> });
const HamperBuilderTab = dynamic(() => import("@/components/corporate/tabs/HamperBuilderTab"), { loading: () => <TabLoader /> });
const GiftPoolsTab    = dynamic(() => import("@/components/corporate/tabs/GiftPoolsTab"),    { loading: () => <TabLoader /> });
const ClientsTab      = dynamic(() => import("@/components/corporate/tabs/ClientsTab"),      { loading: () => <TabLoader /> });
const MilestonesTab   = dynamic(() => import("@/components/corporate/tabs/MilestonesTab"),   { loading: () => <TabLoader /> });
const GiftCardsTab    = dynamic(() => import("@/components/corporate/tabs/GiftCardsTab"),    { loading: () => <TabLoader /> });
const QuoteOpsPanel   = dynamic(() => import("@/components/corporate/QuoteOpsPanel"),        { loading: () => <TabLoader /> });
const PortalSettingsTab = dynamic(() => import("@/components/corporate/tabs/PortalSettingsTab"), { loading: () => <TabLoader /> });
const InvoiceOpsPanel   = dynamic(() => import("@/components/corporate/InvoiceOpsPanel"),    { loading: () => <TabLoader /> });
const WelcomeOnboarding = dynamic(() => import("@/components/corporate/WelcomeOnboarding"), { ssr: false });
const QuickStartBanner  = dynamic(() => import("@/components/corporate/QuickStartBanner"),  { ssr: false });

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
  { key: "giftcards",  label: "Gift Cards",     icon: CreditCard,      group: "workspace" },
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
  const alertStatuses = ["overdue", "cancelled", "unpaid"];
  const warnStatuses  = ["pending_payment", "pending", "quoted"];
  const okStatuses    = ["paid", "delivered"];
  const isAlert = alertStatuses.includes(status);
  const isWarn  = warnStatuses.includes(status);
  const isOk    = okStatuses.includes(status);
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{
        background: isAlert ? "var(--portal-stop-tint)"
          : isWarn ? "var(--portal-warn-tint, rgba(180,90,30,0.12))"
          : isOk    ? "var(--portal-positive-tint, rgba(47,107,79,0.1))"
          : "var(--portal-border)",
        color: isAlert ? "var(--portal-stop)"
          : isWarn ? "var(--portal-warn)"
          : isOk   ? "var(--portal-positive)"
          : "var(--portal-text-faint)",
      }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Skeleton({ h = 4, w = "full" }: { h?: number; w?: string }) {
  return <div className={`h-${h} w-${w} rounded animate-pulse`} style={{ background: "var(--portal-border)" }} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, loading, alert }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  loading?: boolean; alert?: boolean;
}) {
  return (
    <div className="rounded-xl p-5 hover:-translate-y-0.5 transition-all"
      style={{
        background: "var(--portal-surface)",
        border: `1px solid ${alert ? "var(--portal-stop)" : "var(--portal-border)"}`,
        boxShadow: "var(--portal-shadow)",
      }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: alert ? "var(--portal-stop-tint)" : "var(--portal-accent-tint)" }}>
          <Icon className="w-5 h-5" style={{ color: alert ? "var(--portal-stop)" : "var(--portal-accent)" }} />
        </div>
        {alert && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--portal-stop)" }} />}
      </div>
      <div className="mt-4">
        {loading
          ? <><Skeleton h={6} /><div className="mt-1"><Skeleton h={3} w="2/3" /></div></>
          : <>
              <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>{value}</p>
              <p className="text-sm mt-0.5" style={{ color: "var(--portal-text-muted)" }}>{label}</p>
              {sub && <p className="text-xs mt-2 pt-2" style={{ color: "var(--portal-text-faint)", borderTop: "1px solid var(--portal-border-soft)" }}>{sub}</p>}
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
    <div className="rounded-xl p-6"
      style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", boxShadow: "var(--portal-shadow)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>Monthly Activity</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-faint)" }}>Orders & revenue · last 6 months</p>
        </div>
        <div className="flex gap-4 text-xs" style={{ color: "var(--portal-text-faint)" }}>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: "var(--portal-accent)" }} />Orders</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: "var(--portal-positive)" }} />Revenue</span>
        </div>
      </div>
      {loading ? (
        <div className="flex items-end gap-3 h-36">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1 items-center">
              <div className="w-full rounded animate-pulse" style={{ height: `${30 + i * 12}%`, background: "var(--portal-border)" }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3 h-36 mb-3">
            {rows.map(d => (
              <div key={d.month} className="flex-1 flex gap-0.5 items-end">
                <div className="flex-1 rounded-t transition-colors"
                  style={{ height: `${Math.max((d.orders / maxO) * 130, d.orders > 0 ? 4 : 2)}px`, background: "var(--portal-accent)" }}
                  title={`${d.orders} orders`} />
                <div className="flex-1 rounded-t transition-colors"
                  style={{ height: `${Math.max((d.revenue / maxR) * 130, d.revenue > 0 ? 4 : 2)}px`, background: "var(--portal-positive)" }}
                  title={fmtKsh(d.revenue)} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {rows.map(d => <div key={d.month} className="flex-1 text-center"><span className="text-[10px] font-medium" style={{ color: "var(--portal-text-faint)" }}>{d.month}</span></div>)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
function Pipeline({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const stages = [
    { label: "Draft",      val: stats?.draftOrders ?? 0,      pct: 0 },
    { label: "Pending",    val: stats?.pendingOrders ?? 0,    pct: 0 },
    { label: "Processing", val: stats?.processingOrders ?? 0, pct: 0 },
    { label: "Delivered",  val: stats?.deliveredOrders ?? 0,  pct: 0 },
  ];
  const total = Math.max(stages.reduce((a, s) => a + s.val, 0), 1);
  const STAGE_OPACITY = ["0.25", "0.5", "0.75", "1"];
  return (
    <div className="rounded-xl p-6"
      style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", boxShadow: "var(--portal-shadow)" }}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>Order Pipeline</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-faint)" }}>Status breakdown</p>
      </div>
      <div className="space-y-4">
        {stages.map((s, i) => {
          const pct = Math.round((s.val / total) * 100);
          return (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium" style={{ color: "var(--portal-text-muted)" }}>{s.label}</span>
                <span className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>{loading ? "—" : s.val}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--portal-border)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: loading ? "0%" : `${pct}%`,
                    background: `color-mix(in srgb, var(--portal-accent) ${Math.round(40 + i * 20)}%, transparent)`,
                    opacity: STAGE_OPACITY[i],
                  }} />
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
    <div className="rounded-xl overflow-hidden"
      style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", boxShadow: "var(--portal-shadow)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>{type === "invoice" ? "Recent Invoices" : "Recent Orders"}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-faint)" }}>Latest activity</p>
        </div>
        <Link href={type === "invoice" ? "/corporate/invoices" : "/corporate/orders"}
          className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--portal-accent)" }}>
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg animate-pulse shrink-0" style={{ background: "var(--portal-border)" }} />
              <div className="flex-1 space-y-2"><Skeleton /><Skeleton w="1/2" h={3} /></div>
              <div className="w-20 h-4 rounded animate-pulse" style={{ background: "var(--portal-border)" }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-10">
          {type === "invoice" ? <FileText className="w-7 h-7 mb-2" style={{ color: "var(--portal-text-faint)", opacity: 0.4 }} /> : <Package className="w-7 h-7 mb-2" style={{ color: "var(--portal-text-faint)", opacity: 0.4 }} />}
          <p className="text-sm" style={{ color: "var(--portal-text-muted)" }}>No {type === "invoice" ? "invoices" : "orders"} yet</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
          {items.map((item: any) => (
            <div key={item.id} className="px-5 py-3 flex items-center gap-3 transition-colors"
              style={{ cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--portal-accent-tint)")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)" }}>
                {type === "invoice"
                  ? <FileText className="w-4 h-4" style={{ color: "var(--portal-accent)" }} />
                  : <Package className="w-4 h-4" style={{ color: "var(--portal-accent)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--portal-text)" }}>
                  {type === "invoice" ? item.buyer_name : (item.company_name || item.sender_name)}
                </p>
                <p className="text-xs" style={{ color: "var(--portal-text-faint)" }}>
                  {type === "invoice" ? item.invoice_number : `${item.recipient_count} recipients`} · {fmtDate(item.created_at)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>
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
          { label: "Corp Orders",    value: s ? String(s.totalCorpOrders)   : "—", sub: `${s?.monthCorpOrders ?? 0} this month`, icon: Package,    alert: false },
          { label: "Revenue",        value: s ? fmtKsh(s.totalRevenuePaid)  : "—", sub: `${s?.unpaidInvoices ?? 0} unpaid`,       icon: DollarSign, alert: false },
          { label: "Pending Quotes", value: s ? String(s.pendingQuotes)     : "—", sub: `${s?.totalQuotes ?? 0} total`,           icon: Inbox,      alert: (s?.pendingQuotes ?? 0) > 0 },
          { label: "Corp Accounts",  value: s ? String(s.totalAccounts)    : "—", sub: `${s?.totalClients ?? 0} contacts`,       icon: Building2,  alert: false },
          { label: "Outstanding",    value: s ? fmtKsh(s.totalRevenueUnpaid): "—",sub: `${s?.overdueInvoices ?? 0} overdue`,     icon: CreditCard, alert: (s?.overdueInvoices ?? 0) > 0 },
          { label: "Active Pools",   value: s ? String(s.activePools)      : "—", sub: `${s?.totalPools ?? 0} total`,            icon: Target,     alert: false },
          { label: "Milestones",     value: s ? String(s.activeMilestones) : "—", sub: "Gifting automations on",                  icon: Zap,        alert: false },
          { label: "Draft Invoices", value: s ? String(s.draftInvoices)    : "—", sub: "Awaiting issue",                         icon: FileText,   alert: false },
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

      {/* Quick action tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { tab: "shop"       as Tab, icon: ShoppingBag, label: "Shop",        sub: "Browse corp catalog" },
          { tab: "hamper"     as Tab, icon: Gift,        label: "Build Hamper", sub: "Step-by-step builder" },
          { tab: "pools"      as Tab, icon: Target,      label: "Gift Pools",   sub: `${stats?.activePools ?? "—"} active` },
          { tab: "milestones" as Tab, icon: Zap,         label: "Milestones",   sub: "Auto-gift rules" },
        ].map(t => (
          <button key={t.tab} onClick={() => onTab(t.tab)}
            className="group flex flex-col gap-2 p-4 rounded-xl text-left transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--portal-surface)",
              border: "1px solid var(--portal-border)",
              boxShadow: "var(--portal-shadow)",
              color: "var(--portal-text)",
            }}>
            <t.icon className="w-5 h-5" style={{ color: "var(--portal-accent)" }} />
            <div>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>{t.sub}</p>
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
          { label: "Total",      val: stats?.totalCorpOrders ?? 0,  icon: Package     },
          { label: "Processing", val: stats?.processingOrders ?? 0, icon: Clock       },
          { label: "Delivered",  val: stats?.deliveredOrders ?? 0,  icon: CheckCircle },
          { label: "Draft",      val: stats?.draftOrders ?? 0,      icon: FileText    },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-5"
            style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", boxShadow: "var(--portal-shadow)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
              style={{ background: "var(--portal-accent-tint)" }}>
              <k.icon className="w-4 h-4" style={{ color: "var(--portal-accent)" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--portal-text)" }}>{loading ? "—" : k.val}</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--portal-text-muted)" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Status filter strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={statusFilter === s ? {
              background: "var(--portal-accent)",
              color: "var(--portal-accent-text)",
            } : {
              background: "var(--portal-surface)",
              border: "1px solid var(--portal-border)",
              color: "var(--portal-text-muted)",
            }}>
            {s === "all" ? "All" : STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <FeedTable items={stats?.recentOrders ?? []} type="order" loading={loading} />
      <div className="text-center">
        <Link href="/corporate/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", color: "var(--portal-text)" }}>
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
          { label: "Paid Revenue",  val: stats ? fmtKsh(stats.totalRevenuePaid)   : "—", icon: DollarSign,  alert: false },
          { label: "Outstanding",   val: stats ? fmtKsh(stats.totalRevenueUnpaid) : "—", icon: CreditCard,  alert: true  },
          { label: "Overdue",       val: stats ? String(stats.overdueInvoices)    : "—", icon: AlertCircle, alert: true  },
          { label: "Draft",         val: stats ? String(stats.draftInvoices)      : "—", icon: FileText,    alert: false },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-5"
            style={{
              background: "var(--portal-surface)",
              border: `1px solid ${k.alert ? "var(--portal-stop)" : "var(--portal-border)"}`,
              boxShadow: "var(--portal-shadow)",
            }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
              style={{ background: k.alert ? "var(--portal-stop-tint)" : "var(--portal-accent-tint)" }}>
              <k.icon className="w-4 h-4" style={{ color: k.alert ? "var(--portal-stop)" : "var(--portal-accent)" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--portal-text)" }}>{loading ? "—" : k.val}</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--portal-text-muted)" }}>{k.label}</p>
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
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)" }}>
        <Calendar className="w-6 h-6" style={{ color: "var(--portal-accent)" }} />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold" style={{ color: "var(--portal-text)" }}>Event Calendar</h3>
        <p className="text-sm mt-1 max-w-xs" style={{ color: "var(--portal-text-muted)" }}>Schedule bulk dispatches around key dates — end-of-year, national holidays, client birthdays.</p>
      </div>
      <Link href="/corporate/calendar"
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}>
        <Plus className="w-4 h-4" /> Schedule Event
      </Link>
    </div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────
function DashboardContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as Tab | null;

  const isValidTab = (t: string | null): t is Tab => {
    return NAV.some(n => n.key === t);
  };

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (queryTab && isValidTab(queryTab)) return queryTab;
    return "overview";
  });

  const [activeHub, setActiveHub] = useState<"workspace" | "ops" | "settings">(() => {
    const item = NAV.find(n => n.key === (queryTab && isValidTab(queryTab) ? queryTab : "overview"));
    return item?.group || "workspace";
  });

  // Sync tab from URL if user navigates back/forward or deep links
  useEffect(() => {
    if (queryTab && isValidTab(queryTab) && queryTab !== activeTab) {
      setActiveTab(queryTab);
      const item = NAV.find(n => n.key === queryTab);
      if (item) setActiveHub(item.group);
    }
  }, [queryTab]);

  const switchTab = (t: Tab) => {
    setActiveTab(t);
    const item = NAV.find(n => n.key === t);
    if (item) setActiveHub(item.group);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", t);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const [stats, setStats]     = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset]   = useState("safaricom");

  const refresh = useCallback(async (selectedPreset?: string) => {
    setLoading(true);
    try {
      const p = selectedPreset ?? preset;
      const r = await fetch(`/api/corporate/stats?preset=${p}`);
      if (r.ok) setStats(await r.json());
    } catch {}
    setLoading(false);
  }, [preset]);

  const handleSelectPreset = (p: string) => {
    setPreset(p);
    refresh(p);
  };

  useEffect(() => { refresh(); }, [refresh]);

  const alertCount = (stats?.pendingQuotes ?? 0) + (stats?.overdueInvoices ?? 0);

  // Group nav items
  const workspaceTabs = NAV.filter(n => n.group === "workspace");
  const opsTabs       = NAV.filter(n => n.group === "ops");
  const settingsTabs  = NAV.filter(n => n.group === "settings");

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="corporate-portal min-h-screen font-sans flex relative">

      {/* First-visit welcome overlay — mounts client-side only (ssr:false) */}
      <WelcomeOnboarding onNavigate={(tab) => switchTab(tab as Tab)} />

      {/* ─────────────────────────────────────────────────────────────────────
          SIDEBAR — desktop only, sticky, full height
          HCI: persistent navigation = always-visible orientation cue.
          Real logo anchors the brand; back-to-store at bottom uses
          consistent icon+label pattern so it reads as a nav item, not
          an escape button.
      ───────────────────────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto"
        style={{
          background: "var(--portal-header-bg)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          borderRight: "1px solid var(--portal-border)",
        }}
      >
        {/* ── Logo + brand ── */}
        <div className="px-4 py-4 shrink-0" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 shrink-0">
              <Image src="/logo/logo.webp" alt="TouchGift" fill sizes="36px"
                className="rounded-xl object-cover" priority
                style={{ boxShadow: "0 0 0 1px var(--portal-border)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate" style={{ color: "var(--portal-text)" }}>TouchGift</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--portal-accent)" }}>Corporate Dashboard</p>
            </div>
          </div>
        </div>

        {/* ── Alert strip ── */}
        {alertCount > 0 && (
          <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--portal-stop-tint)", border: "1px solid var(--portal-stop)" }}>
            <Bell className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--portal-stop)" }} />
            <span className="text-xs font-semibold truncate" style={{ color: "var(--portal-stop)" }}>{alertCount} action{alertCount > 1 ? "s" : ""} pending</span>
          </div>
        )}

        {/* ── Nav groups ── */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Corporate portal navigation">
          {[
            { label: "Workspace", tabs: workspaceTabs },
            { label: "Operations", tabs: opsTabs },
            { label: "Settings", tabs: settingsTabs },
          ].map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: "var(--portal-text-faint)" }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.tabs.map(n => {
                  const active = activeTab === n.key;
                  const badge = n.key === "quotes" ? (stats?.pendingQuotes ?? 0) : n.key === "invoices" ? (stats?.overdueInvoices ?? 0) : 0;
                  return (
                    <button key={n.key} onClick={() => switchTab(n.key)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all"
                      style={active ? {
                        background: "var(--portal-accent-tint)",
                        color: "var(--portal-accent)",
                        fontWeight: 600,
                        border: "1px solid var(--portal-accent-tint)",
                      } : {
                        color: "var(--portal-text-muted)",
                        border: "1px solid transparent",
                      }}
                    >
                      <n.icon className="w-4 h-4 shrink-0" style={{ color: active ? "var(--portal-accent)" : "var(--portal-text-faint)" }} />
                      <span className="flex-1 truncate">{n.label}</span>
                      {badge > 0 && (
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ background: "var(--portal-stop-tint)", color: "var(--portal-stop)" }}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom: theme toggle + refresh + back ── */}
        <div className="px-3 pb-4 pt-3 shrink-0 space-y-1" style={{ borderTop: "1px solid var(--portal-border-soft)" }}>
          {/* Dark / Light toggle */}
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: "var(--portal-text-muted)" }}
          >
            {isDark
              ? <Sun className="w-4 h-4 shrink-0" style={{ color: "var(--portal-warn)" }} />
              : <Moon className="w-4 h-4 shrink-0" style={{ color: "var(--portal-accent)" }} />
            }
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
            <div className="ml-auto w-8 h-4.5 rounded-full flex items-center px-0.5 transition-colors"
              style={{ background: isDark ? "var(--portal-accent)" : "var(--portal-border)", position: "relative", width: 32, height: 18 }}>
              <div className="w-3.5 h-3.5 rounded-full bg-white transition-transform"
                style={{ transform: isDark ? "translateX(14px)" : "translateX(0px)", width: 14, height: 14 }} />
            </div>
          </button>
          <button onClick={() => refresh()} disabled={loading}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
            style={{ color: "var(--portal-text-muted)" }}
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh data</span>
          </button>
          <Link href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group"
            style={{ color: "var(--portal-text-muted)" }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Back to Main Store</span>
          </Link>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────────
          CONTENT AREA
      ───────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 shrink-0"
          role="banner"
          style={{
            background: "var(--portal-header-bg)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            borderBottom: "1px solid var(--portal-border)",
          }}
        >
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">

            {/* Mobile: logo + hamburger */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <button onClick={() => setMobileNavOpen(v => !v)} aria-label="Open navigation"
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ border: "1px solid var(--portal-border)", background: "var(--portal-accent-tint)" }}>
                <svg className="w-4 h-4" style={{ color: "var(--portal-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="relative w-7 h-7">
                <Image src="/logo/logo.webp" alt="TouchGift" fill sizes="28px" className="rounded-lg object-cover" />
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>Corporate</span>
            </div>

            {/* Desktop: breadcrumb */}
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1.5 text-sm">
              <Link href="/" className="flex items-center gap-1 transition-colors" style={{ color: "var(--portal-text-faint)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--portal-border)" }} />
              <span style={{ color: "var(--portal-text-muted)" }}>Corporate</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--portal-border)" }} />
              <span className="font-semibold" style={{ color: "var(--portal-text)" }}>{NAV.find(n => n.key === activeTab)?.label}</span>
            </nav>

            <div className="flex-1" />

            {/* Right cluster */}
            <div className="flex items-center gap-2">

              {/* Alert badge */}
              {alertCount > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{ background: "var(--portal-stop-tint)", border: "1px solid var(--portal-stop)" }}>
                  <Bell className="w-3.5 h-3.5" style={{ color: "var(--portal-stop)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--portal-stop)" }}>{alertCount}</span>
                </div>
              )}

              {/* Shop */}
              <button onClick={() => switchTab("shop")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px]"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-accent)" }}>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop</span>
              </button>

              {/* Build Hamper — primary CTA */}
              <button onClick={() => switchTab("hamper")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px]"
                style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}>
                <Gift className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Build Hamper</span>
              </button>

              {/* Dark / Light mode toggle */}
              <button onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Light mode" : "Dark mode"}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)" }}>
                {isDark
                  ? <Sun className="w-4 h-4" style={{ color: "var(--portal-warn)" }} />
                  : <Moon className="w-4 h-4" style={{ color: "var(--portal-accent)" }} />
                }
              </button>

              {/* Back to store */}
              <Link href="/"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ border: "1px solid var(--portal-border)", color: "var(--portal-text-muted)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Store
              </Link>
            </div>
          </div>

          {/* ── Mobile Hub Switcher (3 clear ergonomic sections) ── */}
          <div className="lg:hidden px-3 pt-2 pb-1 bg-gray-50/80 dark:bg-zinc-900/60 border-t border-b border-gray-200/50 dark:border-zinc-800/80 flex items-center gap-1">
            {[
              { id: "workspace" as const, label: "Workspace" },
              { id: "ops" as const,       label: "Operations" },
              { id: "settings" as const,  label: "Automations" },
            ].map(hub => {
              const isCurrentHub = activeHub === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => {
                    setActiveHub(hub.id);
                    const hubTabs = NAV.filter(n => n.group === hub.id);
                    if (!hubTabs.some(n => n.key === activeTab)) {
                      switchTab(hubTabs[0].key);
                    }
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center min-h-[36px] ${
                    isCurrentHub
                      ? "bg-brand text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {hub.label}
                </button>
              );
            })}
          </div>

          {/* ── Mobile Tab Scroll Strip (Scoped to Active Hub) ── */}
          <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 overflow-x-auto hide-scrollbar">
            {NAV.filter(n => n.group === activeHub).map(n => {
              const active = activeTab === n.key;
              const badge = n.key === "quotes" ? (stats?.pendingQuotes ?? 0) : n.key === "invoices" ? (stats?.overdueInvoices ?? 0) : 0;
              return (
                <button
                  key={n.key}
                  onClick={() => switchTab(n.key)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px]"
                  style={active ? {
                    background: "var(--portal-accent)",
                    color: "var(--portal-accent-text)",
                    boxShadow: "0 2px 8px rgba(155, 27, 90, 0.25)"
                  } : {
                    background: "var(--portal-surface)",
                    border: "1px solid var(--portal-border)",
                    color: "var(--portal-text-muted)"
                  }}
                >
                  <n.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{n.label}</span>
                  {badge > 0 && (
                    <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-red-600 text-white shrink-0">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* ── Mobile Nav Drawer (Full Portal Portal Stacking) ── */}
        {mobileNavOpen && typeof document !== "undefined" && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Corporate Portal Navigation"
            className="fixed inset-0 z-[999] flex justify-start bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileNavOpen(false)}
          >
            <div
              className="relative w-full max-w-[320px] bg-white dark:bg-[#11111a] h-full shadow-2xl flex flex-col overflow-hidden border-r border-gray-200 dark:border-zinc-800 animate-in slide-in-from-left duration-300"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image src="/logo/logo.webp" alt="TouchGift" fill sizes="32px" className="rounded-lg object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">TouchGift</p>
                    <p className="text-[10px] text-brand dark:text-brand-light font-bold uppercase tracking-wider">Corporate Hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Sections */}
              <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Corporate sections">
                {[
                  { label: "Workspace & Gifting", tabs: workspaceTabs },
                  { label: "Procurement & Ops", tabs: opsTabs },
                  { label: "Automations & Admin", tabs: settingsTabs },
                ].map(g => (
                  <div key={g.label}>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-2 mb-2">{g.label}</p>
                    <div className="space-y-1">
                      {g.tabs.map(n => {
                        const active = activeTab === n.key;
                        const badge = n.key === "quotes" ? (stats?.pendingQuotes ?? 0) : n.key === "invoices" ? (stats?.overdueInvoices ?? 0) : 0;
                        return (
                          <button
                            key={n.key}
                            onClick={() => { switchTab(n.key); setMobileNavOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all min-h-[44px]"
                            style={active ? {
                              background: "var(--portal-accent-tint)",
                              color: "var(--portal-accent)",
                              fontWeight: 700,
                              border: "1px solid var(--portal-accent-tint)",
                            } : {
                              color: "var(--portal-text-muted)",
                              border: "1px solid transparent",
                            }}
                          >
                            <n.icon className="w-4 h-4 shrink-0" style={{ color: active ? "var(--portal-accent)" : "var(--portal-text-faint)" }} />
                            <span className="flex-1 truncate">{n.label}</span>
                            {badge > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shrink-0">
                                {badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Ecosystem Links */}
                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest px-2 mb-2">Corporate Ecosystem</p>
                  <div className="space-y-1">
                    <Link
                      href="/corporate/showroom"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-all min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>360° Showroom</span>
                    </Link>
                    <Link
                      href="/corporate/catalog"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-all min-h-[44px]"
                    >
                      <Package className="w-4 h-4 text-brand dark:text-brand-light shrink-0" />
                      <span>Corporate Catalog</span>
                    </Link>
                    <Link
                      href="/corporate/whitelabel"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-all min-h-[44px]"
                    >
                      <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Agency White-Label</span>
                    </Link>
                  </div>
                </div>
              </nav>

              {/* Drawer Footer with Back to Store & Theme */}
              <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand" />}
                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{theme}</span>
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-all min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Exit to Main Consumer Shop</span>
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── Tab content (with bottom safe clearance for CorporateBottomNav) ── */}
        <main className="flex-1 p-4 sm:p-6 pb-36 md:pb-12 max-w-screen-xl w-full mx-auto" id="corp-main-content">
          {activeTab === "overview" && (
            <>
              {/* QuickStart shown when account has no orders yet */}
              {!loading && (stats?.totalCorpOrders ?? 0) === 0 && (
                <QuickStartBanner onNavigate={(tab) => switchTab(tab as Tab)} />
              )}
              <ControlRoomOverview
                stats={stats}
                loading={loading}
                onNavigateTab={switchTab}
                onSelectPreset={handleSelectPreset}
              />
              {/* Historical Trend & Pipeline Velocity */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--portal-border-soft)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>
                      Historical Trend & Pipeline Velocity
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                      6-month corporate dispatches vs revenue collection
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <MonthlyChart data={stats?.monthlyActivity ?? []} loading={loading} />
                  </div>
                  <Pipeline stats={stats} loading={loading} />
                </div>
              </div>
            </>
          )}
          {activeTab === "shop"        && <ShopTab />}
          {activeTab === "hamper"      && <HamperBuilderTab />}
          {activeTab === "giftcards"   && <GiftCardsTab />}
          {activeTab === "pools"       && <GiftPoolsTab />}
          {activeTab === "orders"      && <OrdersTab stats={stats} loading={loading} />}
          {activeTab === "invoices"    && <InvoicesTab stats={stats} loading={loading} />}
          {activeTab === "quotes"      && <QuoteOpsPanel initialPending={stats?.pendingQuotes ?? 0} />}
          {activeTab === "clients"     && <ClientsTab />}
          {activeTab === "milestones"  && <MilestonesTab />}
          {(activeTab as string) === "calendar" && <CalendarTab />}
          {activeTab === "portal"      && <PortalSettingsTab />}
        </main>
      </div>
    </div>
  );
}

export default function CorporateDashboard() {
  return (
    <Suspense fallback={<TabLoader />}>
      <DashboardContent />
    </Suspense>
  );
}
