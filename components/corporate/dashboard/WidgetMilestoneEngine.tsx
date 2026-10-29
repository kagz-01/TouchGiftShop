"use client";

import { useState } from "react";
import { Calendar, Cake, Award, TrendingUp, UserPlus, Clock, CheckCircle2, ChevronRight, Sparkles, Filter, Check } from "lucide-react";

export interface MilestoneItem {
  id: string;
  employeeName: string;
  department: string;
  occasion: "birthday" | "workiversary" | "promotion" | "onboarding";
  date: string;
  daysLeft: number;
  recommendedTier: string;
  tierCost: number;
  status: "approved" | "pending_approval" | "dispatched";
  tenureYears?: number;
}

interface WidgetMilestoneEngineProps {
  milestones: MilestoneItem[];
  companyName: string;
}

export default function WidgetMilestoneEngine({ milestones: initialMilestones, companyName }: WidgetMilestoneEngineProps) {
  const [milestones, setMilestones] = useState<MilestoneItem[]>(initialMilestones);
  const [horizon, setHorizon] = useState<30 | 60 | 90>(30);
  const [occasionFilter, setOccasionFilter] = useState<string>("all");
  const [approvedMap, setApprovedMap] = useState<Record<string, boolean>>({});

  const filtered = milestones.filter((m) => {
    if (m.daysLeft > horizon) return false;
    if (occasionFilter !== "all" && m.occasion !== occasionFilter) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    setApprovedMap(prev => ({ ...prev, [id]: true }));
  };

  const getOccasionIcon = (occasion: string) => {
    switch (occasion) {
      case "birthday":
        return <Cake className="w-4 h-4" />;
      case "workiversary":
        return <Award className="w-4 h-4" />;
      case "promotion":
        return <TrendingUp className="w-4 h-4" />;
      case "onboarding":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getOccasionBadge = (occasion: string, tenureYears?: number) => {
    switch (occasion) {
      case "birthday":
        return "Birthday";
      case "workiversary":
        return tenureYears ? `${tenureYears}-Year Milestone` : "Workiversary";
      case "promotion":
        return "Promotion";
      case "onboarding":
        return "Onboarding";
      default:
        return occasion;
    }
  };

  return (
    <div
      className="rounded-2xl p-6 transition-all"
      style={{
        background: "var(--portal-surface)",
        border: "1px solid var(--portal-border)",
        boxShadow: "var(--portal-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--portal-gold-tint)",
              color: "var(--portal-gold)",
            }}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>
                Milestone Engine
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--portal-positive-tint)", color: "var(--portal-positive)" }}
              >
                Auto-Prompt Active
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
              Automated birthdays & workiversaries · 7-day advance dispatch reminders
            </p>
          </div>
        </div>

        {/* 30 / 60 / 90 Day Horizon Switcher */}
        <div className="flex items-center p-1 rounded-xl" style={{ background: "var(--portal-surface-2)", border: "1px solid var(--portal-border-soft)" }}>
          {([30, 60, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setHorizon(days)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: horizon === days ? "var(--portal-surface)" : "transparent",
                color: horizon === days ? "var(--portal-text)" : "var(--portal-text-muted)",
                boxShadow: horizon === days ? "var(--portal-shadow)" : "none",
              }}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {[
          { id: "all", label: "All Occasions" },
          { id: "birthday", label: "Birthdays" },
          { id: "workiversary", label: "Workiversaries" },
          { id: "promotion", label: "Promotions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOccasionFilter(tab.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
            style={{
              background: occasionFilter === tab.id ? "var(--portal-accent-tint)" : "var(--portal-surface-2)",
              color: occasionFilter === tab.id ? "var(--portal-accent)" : "var(--portal-text-muted)",
              border: `1px solid ${occasionFilter === tab.id ? "var(--portal-accent)" : "transparent"}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Milestones List */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <Calendar className="w-8 h-8 mb-2" style={{ color: "var(--portal-text-faint)", opacity: 0.5 }} />
          <p className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>
            No Upcoming Milestones in this Window
          </p>
          <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--portal-text-muted)" }}>
            Expand the view to 60 or 90 days or sync your HR employee list from the People tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => {
            const isApproved = approvedMap[item.id] || item.status === "approved";
            const isCriticalPrompt = item.daysLeft <= 7;

            return (
              <div
                key={item.id}
                className="rounded-xl p-4 transition-all flex flex-col justify-between"
                style={{
                  background: "var(--portal-surface-2)",
                  border: `1px solid ${isCriticalPrompt && !isApproved ? "rgba(225, 29, 72, 0.25)" : "var(--portal-border-soft)"}`,
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                        style={{
                          background: "var(--portal-accent-tint)",
                          color: "var(--portal-accent)",
                        }}
                      >
                        {item.employeeName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold truncate" style={{ color: "var(--portal-text)" }}>
                          {item.employeeName}
                        </h4>
                        <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                          {item.department}
                        </p>
                      </div>
                    </div>

                    {/* Occasion badge */}
                    <span
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 shrink-0 uppercase tracking-wider"
                      style={{
                        background: "var(--portal-gold-tint)",
                        color: "var(--portal-gold)",
                      }}
                    >
                      {getOccasionIcon(item.occasion)}
                      <span>{getOccasionBadge(item.occasion, item.tenureYears)}</span>
                    </span>
                  </div>

                  {/* Date & budget breakdown */}
                  <div className="mt-3 p-2.5 rounded-lg text-xs space-y-1.5" style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border-soft)" }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px]" style={{ color: "var(--portal-text-muted)" }}>Event Date</span>
                      <span className="font-semibold" style={{ color: "var(--portal-text)" }}>
                        {item.date} ({item.daysLeft} days away)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px]" style={{ color: "var(--portal-text-muted)" }}>Allocated Tier</span>
                      <span className="font-bold" style={{ color: "var(--portal-accent)" }}>
                        {item.recommendedTier} · KES {item.tierCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 flex items-center justify-between border-t" style={{ borderColor: "var(--portal-border-soft)" }}>
                  {isCriticalPrompt && !isApproved ? (
                    <span className="text-[11px] font-bold inline-flex items-center gap-1" style={{ color: "var(--portal-stop)" }}>
                      <Clock className="w-3.5 h-3.5" /> 7-Day Action Window
                    </span>
                  ) : (
                    <span className="text-[11px]" style={{ color: "var(--portal-text-faint)" }}>
                      Auto-scheduled
                    </span>
                  )}

                  {isApproved ? (
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      style={{
                        background: "var(--portal-positive-tint)",
                        color: "var(--portal-positive)",
                      }}
                    >
                      <Check className="w-3.5 h-3.5" /> Approved for Dispatch
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-1 shadow-xs"
                      style={{
                        background: "var(--portal-accent)",
                        color: "var(--portal-accent-text)",
                      }}
                    >
                      <span>1-Tap Approve</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

