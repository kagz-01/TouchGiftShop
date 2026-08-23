"use client";

import { useState } from "react";
import {
  BarChart3, TrendingUp, Users, Gift, Heart, Clock,
  DollarSign, Target, ArrowUpRight, ArrowDownRight,
  Calendar, Sparkles, Award, Star, Zap
} from "lucide-react";

type Metric = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  color: string;
};

const METRICS: Metric[] = [
  { label: "Total Spent on Gifting", value: "KSh 284,000", change: "+18% vs last quarter", positive: true, icon: <DollarSign className="w-5 h-5" />, color: "text-gold" },
  { label: "Gifts Delivered", value: "156", change: "+23 vs last quarter", positive: true, icon: <Gift className="w-5 h-5" />, color: "text-brand" },
  { label: "Employee Satisfaction", value: "94%", change: "+6% improvement", positive: true, icon: <Heart className="w-5 h-5" />, color: "text-pink-500" },
  { label: "Client Retention", value: "97%", change: "+2% improvement", positive: true, icon: <Users className="w-5 h-5" />, color: "text-success" },
  { label: "Avg. Gift Impact Score", value: "8.7/10", change: "+0.5 vs last quarter", positive: true, icon: <Star className="w-5 h-5" />, color: "text-violet-500" },
  { label: "Pool Participation", value: "78%", change: "+12% improvement", positive: true, icon: <Target className="w-5 h-5" />, color: "text-emerald-500" },
];

const MONTHLY_DATA = [
  { month: "Jan", gifts: 18, spend: 42000, satisfaction: 88 },
  { month: "Feb", gifts: 12, spend: 28000, satisfaction: 90 },
  { month: "Mar", gifts: 22, spend: 55000, satisfaction: 91 },
  { month: "Apr", gifts: 15, spend: 35000, satisfaction: 89 },
  { month: "May", gifts: 20, spend: 48000, satisfaction: 92 },
  { month: "Jun", gifts: 25, spend: 62000, satisfaction: 93 },
  { month: "Jul", gifts: 28, spend: 71000, satisfaction: 94 },
  { month: "Aug", gifts: 16, spend: 38000, satisfaction: 94 },
];

const TOP_OCCASIONS = [
  { occasion: "Birthdays", count: 45, percentage: 29 },
  { occasion: "Work Anniversaries", count: 32, percentage: 21 },
  { occasion: "Client Thank You", count: 28, percentage: 18 },
  { occasion: "Holiday/Christmas", count: 24, percentage: 15 },
  { occasion: "Promotions", count: 15, percentage: 10 },
  { occasion: "Other", count: 12, percentage: 7 },
];

const RECOGNITION = [
  { name: "Most Active Gifter", person: "Amina Hassan", department: "Marketing", count: 24 },
  { name: "Pool Champion", person: "James Ochieng", department: "Engineering", count: 18 },
  { name: "Client Appreciation Star", person: "Grace Muthoni", department: "Sales", count: 15 },
];

export default function CorporateImpactDashboard() {
  const [timeRange, setTimeRange] = useState<"quarter" | "year" | "all">("quarter");

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
              {(["quarter", "year", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 shape-premium-button text-sm font-medium capitalize transition-all ${
                    timeRange === range
                      ? "bg-brand text-white"
                      : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
                  }`}
                >
                  {range === "all" ? "All Time" : range === "quarter" ? "This Quarter" : "This Year"}
                </button>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {METRICS.map((metric) => (
              <div key={metric.label} className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 shape-premium-card flex items-center justify-center bg-gray-50 dark:bg-white/5 ${metric.color}`}>
                    {metric.icon}
                  </div>
                </div>
                <p className="text-xl font-bold text-theme-heading">{metric.value}</p>
                <p className="text-[10px] text-theme-muted mb-1">{metric.label}</p>
                <p className={`text-[10px] font-semibold flex items-center gap-1 ${metric.positive ? "text-success" : "text-red-500"}`}>
                  {metric.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chart area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly activity chart */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-4">Monthly Gift Activity</h3>
              <div className="space-y-3">
                {MONTHLY_DATA.map((data) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-theme-muted w-8">{data.month}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-6 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand to-brand-deep rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.gifts / 30) * 100}%` }}
                          >
                            <span className="text-[10px] font-bold text-white">{data.gifts}</span>
                          </div>
                        </div>
                        <span className="text-xs text-theme-muted w-16 text-right">KSh {(data.spend / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                    <div className="w-12 text-right">
                      <span className={`text-xs font-semibold ${data.satisfaction >= 93 ? "text-success" : data.satisfaction >= 90 ? "text-gold" : "text-amber-500"}`}>
                        {data.satisfaction}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-theme-muted">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-brand rounded-full" /> Gifts</span>
                <span>Spend</span>
                <span>Satisfaction %</span>
              </div>
            </div>

            {/* Impact insights */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-4">Impact Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Employee Retention",
                    value: "+12%",
                    description: "Teams with regular gifting show 12% higher retention rates",
                    icon: <Users className="w-5 h-5 text-success" />,
                  },
                  {
                    title: "Client Renewal Rate",
                    value: "94%",
                    description: "Clients who receive appreciation gifts renew at 94% vs 78% baseline",
                    icon: <Heart className="w-5 h-5 text-pink-500" />,
                  },
                  {
                    title: "Pool Engagement",
                    value: "78%",
                    description: "78% of invited colleagues contribute to team gift pools",
                    icon: <Target className="w-5 h-5 text-violet-500" />,
                  },
                  {
                    title: "Gift Delight Score",
                    value: "8.7/10",
                    description: "Average recipient satisfaction rating from post-gift surveys",
                    icon: <Star className="w-5 h-5 text-gold" />,
                  },
                ].map((insight, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      {insight.icon}
                      <div>
                        <p className="text-lg font-bold text-theme-heading">{insight.value}</p>
                        <p className="text-xs font-semibold text-theme-heading">{insight.title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-theme-muted">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Top occasions */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Top Occasions</h3>
              <div className="space-y-3">
                {TOP_OCCASIONS.map((occ, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-theme-heading font-medium">{occ.occasion}</span>
                      <span className="text-theme-muted">{occ.count} ({occ.percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${occ.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recognition */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Top Gifting Champions</h3>
              <div className="space-y-3">
                {RECOGNITION.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className="w-10 h-10 bg-brand/10 shape-premium-card flex items-center justify-center">
                      <Award className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-theme-heading">{rec.person}</p>
                      <p className="text-[10px] text-theme-muted">{rec.department} · {rec.count} gifts</p>
                    </div>
                    <span className="text-[10px] font-semibold text-gold">{rec.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget breakdown */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Budget Breakdown</h3>
              <div className="space-y-3">
                {[
                  { category: "Employee Gifts", amount: 142000, percentage: 50 },
                  { category: "Client Appreciation", amount: 85000, percentage: 30 },
                  { category: "Event Gifts", amount: 42000, percentage: 15 },
                  { category: "Miscellaneous", amount: 15000, percentage: 5 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-theme-heading font-medium">{item.category}</span>
                      <span className="text-theme-muted">KSh {(item.amount / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: ["#9B1B5A", "#D4A853", "#FF6B6B", "#10B981"][i] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-brand/5 border border-brand/20 shape-premium-card text-center">
                <p className="text-lg font-bold text-brand">KSh 284,000</p>
                <p className="text-[10px] text-theme-muted">Total spend this quarter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
