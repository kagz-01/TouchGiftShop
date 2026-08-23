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

const MOCK_POOLS: CorporatePool[] = [
  {
    id: "1",
    title: "Happy Birthday, Sarah!",
    recipientName: "Sarah Wanjiku",
    occasion: "birthday",
    targetAmount: 5000,
    currentAmount: 3800,
    contributors: 12,
    deadline: "2026-09-01",
    status: "active",
    companyMatch: true,
    department: "Design",
    createdAt: "2026-08-15",
  },
  {
    id: "2",
    title: "Farewell, James!",
    recipientName: "James Ochieng",
    occasion: "farewell",
    targetAmount: 8000,
    currentAmount: 8000,
    contributors: 24,
    deadline: "2026-08-20",
    status: "completed",
    companyMatch: true,
    department: "Engineering",
    createdAt: "2026-08-01",
  },
  {
    id: "3",
    title: "Congrats on the Promotion, Amina!",
    recipientName: "Amina Hassan",
    occasion: "promotion",
    targetAmount: 3000,
    currentAmount: 1200,
    contributors: 8,
    deadline: "2026-08-10",
    status: "expired",
    companyMatch: false,
    department: "Marketing",
    createdAt: "2026-07-25",
  },
  {
    id: "4",
    title: "Team Christmas 2025",
    recipientName: "Everyone",
    occasion: "holiday",
    targetAmount: 15000,
    currentAmount: 15000,
    contributors: 45,
    deadline: "2025-12-20",
    status: "fulfilled",
    companyMatch: true,
    department: "All",
    createdAt: "2025-12-01",
  },
];

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
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Team Gift Pools</h1>
              <p className="text-theme-muted text-sm">Manage all corporate gift pools across your organization.</p>
            </div>
            <Link
              href="/corporate/pool/create"
              className="px-5 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Pool
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Pools", value: stats.total, icon: <Gift className="w-5 h-5" />, color: "text-brand" },
              { label: "Active Pools", value: stats.active, icon: <Clock className="w-5 h-5" />, color: "text-success" },
              { label: "Total Contributors", value: stats.totalContributors, icon: <Users className="w-5 h-5" />, color: "text-violet-500" },
              { label: "Total Collected", value: `KSh ${stats.totalCollected.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 shape-premium-card flex items-center justify-center bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-theme-heading">{stat.value}</p>
                    <p className="text-xs text-theme-muted">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search pools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/50 border border-surface-border shape-premium-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "completed", "expired", "fulfilled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 shape-premium-button text-xs font-medium capitalize transition-all ${
                    filter === f
                      ? "bg-brand text-white"
                      : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
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
                className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm hover:shadow-card-hover transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{OCCASION_ICONS[pool.occasion] || "🎁"}</span>
                    <div>
                      <h3 className="text-sm font-bold text-theme-heading group-hover:text-brand transition-colors">{pool.title}</h3>
                      <p className="text-xs text-theme-muted">{pool.recipientName} · {pool.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold shape-premium-button flex items-center gap-1 ${statusCfg.color}`}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-theme-heading font-semibold">KSh {pool.currentAmount.toLocaleString()}</span>
                    <span className="text-theme-muted">of KSh {pool.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pool.status === "completed" ? "bg-brand" : pool.status === "expired" ? "bg-red-400" : "bg-success"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-theme-muted mb-3">
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
                    <span className="flex items-center gap-1 text-brand">
                      <Building2 className="w-3 h-3" /> Match
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {pool.status === "active" && (
                    <Link
                      href={`/pool/${pool.id}/manage`}
                      className="flex-1 text-center px-3 py-2 bg-brand/10 text-brand shape-premium-button text-xs font-semibold hover:bg-brand/20 transition-colors"
                    >
                      Manage
                    </Link>
                  )}
                  {pool.status === "completed" && (
                    <Link
                      href={`/corporate/build?pool=${pool.id}`}
                      className="flex-1 text-center px-3 py-2 bg-brand text-white shape-premium-button text-xs font-semibold hover:bg-brand-dark transition-colors flex items-center justify-center gap-1"
                    >
                      <Gift className="w-3 h-3" /> Order Gift
                    </Link>
                  )}
                  <Link
                    href={`/pool/${pool.id}`}
                    className="px-3 py-2 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
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
            <div className="w-16 h-16 mx-auto bg-brand/10 shape-premium-card flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-brand-muted" />
            </div>
            <h3 className="font-display italic text-lg font-bold text-theme-heading mb-1">No pools found</h3>
            <p className="text-theme-muted text-sm mb-4">
              {search ? "Try a different search term." : "Create your first corporate gift pool."}
            </p>
            {!search && (
              <Link
                href="/corporate/pool/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors"
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
