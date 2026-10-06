"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Gift, Users, TrendingUp, Clock, CheckCircle,
  AlertCircle, Building2, Calendar, Target, ArrowRight,
  Search, Filter, BarChart3
} from "lucide-react";

type CorporatePool = {
  id: string;
  title: string;
  recipientName: string;
  occasion: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  deadline: string;
  status: "active" | "completed" | "expired" | "fulfilled";
  companyMatch: boolean;
  department: string;
  createdAt: string;
};

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-success/10 text-success", icon: <Clock className="w-3 h-3" /> },
  completed: { label: "Ready to Order", color: "bg-brand/10 text-brand", icon: <CheckCircle className="w-3 h-3" /> },
  expired: { label: "Expired", color: "bg-red-50 text-red-500", icon: <AlertCircle className="w-3 h-3" /> },
  fulfilled: { label: "Fulfilled", color: "bg-gray-100 text-gray-500", icon: <Gift className="w-3 h-3" /> },
};

const OCCASION_ICONS: Record<string, string> = {
  birthday: "🎂",
  farewell: "👋",
  promotion: "🏆",
  holiday: "🎄",
  work_anniversary: "🎉",
  new_baby: "👶",
  get_well: "💐",
  team_celebration: "🥳",
};

export default function CorporatePoolsDashboard() {
  const [pools, setPools] = useState<CorporatePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const res = await fetch("/api/corporate/pools");
        const data = await res.json();
        if (data.pools) {
          setPools(data.pools.map((p: Record<string, unknown>) => ({
            id: p.id,
            title: p.title,
            recipientName: p.recipient_name,
            occasion: p.occasion,
            targetAmount: p.target_amount,
            currentAmount: p.current_balance,
            contributors: p.contributor_count,
            deadline: p.deadline,
            status: p.status,
            companyMatch: p.company_match_enabled,
            department: p.recipient_department || "",
            createdAt: p.created_at,
          })));
        }
      } catch {
        // Use empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  const filtered = pools.filter((p) => {
    const matchesFilter = filter === "all" || p.status === filter;
    const matchesSearch = search === "" || p.recipientName.toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: pools.length,
    active: pools.filter((p) => p.status === "active").length,
    totalContributors: pools.reduce((sum, p) => sum + p.contributors, 0),
    totalCollected: pools.reduce((sum, p) => sum + p.currentAmount, 0),
  };

  return (
    <div className="min-h-screen bg-[#14080D] text-white">
      {/* Header */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold text-fuchsia-400">Team Gift Pools</h1>
              <p className="text-white/60 text-sm">Manage all corporate gift pools across your organization.</p>
            </div>
            <Link
              href="/corporate/pool/create"
              className="px-5 py-3 bg-fuchsia-500 text-white rounded-xl font-semibold text-sm hover:bg-fuchsia-600 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.4)]"
            >
              <Plus className="w-4 h-4" /> New Pool
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Pools", value: stats.total, icon: <Gift className="w-5 h-5" />, color: "text-fuchsia-400" },
              { label: "Active Pools", value: stats.active, icon: <Clock className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Total Contributors", value: stats.totalContributors, icon: <Users className="w-5 h-5" />, color: "text-fuchsia-300" },
              { label: "Total Collected", value: `KSh ${stats.totalCollected.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search pools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/40"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "completed", "expired", "fulfilled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                    filter === f
                      ? "bg-fuchsia-500 text-white shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-fuchsia-400/30 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        {/* Pool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pool) => {
            const statusCfg = STATUS_CONFIG[pool.status];
            const progress = pool.targetAmount > 0 ? (pool.currentAmount / pool.targetAmount) * 100 : 0;
            const daysLeft = Math.ceil((new Date(pool.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={pool.id}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg hover:border-fuchsia-400/30 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{OCCASION_ICONS[pool.occasion] || "🎁"}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-fuchsia-400 transition-colors">{pool.title}</h3>
                      <p className="text-xs text-white/50">{pool.recipientName} · {pool.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full flex items-center gap-1 ${statusCfg.color}`}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white font-semibold">KSh {pool.currentAmount.toLocaleString()}</span>
                    <span className="text-white/50">of KSh {pool.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pool.status === "completed" ? "bg-fuchsia-500" : pool.status === "expired" ? "bg-red-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {pool.contributors} contributors
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {pool.status === "active"
                      ? daysLeft > 0
                        ? `${daysLeft} days left`
                        : "Due today"
                      : pool.deadline}
                  </span>
                  {pool.companyMatch && (
                    <span className="flex items-center gap-1 text-fuchsia-400">
                      <Building2 className="w-3 h-3" /> Match
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {pool.status === "active" && (
                    <Link
                      href={`/pool/${pool.id}/manage`}
                      className="flex-1 text-center px-3 py-2 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded-xl text-xs font-semibold hover:bg-fuchsia-500/20 transition-colors"
                    >
                      Manage
                    </Link>
                  )}
                  {pool.status === "completed" && (
                    <Link
                      href={`/corporate/build?pool=${pool.id}`}
                      className="flex-1 text-center px-3 py-2 bg-fuchsia-500 text-white rounded-xl text-xs font-semibold hover:bg-fuchsia-600 transition-colors flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                    >
                      <Gift className="w-3 h-3" /> Order Gift
                    </Link>
                  )}
                  <Link
                    href={`/pool/${pool.id}`}
                    className="px-3 py-2 bg-white/5 text-white/60 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 hover:text-white transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-fuchsia-400" />
            </div>
            <h3 className="font-display italic text-lg font-bold text-white mb-1">No pools found</h3>
            <p className="text-white/50 text-sm mb-4">
              {search ? "Try a different search term." : "Create your first corporate gift pool."}
            </p>
            {!search && (
              <Link
                href="/corporate/pool/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-fuchsia-500 text-white rounded-xl font-semibold text-sm hover:bg-fuchsia-600 transition-colors shadow-[0_0_15px_rgba(217,70,239,0.3)]"
              >
                <Plus className="w-4 h-4" /> Create Pool
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
