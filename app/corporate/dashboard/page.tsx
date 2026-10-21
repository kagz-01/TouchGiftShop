"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Inbox, Users, Gift, TrendingUp,
  Calendar, Settings, ChevronRight, RefreshCw, ArrowUpRight,
  ArrowDownRight, Building2, Package, DollarSign, Target,
  Clock, CheckCircle, AlertCircle, Loader2, Plus, Zap,
  CreditCard, Bell, ShoppingBag, Star,
} from "lucide-react";
import QuoteOpsPanel from "@/components/corporate/QuoteOpsPanel";
import PortalAccessPanel from "@/components/corporate/PortalAccessPanel";
import InvoiceOpsPanel from "@/components/corporate/InvoiceOpsPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalCorpOrders: number;
  monthCorpOrders: number;
  draftOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalRevenuePaid: number;
  totalRevenueUnpaid: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  totalAccounts: number;
  totalClients: number;
  pendingQuotes: number;
  quotedQuotes: number;
  totalQuotes: number;
  activePools: number;
  totalPools: number;
  activeMilestones: number;
  monthlyActivity: { month: string; orders: number; revenue: number }[];
  recentInvoices: RecentInvoice[];
  recentOrders: RecentOrder[];
}

interface RecentInvoice {
  id: string;
  invoice_number: string;
  buyer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  due_at: string | null;
}

interface RecentOrder {
  id: string;
  company_name: string | null;
  sender_name: string;
  status: string;
  recipient_count: number;
  subtotal: number;
  created_at: string;
}

// ─── Nav tabs ─────────────────────────────────────────────────────────────────
const NAV = [
  { key: "overview",   label: "Overview",     icon: LayoutDashboard },
  { key: "orders",     label: "Orders",       icon: Package },
  { key: "invoices",   label: "Invoices",     icon: FileText },
  { key: "quotes",     label: "Quotes",       icon: Inbox },
  { key: "clients",    label: "Clients",      icon: Users },
  { key: "pools",      label: "Gift Pools",   icon: Gift },
  { key: "milestones", label: "Milestones",   icon: TrendingUp },
  { key: "calendar",   label: "Calendar",     icon: Calendar },
  { key: "portal",     label: "Portal",       icon: Settings },
] as const;
type Tab = typeof NAV[number]["key"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ksh(n: number) {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n.toLocaleString()}`;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:           { label: "Draft",      cls: "bg-white/5 text-white/40" },
  pending_payment: { label: "Pending",    cls: "bg-amber-500/10 text-amber-400" },
  processing:      { label: "Processing", cls: "bg-blue-500/10 text-blue-400" },
  wrapped:         { label: "Wrapping",   cls: "bg-violet-500/10 text-violet-400" },
  dispatched:      { label: "Dispatched", cls: "bg-orange-500/10 text-orange-400" },
  delivered:       { label: "Delivered",  cls: "bg-emerald-500/10 text-emerald-400" },
  cancelled:       { label: "Cancelled",  cls: "bg-red-500/10 text-red-400" },
  paid:            { label: "Paid",       cls: "bg-emerald-500/10 text-emerald-400" },
  unpaid:          { label: "Unpaid",     cls: "bg-amber-500/10 text-amber-400" },
  overdue:         { label: "Overdue",    cls: "bg-red-500/10 text-red-400" },
  voided:          { label: "Voided",     cls: "bg-red-500/10 text-red-400" },
  credited:        { label: "Credited",   cls: "bg-blue-500/10 text-blue-400" },
  pending:         { label: "Pending",    cls: "bg-amber-500/10 text-amber-400" },
  quoted:          { label: "Quoted",     cls: "bg-blue-500/10 text-blue-400" },
  accepted:        { label: "Accepted",   cls: "bg-emerald-500/10 text-emerald-400" },
  declined:        { label: "Declined",   cls: "bg-red-500/10 text-red-400" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_MAP[status] ?? { label: status, cls: "bg-white/5 text-white/40" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${c.cls}`}>
      {c.label}
    </span>
  );
}

function Skel({ w = "full" }: { w?: string }) {
  return <div className={`h-4 w-${w} bg-white/5 rounded-lg animate-pulse`} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, icon: Icon, accent, loading }: {
  label: string; value: string; sub?: string; trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>; accent: string; loading?: boolean;
}) {
  return (
    <div className="bg-[#12121E] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && !loading && (
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${trend === "up" ? "bg-emerald-500/10" : trend === "down" ? "bg-red-500/10" : "bg-white/5"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> :
             trend === "down" ? <ArrowDownRight className="w-3.5 h-3.5 text-red-400" /> : null}
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2"><Skel /><Skel w="2/3" /></div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
            <p className="text-[11px] text-white/40 mt-1">{label}</p>
          </div>
          {sub && <p className="text-[10px] text-white/25 border-t border-white/5 pt-2">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ─── Activity chart ───────────────────────────────────────────────────────────
function ActivityChart({ data, loading }: { data: Stats["monthlyActivity"]; loading: boolean }) {
  const maxO = Math.max(...data.map(d => d.orders), 1);
  const maxR = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="bg-[#12121E] border border-white/8 rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-white">Monthly Activity</h3>
          <p className="text-[11px] text-white/40 mt-0.5">Last 6 months</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-400" />Orders</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-400" />Revenue</span>
        </div>
      </div>
      {loading ? (
        <div className="flex items-end gap-3 h-36">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="flex-1 flex flex-col gap-1 items-center">
              <div className="w-full bg-white/5 rounded animate-pulse" style={{height:`${30+i*12}%`}} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-2 h-36 mb-2">
          {(data.length ? data : Array.from({length:6},(_,i)=>({month:["May","Jun","Jul","Aug","Sep","Oct"][i],orders:0,revenue:0}))).map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end">
                <div className="flex-1 bg-amber-400/70 hover:bg-amber-400 rounded-t-sm transition-all cursor-pointer"
                  style={{height: `${Math.max((d.orders/maxO)*130, d.orders>0?6:2)}px`}} title={`${d.orders} orders`} />
                <div className="flex-1 bg-emerald-400/70 hover:bg-emerald-400 rounded-t-sm transition-all cursor-pointer"
                  style={{height: `${Math.max((d.revenue/maxR)*130, d.revenue>0?6:2)}px`}} title={ksh(d.revenue)} />
              </div>
              <span className="text-[9px] text-white/25">{d.month}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pipeline funnel ──────────────────────────────────────────────────────────
function PipelineChart({ stats, loading }: { stats: Stats|null; loading: boolean }) {
  const stages = [
    { label: "Draft",       val: stats?.draftOrders ?? 0,      bar: "bg-white/20",   text: "text-white/40" },
    { label: "Pending",     val: stats?.pendingOrders ?? 0,    bar: "bg-amber-400",  text: "text-amber-400" },
    { label: "Processing",  val: stats?.processingOrders ?? 0, bar: "bg-blue-400",   text: "text-blue-400" },
    { label: "Delivered",   val: stats?.deliveredOrders ?? 0,  bar: "bg-emerald-400",text: "text-emerald-400" },
  ];
  const total = Math.max(stages.reduce((a,s)=>a+s.val,0), 1);
  return (
    <div className="bg-[#12121E] border border-white/8 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
        <Package className="w-4 h-4 text-amber-400" /> Order Pipeline
      </h3>
      <div className="space-y-3">
        {stages.map(s => (
          <div key={s.label}>
            <div className="flex justify-between mb-1">
              <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
              <span className="text-xs font-bold text-white">{loading?"—":s.val}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${s.bar} rounded-full transition-all duration-700`}
                style={{width: loading?"0%":`${(s.val/total)*100}%`}} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/8 flex justify-between text-[10px] text-white/30">
        <span>Total: {loading?"—":stats?.totalCorpOrders??0} orders</span>
        <Link href="/corporate/orders" className="text-amber-400 hover:text-amber-300">View all →</Link>
      </div>
    </div>
  );
}

// ─── Recent Invoices ──────────────────────────────────────────────────────────
function RecentInvoicesFeed({ items, loading }: { items: RecentInvoice[]; loading: boolean }) {
  return (
    <div className="bg-[#12121E] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
        <Link href="/corporate/invoices" className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-1">
        {loading ? Array.from({length:4}).map((_,i)=>(
          <div key={i} className="flex items-center gap-3 p-2.5"><div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse shrink-0"/><div className="flex-1 space-y-1.5"><Skel/><Skel w="1/2"/></div><div className="w-16 h-4 bg-white/5 rounded animate-pulse"/></div>
        )) : items.length===0 ? (
          <div className="text-center py-10 text-white/20">
            <FileText className="w-7 h-7 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No invoices yet</p>
          </div>
        ) : items.map(inv=>(
          <div key={inv.id} className="flex items-center gap-3 p-2.5 hover:bg-white/[0.03] rounded-xl transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-amber-400"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{inv.buyer_name}</p>
              <p className="text-[10px] text-white/35">{inv.invoice_number} · {new Date(inv.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-white">KES {Number(inv.total_amount).toLocaleString()}</p>
              <StatusPill status={inv.status}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Orders ────────────────────────────────────────────────────────────
function RecentOrdersFeed({ items, loading }: { items: RecentOrder[]; loading: boolean }) {
  return (
    <div className="bg-[#12121E] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Recent Orders</h3>
        <Link href="/corporate/orders" className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1">All <ChevronRight className="w-3 h-3"/></Link>
      </div>
      <div className="space-y-1">
        {loading ? Array.from({length:4}).map((_,i)=>(
          <div key={i} className="flex items-center gap-3 p-2.5"><div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse shrink-0"/><div className="flex-1 space-y-1.5"><Skel/><Skel w="1/2"/></div></div>
        )) : items.length===0 ? (
          <div className="text-center py-10 text-white/20">
            <Package className="w-7 h-7 mx-auto mb-2 opacity-50"/>
            <p className="text-xs">No orders yet</p>
          </div>
        ) : items.map(o=>(
          <div key={o.id} className="flex items-center gap-3 p-2.5 hover:bg-white/[0.03] rounded-xl transition-all">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5 text-blue-400"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{o.company_name||o.sender_name}</p>
              <p className="text-[10px] text-white/35">{o.recipient_count} recipients · KES {Number(o.subtotal).toLocaleString()}</p>
            </div>
            <StatusPill status={o.status}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading }: { stats: Stats|null; loading: boolean }) {
  const s = stats;
  const kpis = [
    { label:"Corp Orders",        value: s?String(s.totalCorpOrders):"—",   sub:`${s?.monthCorpOrders??0} this month`,           icon:Package,      accent:"bg-amber-500/10 border border-amber-500/20 text-amber-400",    trend: "up" as const },
    { label:"Revenue Collected",  value: s?ksh(s.totalRevenuePaid):"—",     sub:`${s?.unpaidInvoices??0} invoices unpaid`,        icon:DollarSign,   accent:"bg-emerald-500/10 border border-emerald-500/20 text-emerald-400", trend:"neutral" as const },
    { label:"Pending Quotes",     value: s?String(s.pendingQuotes):"—",     sub:`${s?.totalQuotes??0} total received`,            icon:Inbox,        accent:s?.pendingQuotes?"bg-amber-500/10 border border-amber-500/20 text-amber-400":"bg-white/5 border border-white/10 text-white/30" },
    { label:"Corp Accounts",      value: s?String(s.totalAccounts):"—",     sub:`${s?.totalClients??0} registered clients`,      icon:Building2,    accent:"bg-blue-500/10 border border-blue-500/20 text-blue-400" },
    { label:"Active Pools",       value: s?String(s.activePools):"—",       sub:`${s?.totalPools??0} total pools`,                icon:Target,       accent:"bg-violet-500/10 border border-violet-500/20 text-violet-400" },
    { label:"Milestones Active",  value: s?String(s.activeMilestones):"—",  sub:"Gifting automations",                            icon:Zap,          accent:"bg-pink-500/10 border border-pink-500/20 text-pink-400" },
    { label:"Overdue Invoices",   value: s?String(s.overdueInvoices):"—",   sub:s?ksh(s.totalRevenueUnpaid)+" outstanding":"—",  icon:AlertCircle,  accent:s?.overdueInvoices?"bg-red-500/10 border border-red-500/20 text-red-400":"bg-white/5 border border-white/10 text-white/30", trend:s?.overdueInvoices?"down" as const:undefined },
    { label:"Draft Invoices",     value: s?String(s.draftInvoices):"—",     sub:"Ready to issue",                                 icon:FileText,     accent:"bg-white/5 border border-white/10 text-white/30" },
  ];

  return (
    <div className="space-y-5">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k=><KpiCard key={k.label} {...k} loading={loading}/>)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><ActivityChart data={stats?.monthlyActivity??[]} loading={loading}/></div>
        <PipelineChart stats={stats} loading={loading}/>
      </div>

      {/* Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentInvoicesFeed items={stats?.recentInvoices??[]} loading={loading}/>
        <RecentOrdersFeed items={stats?.recentOrders??[]} loading={loading}/>
      </div>

      {/* Quick tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {href:"/corporate/orders/new",  emoji:"➕", label:"New Order",       sub:"Build a bulk hamper",       border:"border-amber-500/20", bg:"from-amber-500/10 to-orange-500/5"},
          {href:"/corporate/catalog",     emoji:"🏪", label:"Branding Catalog", sub:"170+ customisable items",  border:"border-blue-500/20",   bg:"from-blue-500/10 to-cyan-500/5"},
          {href:"/corporate/pools",       emoji:"🎯", label:"Gift Pools",        sub:`${stats?.activePools??"—"} active`, border:"border-violet-500/20", bg:"from-violet-500/10 to-purple-500/5"},
          {href:"/corporate/whitelabel",  emoji:"🏢", label:"White-Label",       sub:"Custom storefront",        border:"border-pink-500/20",   bg:"from-pink-500/10 to-rose-500/5"},
        ].map(t=>(
          <Link key={t.href} href={t.href} className={`group bg-gradient-to-br ${t.bg} border ${t.border} rounded-2xl p-4 hover:scale-[1.02] transition-all`}>
            <span className="text-2xl block mb-2">{t.emoji}</span>
            <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{t.label}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{t.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────
function EmptyTab({title,icon:Icon,desc,cta,ctaHref}:{title:string;icon:React.ComponentType<{className?:string}>;desc:string;cta?:string;ctaHref?:string}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-amber-400"/>
      </div>
      <div><h3 className="text-base font-bold text-white">{title}</h3><p className="text-white/40 text-sm mt-1 max-w-xs mx-auto">{desc}</p></div>
      {cta&&ctaHref&&(
        <Link href={ctaHref} className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all">
          <Plus className="w-4 h-4"/>{cta}
        </Link>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CorporateDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats]         = useState<Stats|null>(null);
  const [loading, setLoading]     = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/corporate/stats");
      if (res.ok) setStats(await res.json());
    } catch {}
    setLoading(false);
  },[]);

  useEffect(()=>{fetchStats();},[fetchStats]);

  const pendingAlert = (stats?.pendingQuotes??0)+(stats?.overdueInvoices??0);

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white font-sans flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-[#0D0D1A] border-r border-white/8 min-h-screen sticky top-0 h-screen">
        {/* Branding */}
        <div className="px-4 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white"/>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Corporate</p>
              <p className="text-[9px] text-white/40 mt-0.5">TouchGift B2B</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n=>{
            const active = activeTab===n.key;
            const badge = n.key==="quotes"&&(stats?.pendingQuotes??0)>0 ? stats!.pendingQuotes : n.key==="invoices"&&(stats?.overdueInvoices??0)>0 ? stats!.overdueInvoices : 0;
            return (
              <button key={n.key} onClick={()=>setActiveTab(n.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[11px] font-medium transition-all group ${active?"bg-amber-500/10 border border-amber-500/20 text-amber-400":"text-white/45 hover:text-white hover:bg-white/[0.04]"}`}>
                <n.icon className={`w-4 h-4 shrink-0 ${active?"text-amber-400":"text-white/25 group-hover:text-white/60"}`}/>
                <span className="flex-1 truncate">{n.label}</span>
                {badge>0&&<span className="w-4 h-4 bg-amber-500 rounded-full text-[8px] font-bold text-black flex items-center justify-center shrink-0">{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="px-2 py-3 border-t border-white/8 space-y-0.5">
          {[
            {href:"/corporate/catalog",icon:ShoppingBag,label:"Catalog"},
            {href:"/",icon:ArrowUpRight,label:"Main Store"},
          ].map(l=>(
            <Link key={l.href} href={l.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
              <l.icon className="w-3.5 h-3.5 text-white/25"/>{l.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[#0A0A12]/90 backdrop-blur-xl border-b border-white/8 px-4 py-3 flex items-center gap-3">
          {/* Mobile tab strip */}
          <div className="lg:hidden flex items-center gap-1.5 flex-1 overflow-x-auto hide-scrollbar">
            {NAV.map(n=>(
              <button key={n.key} onClick={()=>setActiveTab(n.key)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab===n.key?"bg-amber-500/10 text-amber-400 border border-amber-500/20":"text-white/35 hover:text-white"}`}>
                <n.icon className="w-3.5 h-3.5"/><span className="hidden sm:block">{n.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:block flex-1">
            <h1 className="text-sm font-bold text-white capitalize">{NAV.find(n=>n.key===activeTab)?.label}</h1>
            <p className="text-[10px] text-white/30">Corporate Operations Dashboard</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingAlert>0&&(
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <Bell className="w-3.5 h-3.5 text-red-400"/>
                <span className="text-[11px] font-bold text-red-400 hidden sm:block">{pendingAlert} actions needed</span>
                <span className="text-[11px] font-bold text-red-400 sm:hidden">{pendingAlert}</span>
              </div>
            )}
            <button onClick={fetchStats} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`}/>
              <span className="hidden sm:block">Refresh</span>
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-4 sm:p-5 max-w-screen-xl w-full mx-auto">
          {activeTab==="overview"   && <OverviewTab stats={stats} loading={loading}/>}

          {activeTab==="orders"     && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {label:"Total",      val:stats?.totalCorpOrders,    icon:Package,      cls:"text-amber-400",   bg:"bg-amber-500/10 border-amber-500/20"},
                  {label:"Drafts",     val:stats?.draftOrders,        icon:FileText,     cls:"text-white/40",    bg:"bg-white/5 border-white/10"},
                  {label:"Processing", val:stats?.processingOrders,   icon:Clock,        cls:"text-blue-400",    bg:"bg-blue-500/10 border-blue-500/20"},
                  {label:"Delivered",  val:stats?.deliveredOrders,    icon:CheckCircle,  cls:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20"},
                ].map(c=>(
                  <div key={c.label} className={`bg-[#12121E] border rounded-2xl p-4 ${c.bg}`}>
                    <c.icon className={`w-5 h-5 ${c.cls} mb-2`}/>
                    <p className="text-xl font-bold text-white">{loading?"—":c.val??0}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{c.label}</p>
                  </div>
                ))}
              </div>
              <RecentOrdersFeed items={stats?.recentOrders??[]} loading={loading}/>
            </div>
          )}

          {activeTab==="invoices"   && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {label:"Paid Revenue",  val:stats?ksh(stats.totalRevenuePaid):"—",   icon:DollarSign,  cls:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20"},
                  {label:"Outstanding",   val:stats?ksh(stats.totalRevenueUnpaid):"—", icon:CreditCard,  cls:"text-amber-400",   bg:"bg-amber-500/10 border-amber-500/20"},
                  {label:"Overdue",       val:stats?.overdueInvoices??"—",             icon:AlertCircle, cls:"text-red-400",     bg:"bg-red-500/10 border-red-500/20"},
                  {label:"Draft",         val:stats?.draftInvoices??"—",              icon:FileText,    cls:"text-white/40",    bg:"bg-white/5 border-white/10"},
                ].map(c=>(
                  <div key={c.label} className={`bg-[#12121E] border rounded-2xl p-4 ${c.bg}`}>
                    <c.icon className={`w-5 h-5 ${c.cls} mb-2`}/>
                    <p className="text-xl font-bold text-white">{loading?"—":c.val}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{c.label}</p>
                  </div>
                ))}
              </div>
              <InvoiceOpsPanel/>
            </div>
          )}

          {activeTab==="quotes"     && <QuoteOpsPanel initialPending={stats?.pendingQuotes??0}/>}

          {activeTab==="clients"    && <EmptyTab title="Client Management" icon={Users} desc="Manage corporate accounts, contacts, tiers and gift histories." cta="Add Client" ctaHref="/corporate/clients/new"/>}
          {activeTab==="pools"      && <EmptyTab title="Gift Pools" icon={Gift} desc={`${stats?.activePools??0} active pools — manage group contributions and deliveries.`} cta="Create Pool" ctaHref="/corporate/pools/new"/>}
          {activeTab==="milestones" && <EmptyTab title="Gifting Milestones" icon={TrendingUp} desc={`${stats?.activeMilestones??0} active rules — trigger gifts on birthdays, workiversaries and spend thresholds.`} cta="New Rule" ctaHref="/corporate/milestones"/>}
          {activeTab==="calendar"   && <EmptyTab title="Event Calendar" icon={Calendar} desc="Plan bulk dispatches around end-of-year, client birthdays and national holidays." cta="Schedule Event" ctaHref="/corporate/calendar"/>}
          {activeTab==="portal"     && <div className="max-w-xl"><PortalAccessPanel/></div>}
        </main>
      </div>
    </div>
  );
}
