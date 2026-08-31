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
    { label: "Corporate Orders", value: stats.totalOrders.toLocaleString(), sub: `${stats.monthOrders} this month`, icon: <Package className="w-5 h-5" />, color: "text-gold" },
    { label: "Gifts Delivered", value: stats.deliveredCount.toLocaleString(), sub: "All time", icon: <Gift className="w-5 h-5" />, color: "text-brand" },
    { label: "Total Revenue", value: `KSh ${(stats.totalRevenue / 1000).toFixed(0)}K`, sub: "Last 90 days", icon: <DollarSign className="w-5 h-5" />, color: "text-success" },
    { label: "Active Milestones", value: stats.activeMilestones.toString(), sub: `of ${stats.milestoneRules} total`, icon: <TrendingUp className="w-5 h-5" />, color: "text-violet-500" },
    { label: "Clients Managed", value: stats.totalClients.toString(), sub: `${stats.platinumClients} platinum`, icon: <Users className="w-5 h-5" />, color: "text-pink-500" },
    { label: "Active Pools", value: stats.activePools.toString(), sub: `of ${stats.totalPools} total`, icon: <Target className="w-5 h-5" />, color: "text-emerald-500" },
  ] : [];

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Impact Dashboard</h1>
              <p className="text-theme-muted text-sm">Measure the ROI of your corporate gifting program.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-4 py-2 shape-premium-button text-sm font-medium bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30 transition-all flex items-center gap-2"
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
                <div key={i} className="bg-white/80 shape-premium-card p-4 border border-surface-border animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm hover:shadow-card transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 shape-premium-card flex items-center justify-center bg-gray-50 dark:bg-white/5 ${metric.color}`}>
                      {metric.icon}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-theme-heading">{metric.value}</p>
                  <p className="text-[10px] text-theme-muted mb-1">{metric.label}</p>
                  <p className="text-[10px] text-theme-muted">{metric.sub}</p>
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
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-4">Monthly Corporate Orders</h3>
              {loading && !stats ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-8 h-4 bg-gray-200 rounded" />
                      <div className="flex-1 h-6 bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(stats?.monthlyActivity || []).map((data) => (
                    <div key={data.month} className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-theme-muted w-8">{data.month}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-6 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand to-brand-deep rounded-full flex items-center justify-end pr-2 transition-all duration-700"
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
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
                <h3 className="text-sm font-semibold text-theme-heading mb-4">Order Pipeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { status: "pending_payment", label: "Pending", color: "bg-amber-500" },
                    { status: "processing", label: "Processing", color: "bg-blue-500" },
                    { status: "wrapped", label: "Wrapping", color: "bg-violet-500" },
                    { status: "dispatched", label: "Dispatched", color: "bg-orange-500" },
                    { status: "delivered", label: "Delivered", color: "bg-emerald-500" },
                  ].map((s) => (
                    <div key={s.status} className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
                      <p className="text-lg font-bold text-theme-heading">{stats.statusCounts[s.status] || 0}</p>
                      <p className="text-[10px] text-theme-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/corporate/build" className="flex items-center gap-3 p-3 bg-gold/5 hover:bg-gold/10 border border-gold/20 rounded-xl transition-all group">
                  <ShoppingBag className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-theme-heading">Build Hamper</span>
                </Link>
                <Link href="/corporate/calendar" className="flex items-center gap-3 p-3 bg-brand/5 hover:bg-brand/10 border border-brand/20 rounded-xl transition-all group">
                  <Calendar className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-theme-heading">View Calendar</span>
                </Link>
                <Link href="/corporate/milestones" className="flex items-center gap-3 p-3 bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/20 rounded-xl transition-all group">
                  <TrendingUp className="w-5 h-5 text-violet-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-theme-heading">Milestones</span>
                </Link>
                <Link href="/corporate/clients" className="flex items-center gap-3 p-3 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 rounded-xl transition-all group">
                  <Users className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-theme-heading">Clients</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status summary */}
            {stats && (
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                <h3 className="text-sm font-semibold text-theme-heading mb-3">Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <span className="text-xs text-theme-muted">This Month</span>
                    <span className="text-sm font-bold text-brand">{stats.monthOrders} orders</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <span className="text-xs text-theme-muted">Upcoming Events</span>
                    <span className="text-sm font-bold text-gold">{stats.monthEvents}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <span className="text-xs text-theme-muted">Marketplace Vendors</span>
                    <span className="text-sm font-bold text-success">{stats.totalVendors}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <span className="text-xs text-theme-muted">Delivery Rate</span>
                    <span className="text-sm font-bold text-emerald-500">
                      {stats.totalOrders > 0 ? Math.round((stats.deliveredCount / stats.totalOrders) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming links */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Corporate Tools</h3>
              <div className="space-y-2">
                {[
                  { href: "/corporate/catalog", icon: <Package className="w-4 h-4" />, label: "Product Catalog", color: "text-gold" },
                  { href: "/corporate/pools", icon: <Target className="w-4 h-4" />, label: "Gift Pools", color: "text-brand" },
                  { href: "/corporate/marketplace", icon: <ShoppingBag className="w-4 h-4" />, label: "Marketplace", color: "text-success" },
                  { href: "/corporate/showroom", icon: <Sparkles className="w-4 h-4" />, label: "Showroom", color: "text-violet-500" },
                  { href: "/corporate/whitelabel", icon: <Building2 className="w-4 h-4" />, label: "White-Label", color: "text-cyan-400" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all group">
                    <span className={link.color}>{link.icon}</span>
                    <span className="text-xs font-medium text-theme-heading group-hover:text-gold transition-colors">{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
