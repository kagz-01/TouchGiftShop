"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, Users, Gift, Heart, Clock,
  DollarSign, Target, ArrowUpRight, ArrowDownRight,
  Calendar, Sparkles, Award, Star, Zap, Package,
  Building2, ShoppingBag, RefreshCw
} from "lucide-react";

type Stats = {
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
};

export default function CorporateImpactDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"quarter" | "year" | "all">("quarter");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/corporate/stats");
      if (res.ok) setStats(await res.json());
    } catch { /* noop */ }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const maxMonthly = Math.max(...(stats?.monthlyActivity?.map(m => m.orders) || [1]));

  const metrics = stats ? [
    { label: "Corporate Orders", value: stats.totalOrders.toLocaleString(), sub: `${stats.monthOrders} this month`, icon: <Package className="w-5 h-5" />, color: "text-amber-400" },
    { label: "Gifts Delivered", value: stats.deliveredCount.toLocaleString(), sub: "All time", icon: <Gift className="w-5 h-5" />, color: "text-violet-400" },
    { label: "Total Revenue", value: `KSh ${(stats.totalRevenue / 1000).toFixed(0)}K`, sub: "Last 90 days", icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-400" },
    { label: "Active Milestones", value: stats.activeMilestones.toString(), sub: `of ${stats.milestoneRules} total`, icon: <TrendingUp className="w-5 h-5" />, color: "text-violet-400" },
    { label: "Clients Managed", value: stats.totalClients.toString(), sub: `${stats.platinumClients} platinum`, icon: <Users className="w-5 h-5" />, color: "text-pink-400" },
    { label: "Active Pools", value: stats.activePools.toString(), sub: `of ${stats.totalPools} total`, icon: <Target className="w-5 h-5" />, color: "text-emerald-400" },
  ] : [];

  return (
    <div className="min-h-screen bg-[#14080D] text-white">
      {/* Header */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold text-white">Impact Dashboard</h1>
              <p className="text-white/60 text-sm">Measure the ROI of your corporate gifting program.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-4 py-2 shape-premium-button text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:border-violet-400/30 hover:text-white transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Key metrics */}
          {loading && !stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 shape-premium-card p-4 border border-white/10 animate-pulse">
                  <div className="w-8 h-8 bg-white/10 rounded-lg mb-2" />
                  <div className="h-6 bg-white/10 rounded w-16 mb-1" />
                  <div className="h-3 bg-white/10 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="bg-white/5 backdrop-blur-md shape-premium-card p-4 border border-white/10 shadow-lg hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 shape-premium-card flex items-center justify-center bg-white/5 ${metric.color}`}>
                      {metric.icon}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{metric.value}</p>
                  <p className="text-[10px] text-white/60 mb-1">{metric.label}</p>
                  <p className="text-[10px] text-white/60">{metric.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="page-container-capped py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chart area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly activity chart */}
            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Corporate Orders</h3>
              {loading && !stats ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-8 h-4 bg-white/10 rounded" />
                      <div className="flex-1 h-6 bg-white/10 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(stats?.monthlyActivity || []).map((data) => (
                    <div key={data.month} className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-white/60 w-8">{data.month}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                              style={{ width: `${maxMonthly > 0 ? (data.orders / maxMonthly) * 100 : 0}%` }}
                            >
                              {data.orders > 0 && <span className="text-[10px] font-bold text-white">{data.orders}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order status breakdown */}
            {stats && (
              <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-4">Order Pipeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { status: "pending_payment", label: "Pending", color: "bg-amber-500" },
                    { status: "processing", label: "Processing", color: "bg-blue-500" },
                    { status: "wrapped", label: "Wrapping", color: "bg-violet-500" },
                    { status: "dispatched", label: "Dispatched", color: "bg-orange-500" },
                    { status: "delivered", label: "Delivered", color: "bg-emerald-500" },
                  ].map((s) => (
                    <div key={s.status} className="text-center p-3 bg-white/5 rounded-xl">
                      <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
                      <p className="text-lg font-bold text-white">{stats.statusCounts[s.status] || 0}</p>
                      <p className="text-[10px] text-white/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/corporate/build" className="flex items-center gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-400/40 rounded-xl transition-all group">
                  <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Build Hamper</span>
                </Link>
                <Link href="/corporate/calendar" className="flex items-center gap-3 p-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/40 rounded-xl transition-all group">
                  <Calendar className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">View Calendar</span>
                </Link>
                <Link href="/corporate/milestones" className="flex items-center gap-3 p-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/40 rounded-xl transition-all group">
                  <TrendingUp className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Milestones</span>
                </Link>
                <Link href="/corporate/clients" className="flex items-center gap-3 p-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/20 hover:border-pink-400/40 rounded-xl transition-all group">
                  <Users className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Clients</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status summary */}
            {stats && (
              <div className="bg-white/5 backdrop-blur-md shape-premium-card p-5 border border-white/10 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white/60">This Month</span>
                    <span className="text-sm font-bold text-violet-400">{stats.monthOrders} orders</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white/60">Upcoming Events</span>
                    <span className="text-sm font-bold text-amber-400">{stats.monthEvents}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white/60">Marketplace Vendors</span>
                    <span className="text-sm font-bold text-emerald-400">{stats.totalVendors}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white/60">Delivery Rate</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {stats.totalOrders > 0 ? Math.round((stats.deliveredCount / stats.totalOrders) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming links */}
            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-5 border border-white/10 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-3">Corporate Tools</h3>
              <div className="space-y-2">
                {[
                  { href: "/corporate/reports", icon: <BarChart3 className="w-4 h-4" />, label: "Reports & Analytics", color: "text-fuchsia-400" },
                  { href: "/corporate/catalog", icon: <Package className="w-4 h-4" />, label: "Product Catalog", color: "text-amber-400" },
                  { href: "/corporate/pools", icon: <Target className="w-4 h-4" />, label: "Gift Pools", color: "text-violet-400" },
                  { href: "/corporate/marketplace", icon: <ShoppingBag className="w-4 h-4" />, label: "Marketplace", color: "text-emerald-400" },
                  { href: "/corporate/showroom", icon: <Sparkles className="w-4 h-4" />, label: "Showroom", color: "text-violet-400" },
                  { href: "/corporate/whitelabel", icon: <Building2 className="w-4 h-4" />, label: "White-Label", color: "text-cyan-400" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-all group">
                    <span className={link.color}>{link.icon}</span>
                    <span className="text-xs font-medium text-white group-hover:text-white transition-colors">{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-white/60 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
