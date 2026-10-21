"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Inbox, Users, Gift, TrendingUp,
  Calendar, Settings, ChevronRight, RefreshCw, ArrowUp, ArrowDown,
  Building2, Package, DollarSign, Target, Clock, CheckCircle,
  AlertCircle, Plus, Zap, CreditCard, Bell, ShoppingBag, Loader2,
  MoreHorizontal, ChevronDown, Filter, Search,
} from "lucide-react";
import QuoteOpsPanel from "@/components/corporate/QuoteOpsPanel";
import PortalAccessPanel from "@/components/corporate/PortalAccessPanel";
import InvoiceOpsPanel from "@/components/corporate/InvoiceOpsPanel";

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

const NAV = [
  { key: "overview",   label: "Overview",    icon: LayoutDashboard },
  { key: "orders",     label: "Orders",      icon: Package },
  { key: "invoices",   label: "Invoices",    icon: FileText },
  { key: "quotes",     label: "Quotes",      icon: Inbox },
  { key: "clients",    label: "Clients",     icon: Users },
  { key: "pools",      label: "Gift Pools",  icon: Gift },
  { key: "milestones", label: "Milestones",  icon: TrendingUp },
  { key: "calendar",   label: "Calendar",    icon: Calendar },
  { key: "portal",     label: "Portal",      icon: Settings },
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
  draft:           "bg-gray-100 text-gray-500",
  pending_payment: "bg-amber-50 text-amber-700",
  processing:      "bg-blue-50 text-blue-700",
  wrapped:         "bg-indigo-50 text-indigo-700",
  dispatched:      "bg-orange-50 text-orange-700",
  delivered:       "bg-green-50 text-green-700",
  cancelled:       "bg-red-50 text-red-600",
  paid:            "bg-green-50 text-green-700",
  unpaid:          "bg-amber-50 text-amber-700",
  overdue:         "bg-red-50 text-red-600",
  voided:          "bg-red-50 text-red-600",
  credited:        "bg-blue-50 text-blue-700",
  pending:         "bg-amber-50 text-amber-700",
  quoted:          "bg-blue-50 text-blue-700",
  accepted:        "bg-green-50 text-green-700",
  declined:        "bg-red-50 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
  draft:"Draft", pending_payment:"Pending", processing:"Processing",
  wrapped:"Wrapping", dispatched:"Dispatched", delivered:"Delivered",
  cancelled:"Cancelled", paid:"Paid", unpaid:"Unpaid", overdue:"Overdue",
  voided:"Voided", credited:"Credited", pending:"Pending",
  quoted:"Quoted", accepted:"Accepted", declined:"Declined",
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
function KpiCard({ label, value, sub, delta, icon: Icon, iconBg, loading }: {
  label: string; value: string; sub?: string; delta?: { n: number; label: string };
  icon: React.ComponentType<{ className?: string }>; iconBg: string; loading?: boolean;
}) {
  const up = (delta?.n ?? 0) >= 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && !loading && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
            {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(delta.n)}% {delta.label}
          </div>
        )}
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

// ─── Bar chart (monthly) ──────────────────────────────────────────────────────
function MonthlyChart({ data, loading }: { data: Stats["monthlyActivity"]; loading: boolean }) {
  const maxO = Math.max(...data.map(d => d.orders), 1);
  const maxR = Math.max(...data.map(d => d.revenue), 1);
  const rows = data.length
    ? data
    : Array.from({ length: 6 }, (_, i) => ({ month: ["May","Jun","Jul","Aug","Sep","Oct"][i], orders: 0, revenue: 0 }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Monthly Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Orders &amp; revenue · last 6 months</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-amber-500 inline-block" />Orders</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-green-500 inline-block" />Revenue</span>
        </div>
      </div>
      {loading ? (
        <div className="flex items-end gap-3 h-40">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="flex-1 flex flex-col gap-1 items-center">
              <div className="w-full bg-gray-100 rounded animate-pulse" style={{height:`${30+i*12}%`}} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3 h-40 mb-3">
            {rows.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex gap-0.5 items-end">
                  <div
                    className="flex-1 bg-amber-400 hover:bg-amber-500 rounded-t transition-colors cursor-pointer"
                    style={{ height: `${Math.max((d.orders / maxO) * 144, d.orders > 0 ? 6 : 2)}px` }}
                    title={`${d.orders} orders`}
                  />
                  <div
                    className="flex-1 bg-green-400 hover:bg-green-500 rounded-t transition-colors cursor-pointer"
                    style={{ height: `${Math.max((d.revenue / maxR) * 144, d.revenue > 0 ? 6 : 2)}px` }}
                    title={fmtKsh(d.revenue)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {rows.map(d => (
              <div key={d.month} className="flex-1 text-center">
                <span className="text-[10px] text-gray-400 font-medium">{d.month}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pipeline widget ──────────────────────────────────────────────────────────
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
          <p className="text-xs text-gray-400 mt-0.5">Current status breakdown</p>
        </div>
        <Link href="/corporate/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          All orders <ChevronRight className="w-3.5 h-3.5" />
        </Link>
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
                <div className={`h-full ${s.color} rounded-full transition-all duration-500`}
                  style={{ width: loading ? "0%" : `${pct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 text-right">{loading?"—":`${pct}%`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent invoices table ────────────────────────────────────────────────────
function InvoicesTable({ items, loading }: { items: RecentInvoice[]; loading: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest billing activity</p>
        </div>
        <Link href="/corporate/invoices" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="divide-y divide-gray-50">
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton /><Skeleton w="1/2" h={3} /></div>
              <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <FileText className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">No invoices yet</p>
          <p className="text-xs mt-1">Invoices will appear here once created</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map(inv => (
            <div key={inv.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{inv.buyer_name}</p>
                <p className="text-xs text-gray-400">{inv.invoice_number} · {fmtDate(inv.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">KES {Number(inv.total_amount).toLocaleString()}</p>
                <Badge status={inv.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recent orders table ──────────────────────────────────────────────────────
function OrdersTable({ items, loading }: { items: RecentOrder[]; loading: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest corporate orders</p>
        </div>
        <Link href="/corporate/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="divide-y divide-gray-50">
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton /><Skeleton w="1/2" h={3} /></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Package className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">No orders yet</p>
          <p className="text-xs mt-1">Corporate orders will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map(o => (
            <div key={o.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{o.company_name || o.sender_name}</p>
                <p className="text-xs text-gray-400">{o.recipient_count} recipients · {fmtDate(o.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">KES {Number(o.subtotal).toLocaleString()}</p>
                <Badge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const s = stats;
  const kpis = [
    {
      label: "Corporate Orders", value: s ? String(s.totalCorpOrders) : "—",
      sub: `${s?.monthCorpOrders ?? 0} placed this month`,
      icon: Package, iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Revenue Collected", value: s ? fmtKsh(s.totalRevenuePaid) : "—",
      sub: `${s?.unpaidInvoices ?? 0} unpaid invoices`,
      icon: DollarSign, iconBg: "bg-green-50 text-green-600",
    },
    {
      label: "Pending Quotes", value: s ? String(s.pendingQuotes) : "—",
      sub: `${s?.totalQuotes ?? 0} total received`,
      icon: Inbox, iconBg: s?.pendingQuotes ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400",
    },
    {
      label: "Corp Accounts", value: s ? String(s.totalAccounts) : "—",
      sub: `${s?.totalClients ?? 0} registered contacts`,
      icon: Building2, iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Outstanding", value: s ? fmtKsh(s.totalRevenueUnpaid) : "—",
      sub: `${s?.overdueInvoices ?? 0} overdue`,
      icon: CreditCard, iconBg: s?.overdueInvoices ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400",
    },
    {
      label: "Active Pools", value: s ? String(s.activePools) : "—",
      sub: `${s?.totalPools ?? 0} total`,
      icon: Target, iconBg: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Milestones On", value: s ? String(s.activeMilestones) : "—",
      sub: "Gift automations running",
      icon: Zap, iconBg: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Draft Invoices", value: s ? String(s.draftInvoices) : "—",
      sub: "Awaiting issue",
      icon: FileText, iconBg: "bg-gray-50 text-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} loading={loading} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyChart data={stats?.monthlyActivity ?? []} loading={loading} />
        </div>
        <Pipeline stats={stats} loading={loading} />
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InvoicesTable items={stats?.recentInvoices ?? []} loading={loading} />
        <OrdersTable items={stats?.recentOrders ?? []} loading={loading} />
      </div>

      {/* Quick action tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/corporate/orders/new", icon: Plus,      label: "New Order",        sub: "Build bulk hamper",        color: "border-amber-200 bg-amber-50 text-amber-700" },
          { href: "/corporate/catalog",   icon: ShoppingBag,label: "Branding Catalog",  sub: "170+ customisable items",  color: "border-blue-200 bg-blue-50 text-blue-700" },
          { href: "/corporate/pools",     icon: Target,     label: "Gift Pools",         sub: `${stats?.activePools ?? "—"} active`, color: "border-indigo-200 bg-indigo-50 text-indigo-700" },
          { href: "/corporate/milestones",icon: Zap,        label: "Milestones",         sub: "Gifting automations",       color: "border-yellow-200 bg-yellow-50 text-yellow-700" },
        ].map(t => (
          <Link key={t.href} href={t.href}
            className={`group flex flex-col gap-2 p-4 rounded-lg border ${t.color} hover:shadow-sm transition-all`}>
            <t.icon className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{t.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────
function OrdersTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const counts = [
    { label: "Total",      val: stats?.totalCorpOrders ?? 0,   color: "border-gray-200",   iconBg: "bg-gray-50 text-gray-500",   icon: Package },
    { label: "Draft",      val: stats?.draftOrders ?? 0,       color: "border-gray-200",   iconBg: "bg-gray-50 text-gray-400",   icon: FileText },
    { label: "Processing", val: stats?.processingOrders ?? 0,  color: "border-blue-200",   iconBg: "bg-blue-50 text-blue-600",   icon: Clock },
    { label: "Delivered",  val: stats?.deliveredOrders ?? 0,   color: "border-green-200",  iconBg: "bg-green-50 text-green-600", icon: CheckCircle },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {counts.map(c => (
          <div key={c.label} className={`bg-white border ${c.color} rounded-lg p-5`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${c.iconBg}`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.val}</p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
      <OrdersTable items={stats?.recentOrders ?? []} loading={loading} />
    </div>
  );
}

// ─── Invoices tab ─────────────────────────────────────────────────────────────
function InvoicesTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const counts = [
    { label: "Paid Revenue",  val: stats ? fmtKsh(stats.totalRevenuePaid)   : "—", color: "border-green-200",  iconBg: "bg-green-50 text-green-600",  icon: DollarSign },
    { label: "Outstanding",   val: stats ? fmtKsh(stats.totalRevenueUnpaid) : "—", color: "border-amber-200",  iconBg: "bg-amber-50 text-amber-600",  icon: CreditCard },
    { label: "Overdue",       val: stats ? String(stats.overdueInvoices)    : "—", color: "border-red-200",    iconBg: "bg-red-50 text-red-500",      icon: AlertCircle },
    { label: "Draft",         val: stats ? String(stats.draftInvoices)      : "—", color: "border-gray-200",   iconBg: "bg-gray-50 text-gray-400",    icon: FileText },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {counts.map(c => (
          <div key={c.label} className={`bg-white border ${c.color} rounded-lg p-5`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${c.iconBg}`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.val}</p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
      <InvoiceOpsPanel />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ title, icon: Icon, desc, cta, ctaHref }: {
  title: string; icon: React.ComponentType<{ className?: string }>;
  desc: string; cta?: string; ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">{desc}</p>
      </div>
      {cta && ctaHref && (
        <Link href={ctaHref}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> {cta}
        </Link>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  return (
    // Light page background — the key change from dark-neon
    <div className="min-h-screen bg-gray-50 font-sans flex">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen">
        {/* Brand header */}
        <div className="px-4 py-5 border-b border-gray-100">
          <Link href="/corporate" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Corporate</p>
              <p className="text-[10px] text-gray-400 mt-0.5">TouchGift B2B</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 mb-2">Main</p>
          {NAV.map(n => {
            const active = activeTab === n.key;
            const badge =
              n.key === "quotes"   ? (stats?.pendingQuotes ?? 0) :
              n.key === "invoices" ? (stats?.overdueInvoices ?? 0) : 0;
            return (
              <button key={n.key} onClick={() => setActiveTab(n.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all group ${
                  active
                    ? "bg-amber-50 text-amber-700 font-semibold border border-amber-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                <n.icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                <span className="flex-1">{n.label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          {[
            { href: "/corporate/catalog", icon: ShoppingBag, label: "Catalog" },
            { href: "/",                  icon: Building2,   label: "Main Store" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all">
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4">
          {/* Mobile tabs */}
          <div className="lg:hidden flex items-center gap-1 flex-1 overflow-x-auto">
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
            <span className="font-semibold text-gray-800 capitalize">{NAV.find(n => n.key === activeTab)?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
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
            <Link href="/corporate/orders/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:block">New Order</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-6 max-w-screen-xl w-full mx-auto">
          {activeTab === "overview"   && <OverviewTab stats={stats} loading={loading} />}
          {activeTab === "orders"     && <OrdersTab stats={stats} loading={loading} />}
          {activeTab === "invoices"   && <InvoicesTab stats={stats} loading={loading} />}
          {activeTab === "quotes"     && <QuoteOpsPanel initialPending={stats?.pendingQuotes ?? 0} />}
          {activeTab === "clients"    && <EmptyState title="Client Management" icon={Users} desc="Manage corporate accounts, contacts, and gifting histories." cta="Add Client" ctaHref="/corporate/clients/new" />}
          {activeTab === "pools"      && <EmptyState title="Gift Pools" icon={Gift} desc={`${stats?.activePools ?? 0} active pools — group contributions and recipient deliveries.`} cta="Create Pool" ctaHref="/corporate/pools/new" />}
          {activeTab === "milestones" && <EmptyState title="Gifting Milestones" icon={TrendingUp} desc={`${stats?.activeMilestones ?? 0} active rules — trigger gifts on birthdays, workiversaries, and spend thresholds.`} cta="New Rule" ctaHref="/corporate/milestones" />}
          {activeTab === "calendar"   && <EmptyState title="Event Calendar" icon={Calendar} desc="Schedule bulk dispatches around key dates — end-of-year, national holidays, client birthdays." cta="Schedule Event" ctaHref="/corporate/calendar" />}
          {activeTab === "portal"     && <div className="max-w-lg"><PortalAccessPanel /></div>}
        </main>
      </div>
    </div>
  );
}
