"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, Users, Gift, DollarSign, Target, ArrowUpRight, Calendar, Package, Building2, ShoppingBag, RefreshCw, Inbox, AlertCircle, Palette,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";
import QuoteOpsPanel from "@/components/corporate/QuoteOpsPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalOrders: number;
  monthOrders: number;
  deliveredCount: number;
  totalRevenue: number;
  milestoneRules: number;
  activeMilestones: number;
  totalClients: number;
  platinumClients: number;
  totalPools: number;
  activePools: number;
  monthEvents: number;
  totalVendors: number;
  statusCounts: Record<string, number>;
  monthlyActivity: { month: string; orders: number }[];
  pendingQuotes: number;
  quotedQuotes: number;
  totalQuotes: number;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CorporateDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setStatsError(null);
    try {
      const res = await fetch("/api/corporate/stats");
      if (!res.ok) {
        // Keep whatever we already had on screen — a blip shouldn't wipe
        // the dashboard back to empty.
        setStatsError(`Could not load stats (${res.status}).`);
        return;
      }
      setStats(await res.json());
    } catch {
      setStatsError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxMonthly = Math.max(...(stats?.monthlyActivity?.map(m => m.orders) ?? [1]), 1);

  const metrics = stats ? [
    {
      label: "Corporate Orders", value: stats.totalOrders.toLocaleString(),
      sub: `${stats.monthOrders} this month`, icon: Package, color: "text-amber-400", glow: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Revenue (90d)", value: `KES ${(stats.totalRevenue / 1000).toFixed(0)}K`,
      sub: "Delivered orders", icon: DollarSign, color: "text-emerald-400", glow: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Quote Requests", value: String(stats.totalQuotes),
      sub: `${stats.pendingQuotes} pending action`, icon: Inbox,
      color: stats.pendingQuotes > 0 ? "text-amber-400" : "text-white/60",
      glow: stats.pendingQuotes > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10",
    },
    {
      label: "Active Milestones", value: String(stats.activeMilestones),
      sub: `of ${stats.milestoneRules} rules`, icon: TrendingUp, color: "text-blue-400", glow: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Clients", value: String(stats.totalClients),
      sub: `${stats.platinumClients} platinum`, icon: Users, color: "text-pink-400", glow: "bg-pink-500/10 border-pink-500/20",
    },
    {
      label: "Active Pools", value: String(stats.activePools),
      sub: `of ${stats.totalPools} total`, icon: Target, color: "text-violet-400", glow: "bg-violet-500/10 border-violet-500/20",
    },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white font-sans">

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-[#0A0A12]/90 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" /> Corporate Dashboard
            </h1>
            <p className="text-white/40 text-xs mt-0.5">Ops command centre</p>
          </div>
          <div className="flex items-center gap-2">
            {stats && stats.pendingQuotes > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {stats.pendingQuotes} quote{stats.pendingQuotes > 1 ? "s" : ""} need action
              </div>
            )}
            <button onClick={fetchStats} disabled={loading}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading && !stats
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/8 animate-pulse h-24" />
              ))
            : statsError && !stats
            ? (
                /* No stats at all — say so instead of rendering an empty grid
                   that looks like the business simply has no numbers. */
                <div className="col-span-2 sm:col-span-3 lg:col-span-6 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300 flex-1">{statsError} Quote requests below still work.</p>
                  <button onClick={fetchStats} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/70 hover:text-white transition-colors">
                    Retry
                  </button>
                </div>
              )
            : metrics.map(m => (
                <div key={m.label} className={`bg-white/[0.03] border rounded-2xl p-4 hover:bg-white/[0.06] transition-all ${m.glow}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center mb-3 ${m.glow}`}>
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                  </div>
                  <p className="text-lg font-bold text-white leading-none">{m.value}</p>
                  <p className="text-[10px] text-white/50 mt-1 leading-snug">{m.label}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{m.sub}</p>
                </div>
              ))}
        </div>

        {/* Main grid: Quote panel + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Quote Requests — takes 2 cols. It fetches its own rows, so it is
              deliberately NOT gated on the stats call: a stats failure used to
              leave this area spinning forever even though quotes were fine. */}
          <div className="lg:col-span-2">
            <QuoteOpsPanel initialPending={stats?.pendingQuotes ?? 0} />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Monthly bar chart */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Monthly Orders
              </h3>
              {loading && !stats ? (
                <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-5 bg-white/5 rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2">
                  {(stats?.monthlyActivity ?? []).map(d => (
                    <div key={d.month} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 w-6 font-medium shrink-0">{d.month}</span>
                      <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700 flex items-center justify-end pr-1.5"
                          style={{ width: `${(d.orders / maxMonthly) * 100}%` }}
                        >
                          {d.orders > 0 && <span className="text-[8px] font-bold text-black">{d.orders}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order pipeline */}
            {stats && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" /> Order Pipeline
                </h3>
                <div className="space-y-2">
                  {[
                    { s: "pending_payment", label: "Pending",    dot: "bg-amber-400" },
                    { s: "processing",      label: "Processing", dot: "bg-blue-400" },
                    { s: "wrapped",         label: "Wrapping",   dot: "bg-violet-400" },
                    { s: "dispatched",      label: "Dispatched", dot: "bg-orange-400" },
                    { s: "delivered",       label: "Delivered",  dot: "bg-emerald-400" },
                  ].map(({ s, label, dot }) => (
                    <div key={s} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className="text-[11px] text-white/50">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{stats.statusCounts[s] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-white mb-3">Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { href: "/corporate/catalog",    icon: Package,     label: "Browse Catalog",    color: "text-amber-400" },
                  { href: "/corporate/build",      icon: ShoppingBag, label: "Build Hamper",      color: "text-amber-400" },
                  { href: "/corporate/build",      icon: Palette,     label: "Branding Studio",   color: "text-orange-400" },
                  { href: "/corporate/milestones", icon: TrendingUp,  label: "Milestones",        color: "text-blue-400" },
                  { href: "/corporate/calendar",   icon: Calendar,    label: "Event Calendar",    color: "text-violet-400" },
                  { href: "/corporate/clients",    icon: Users,       label: "Manage Clients",    color: "text-pink-400" },
                  { href: "/corporate/reports",    icon: BarChart3,   label: "Reports",           color: "text-emerald-400" },
                  { href: "/corporate/whitelabel", icon: Building2,   label: "White-Label Setup", color: "text-cyan-400" },
                ].map(item => (
                  <Link key={item.href + item.label} href={item.href}
                    className="flex items-center gap-2.5 p-2.5 hover:bg-white/5 rounded-xl transition-all group">
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-white/20 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Tools strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/corporate/catalog",   emoji: "🏪", label: "Branding Catalog",  sub: "170+ brandable items",    bg: "from-amber-500/10 to-orange-500/5",   border: "border-amber-500/20" },
            { href: "/corporate/pools",     emoji: "🎯", label: "Gift Pools",         sub: `${stats?.activePools ?? "—"} active`,           bg: "from-violet-500/10 to-purple-500/5", border: "border-violet-500/20" },
            { href: "/corporate/showroom",  emoji: "✨", label: "Showroom",           sub: "Curate gift sets",        bg: "from-pink-500/10 to-rose-500/5",      border: "border-pink-500/20" },
            { href: "/corporate/whatsapp",  emoji: "💬", label: "WhatsApp Blast",     sub: "SMS gift links",          bg: "from-emerald-500/10 to-teal-500/5",   border: "border-emerald-500/20" },
          ].map(t => (
            <Link key={t.href} href={t.href}
              className={`group bg-gradient-to-br ${t.bg} border ${t.border} rounded-2xl p-4 hover:scale-[1.02] transition-all`}>
              <span className="text-2xl block mb-2">{t.emoji}</span>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{t.label}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{t.sub}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
