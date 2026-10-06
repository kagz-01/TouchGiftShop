"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, Users, Gift, Download,
  Target, Zap, ArrowLeft, RefreshCw, ChevronDown,
  CircleDollarSign, Package, Trophy, Layers
} from "lucide-react";

type Summary = {
  totalOrders: number;
  totalSpend: number;
  deliveredOrders: number;
  deliveryRate: number;
};
type DeptRow = { dept: string; spend: number; count: number };
type RecipientRow = { name: string; spend: number; count: number };
type MonthRow = { month: string; year: number; orders: number; spend: number };
type MilestoneRow = { name: string; trigger: string; budget: number; triggered: number; totalCost: number; active: boolean };
type PoolStats = { total: number; active: number; completed: number; totalRaised: number; avgContributors: number };
type StatusCounts = Record<string, number>;

type ReportData = {
  range: string;
  summary: Summary;
  spendByDepartment: DeptRow[];
  topRecipients: RecipientRow[];
  monthlyTrend: MonthRow[];
  statusCounts: StatusCounts;
  milestoneROI: MilestoneRow[];
  poolStats: PoolStats;
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-amber-500",
  processing: "bg-blue-500",
  wrapped: "bg-violet-500",
  dispatched: "bg-orange-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending",
  processing: "Processing",
  wrapped: "Wrapping",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function CorporateReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"quarter" | "year" | "all">("quarter");
  const [activeTab, setActiveTab] = useState<"overview" | "departments" | "recipients" | "milestones" | "pools">("overview");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/corporate/reports?range=${range}`);
      if (res.ok) setData(await res.json());
    } catch { /* noop */ }
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Department Report", "", ""],
      ["Department", "Orders", "Total Spend (KSh)"],
      ...data.spendByDepartment.map((d) => [d.dept, d.count, d.spend]),
      ["", "", ""],
      ["Top Recipients", "", ""],
      ["Name", "Gifts Received", "Total Spend (KSh)"],
      ...data.topRecipients.map((r) => [r.name, r.count, r.spend]),
      ["", "", ""],
      ["Monthly Trend", "", ""],
      ["Month", "Orders", "Spend (KSh)"],
      ...data.monthlyTrend.map((m) => [`${m.month} ${m.year}`, m.orders, m.spend]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `touchgift-report-${range}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxDeptSpend = Math.max(...(data?.spendByDepartment.map((d) => d.spend) ?? [1]));
  const maxMonthSpend = Math.max(...(data?.monthlyTrend.map((m) => m.spend) ?? [1]));
  const totalStatusOrders = Object.values(data?.statusCounts ?? {}).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen bg-[#14080D] text-white pb-24">
      {/* Header */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/corporate/dashboard" className="text-white/40 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display italic text-2xl font-bold text-white">Corporate Reports</h1>
                <p className="text-white/50 text-sm">Full visibility into your gifting program ROI.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Range selector */}
              <div className="relative">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as typeof range)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-8 py-2 text-sm text-white focus:outline-none focus:border-violet-400 cursor-pointer"
                >
                  <option value="quarter">Last 90 Days</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={fetchReport}
                disabled={loading}
                className="p-2 bg-white/5 border border-white/10 rounded-xl hover:border-violet-400/30 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-white/60 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!data}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Summary KPI strip */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Orders", value: data.summary.totalOrders.toLocaleString(), icon: <Package className="w-5 h-5" />, color: "text-violet-400", glow: "rgba(139,92,246,0.2)" },
                { label: "Total Spend", value: `KSh ${(data.summary.totalSpend / 1000).toFixed(1)}K`, icon: <CircleDollarSign className="w-5 h-5" />, color: "text-amber-400", glow: "rgba(251,191,36,0.2)" },
                { label: "Delivered Gifts", value: data.summary.deliveredOrders.toLocaleString(), icon: <Gift className="w-5 h-5" />, color: "text-emerald-400", glow: "rgba(52,211,153,0.2)" },
                { label: "Delivery Rate", value: `${data.summary.deliveryRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-fuchsia-400", glow: "rgba(232,121,249,0.2)" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${kpi.color}`}>
                      {kpi.icon}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{kpi.value}</p>
                      <p className="text-xs text-white/50">{kpi.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="page-container-capped pb-0">
          <div className="flex gap-1 overflow-x-auto pb-px border-b border-white/10">
            {[
              { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
              { id: "departments", label: "Departments", icon: <Layers className="w-4 h-4" /> },
              { id: "recipients", label: "Top Recipients", icon: <Users className="w-4 h-4" /> },
              { id: "milestones", label: "Milestone ROI", icon: <Zap className="w-4 h-4" /> },
              { id: "pools", label: "Gift Pools", icon: <Target className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-violet-400 text-violet-400"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* ═══ OVERVIEW ═══ */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Monthly trend chart */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold text-white">Monthly Gifting Spend (12 months)</h2>
                    <span className="text-xs text-white/40">KSh</span>
                  </div>
                  <div className="flex items-end gap-2 h-48">
                    {data.monthlyTrend.map((m, i) => {
                      const pct = maxMonthSpend > 0 ? (m.spend / maxMonthSpend) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-400 transition-all duration-700 relative cursor-pointer"
                            style={{ height: `${Math.max(pct, 2)}%` }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-black/80 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap border border-white/10">
                              KSh {m.spend.toLocaleString()}
                            </div>
                          </div>
                          <span className="text-[9px] text-white/40">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order pipeline */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-sm font-semibold text-white mb-5">Order Pipeline Status</h2>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.entries(data.statusCounts).map(([status, count]) => (
                      <div key={status} className="text-center p-4 bg-black/30 rounded-xl border border-white/5">
                        <div className={`w-3 h-3 ${STATUS_COLORS[status] ?? "bg-gray-500"} rounded-full mx-auto mb-2`} />
                        <p className="text-2xl font-bold text-white">{count}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{STATUS_LABELS[status] ?? status}</p>
                        {totalStatusOrders > 0 && (
                          <p className="text-[9px] text-white/30 mt-0.5">{Math.round((count / totalStatusOrders) * 100)}%</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick pool snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h2 className="text-sm font-semibold text-white mb-4">Pool Gifting Snapshot</h2>
                    <div className="space-y-3">
                      {[
                        { label: "Total Pools", value: data.poolStats.total, color: "text-fuchsia-400" },
                        { label: "Active", value: data.poolStats.active, color: "text-emerald-400" },
                        { label: "Completed", value: data.poolStats.completed, color: "text-violet-400" },
                        { label: "Total Raised", value: `KSh ${data.poolStats.totalRaised.toLocaleString()}`, color: "text-amber-400" },
                        { label: "Avg. Contributors", value: data.poolStats.avgContributors, color: "text-pink-400" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                          <span className="text-xs text-white/60">{row.label}</span>
                          <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h2 className="text-sm font-semibold text-white mb-4">Milestone Automation ROI</h2>
                    <div className="space-y-3">
                      {data.milestoneROI.slice(0, 5).map((rule) => (
                        <div key={rule.name} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{rule.name}</p>
                            <p className="text-[10px] text-white/40">{rule.triggered} gifts sent</p>
                          </div>
                          <span className="text-sm font-bold text-violet-400 ml-3">KSh {rule.totalCost.toLocaleString()}</span>
                        </div>
                      ))}
                      {data.milestoneROI.length === 0 && (
                        <p className="text-xs text-white/40 text-center py-4">No milestone rules yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ DEPARTMENTS ═══ */}
            {activeTab === "departments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Spend by Department</h2>
                  <p className="text-xs text-white/40">{data.spendByDepartment.length} departments</p>
                </div>
                {data.spendByDepartment.length === 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <Layers className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">No department data for this period.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {data.spendByDepartment.map((dept, i) => {
                    const pct = maxDeptSpend > 0 ? (dept.spend / maxDeptSpend) * 100 : 0;
                    return (
                      <div key={dept.dept} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/30 font-mono w-5">#{i + 1}</span>
                            <span className="text-sm font-semibold text-white">{dept.dept}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-violet-400">KSh {dept.spend.toLocaleString()}</p>
                            <p className="text-[10px] text-white/40">{dept.count} orders</p>
                          </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] text-white/30">{Math.round(pct)}% of max</span>
                          <span className="text-[9px] text-white/30">avg KSh {dept.count > 0 ? Math.round(dept.spend / dept.count).toLocaleString() : 0}/gift</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ RECIPIENTS ═══ */}
            {activeTab === "recipients" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Top Gift Recipients</h2>
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                {data.topRecipients.length === 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">No recipient data for this period.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {data.topRecipients.map((r, i) => (
                    <div key={r.name} className={`bg-white/5 backdrop-blur-md rounded-2xl p-5 border transition-all ${
                      i === 0 ? "border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]" :
                      i === 1 ? "border-white/20" : "border-white/10"
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          i === 0 ? "bg-amber-400/20 text-amber-400" :
                          i === 1 ? "bg-white/10 text-white/70" :
                          i === 2 ? "bg-orange-500/20 text-orange-400" :
                          "bg-white/5 text-white/40"
                        }`}>
                          {i < 3 ? <Trophy className="w-5 h-5" /> : `#${i + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{r.name}</p>
                          <p className="text-xs text-white/40">{r.count} gift{r.count !== 1 ? "s" : ""} received</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-violet-400">KSh {r.spend.toLocaleString()}</p>
                          <p className="text-[10px] text-white/40">total value</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ MILESTONE ROI ═══ */}
            {activeTab === "milestones" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Milestone Rule Performance</h2>
                  <Link href="/corporate/milestones" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Manage Rules →
                  </Link>
                </div>
                {data.milestoneROI.length === 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <Zap className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40 mb-4">No milestone rules configured yet.</p>
                    <Link
                      href="/corporate/milestones/add"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition-colors"
                    >
                      <Zap className="w-4 h-4" /> Create First Rule
                    </Link>
                  </div>
                )}
                <div className="space-y-3">
                  {data.milestoneROI.map((rule) => (
                    <div key={rule.name} className={`bg-white/5 backdrop-blur-md rounded-2xl p-5 border ${
                      rule.active ? "border-violet-400/20" : "border-white/5 opacity-60"
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${rule.active ? "bg-emerald-400" : "bg-white/20"}`} />
                            <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                          </div>
                          <p className="text-xs text-white/40">{rule.trigger}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          rule.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30"
                        }`}>
                          {rule.active ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-black/30 rounded-xl border border-white/5">
                          <p className="text-lg font-bold text-violet-400">{rule.triggered}</p>
                          <p className="text-[10px] text-white/40">Gifts Sent</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-xl border border-white/5">
                          <p className="text-lg font-bold text-white">KSh {rule.budget.toLocaleString()}</p>
                          <p className="text-[10px] text-white/40">Per Gift</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-xl border border-white/5">
                          <p className="text-lg font-bold text-amber-400">KSh {rule.totalCost.toLocaleString()}</p>
                          <p className="text-[10px] text-white/40">Total Cost</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ POOLS ═══ */}
            {activeTab === "pools" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Pool Gifting Analytics</h2>
                  <Link href="/corporate/pools" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    Manage Pools →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Pools", value: data.poolStats.total, color: "text-white" },
                    { label: "Active", value: data.poolStats.active, color: "text-emerald-400" },
                    { label: "Completed", value: data.poolStats.completed, color: "text-violet-400" },
                    { label: "Total Raised", value: `KSh ${(data.poolStats.totalRaised / 1000).toFixed(1)}K`, color: "text-fuchsia-400" },
                    { label: "Avg Contributors", value: data.poolStats.avgContributors, color: "text-pink-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-4">Pool Completion Rate</h3>
                  <div className="flex items-center gap-6 mb-2">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-600 to-pink-400 rounded-full transition-all duration-700"
                        style={{ width: data.poolStats.total > 0 ? `${(data.poolStats.completed / data.poolStats.total) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-bold text-fuchsia-400">
                      {data.poolStats.total > 0 ? Math.round((data.poolStats.completed / data.poolStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-white/40">{data.poolStats.completed} of {data.poolStats.total} pools reached their target</p>
                </div>

                {data.poolStats.total === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40 mb-4">No pool gifting campaigns in this period.</p>
                    <Link
                      href="/corporate/pool/create"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-fuchsia-500 text-white rounded-xl text-sm font-semibold hover:bg-fuchsia-600 transition-colors"
                    >
                      <Target className="w-4 h-4" /> Create First Pool
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
