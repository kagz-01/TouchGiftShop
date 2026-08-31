"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, Clock, Gift, Users, Calendar, Check, Plus,
  Settings, ArrowRight, Bell, Sparkles, Trophy,
  Cake, Briefcase, Star, ToggleLeft, ToggleRight
} from "lucide-react";

type CalendarEvent = {
  recipient_name: string;
  event_date: string;
  event_type: string;
};

type UpcomingTrigger = {
  name: string;
  date: string;
  type: string;
  days: number;
};

type MilestoneRule = {
  id: string;
  name: string;
  trigger: string;
  description: string;
  giftBudget: number;
  giftType: string;
  enabled: boolean;
  autoOrder: boolean;
  notifyHR: boolean;
  lastTriggered?: string;
  totalTriggered: number;
};

export default function AutomatedMilestones() {
  const [rules, setRules] = useState<MilestoneRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<MilestoneRule | null>(null);
  const [upcomingTriggers, setUpcomingTriggers] = useState<UpcomingTrigger[]>([]);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch("/api/corporate/milestones");
        const data = await res.json();
        if (data.rules) {
          setRules(data.rules.map((r: Record<string, unknown>) => ({
            id: r.id,
            name: r.name,
            trigger: r.trigger_type,
            description: r.description || "",
            giftBudget: r.gift_budget,
            giftType: r.gift_product_id ? "Custom Product" : "Template Gift",
            enabled: r.is_active,
            autoOrder: r.auto_order,
            notifyHR: r.notify_hr,
            lastTriggered: r.last_triggered_at,
            totalTriggered: r.total_triggered,
          })));
        }
      } catch {
        // Use empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  useEffect(() => {
    const fetchUpcomingTriggers = async () => {
      try {
        const res = await fetch("/api/corporate/calendar");
        const data = await res.json();
        if (data.events) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = (data.events as CalendarEvent[])
            .filter((e) => new Date(e.event_date) >= today)
            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
            .slice(0, 5)
            .map((e) => {
              const eventDate = new Date(e.event_date);
              const diffMs = eventDate.getTime() - today.getTime();
              const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const dateStr = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const typeLabel = e.event_type === "work_anniversary" ? "Anniversary" : e.event_type.charAt(0).toUpperCase() + e.event_type.slice(1);
              return { name: e.recipient_name, date: dateStr, type: typeLabel, days };
            });
          setUpcomingTriggers(upcoming);
        }
      } catch {
        // Use empty state on error
      }
    };
    fetchUpcomingTriggers();
  }, []);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const activeRules = rules.filter((r) => r.enabled);
  const totalTriggered = rules.reduce((sum, r) => sum + r.totalTriggered, 0);
  const monthlyBudget = activeRules.reduce((sum, r) => sum + r.giftBudget, 0);

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Automated Milestone Gifting</h1>
              <p className="text-theme-muted text-sm">Set rules, and we&apos;ll automatically send gifts for every milestone.</p>
            </div>
            <Link
              href="/corporate/milestones/add"
              className="px-5 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Rule
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Active Rules", value: activeRules.length, icon: <Zap className="w-5 h-5" />, color: "text-brand" },
              { label: "Gifts Sent", value: totalTriggered, icon: <Gift className="w-5 h-5" />, color: "text-success" },
              { label: "Monthly Budget", value: `KSh ${(monthlyBudget / 1000).toFixed(0)}K`, icon: <Sparkles className="w-5 h-5" />, color: "text-gold" },
              { label: "Next Event", value: "3 days", icon: <Clock className="w-5 h-5" />, color: "text-violet-500" },
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
        </div>
      </div>

      <div className="page-container-capped py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules list */}
          <div className="lg:col-span-2 space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`bg-white/80 backdrop-blur-sm shape-premium-card p-5 border shadow-sm cursor-pointer transition-all hover:shadow-card-hover ${
                  selectedRule?.id === rule.id ? "border-brand shadow-ribbon" : "border-surface-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 shape-premium-card flex items-center justify-center ${
                      rule.enabled ? "bg-success/10 text-success" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-theme-heading">{rule.name}</h3>
                      <p className="text-xs text-theme-muted">{rule.trigger}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleRule(rule.id); }}
                    className={`transition-colors ${rule.enabled ? "text-success" : "text-gray-300"}`}
                  >
                    {rule.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <p className="text-sm text-theme-body mb-3">{rule.description}</p>

                <div className="flex items-center gap-4 text-xs text-theme-muted">
                  <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> {rule.giftType}</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> KSh {rule.giftBudget.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {rule.totalTriggered} sent</span>
                  {rule.autoOrder && (
                    <span className="px-2 py-0.5 bg-success/10 text-success shape-premium-button text-[10px] font-semibold">Auto-Order</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {selectedRule ? (
              <>
                {/* Rule detail */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                  <h3 className="text-sm font-semibold text-theme-heading mb-3">Rule Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-surface-border">
                      <span className="text-xs text-theme-muted">Trigger</span>
                      <span className="text-xs font-semibold text-theme-heading">{selectedRule.trigger}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-surface-border">
                      <span className="text-xs text-theme-muted">Gift Type</span>
                      <span className="text-xs font-semibold text-theme-heading">{selectedRule.giftType}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-surface-border">
                      <span className="text-xs text-theme-muted">Budget</span>
                      <span className="text-xs font-semibold text-brand">KSh {selectedRule.giftBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-surface-border">
                      <span className="text-xs text-theme-muted">Auto-Order</span>
                      <span className={`text-xs font-semibold ${selectedRule.autoOrder ? "text-success" : "text-amber-500"}`}>
                        {selectedRule.autoOrder ? "Yes" : "Manual Review"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-surface-border">
                      <span className="text-xs text-theme-muted">Notify HR</span>
                      <span className={`text-xs font-semibold ${selectedRule.notifyHR ? "text-success" : "text-theme-muted"}`}>
                        {selectedRule.notifyHR ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-theme-muted">Total Triggered</span>
                      <span className="text-xs font-semibold text-theme-heading">{selectedRule.totalTriggered}</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming triggers */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                  <h3 className="text-sm font-semibold text-theme-heading mb-3">Upcoming Triggers</h3>
                  {upcomingTriggers.length === 0 ? (
                    <p className="text-xs text-theme-muted text-center py-4">No upcoming triggers</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTriggers.map((trigger, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                          <div className="w-8 h-8 bg-brand/10 shape-premium-card flex items-center justify-center">
                            {trigger.type === "Birthday" ? <Cake className="w-4 h-4 text-brand" /> : <Briefcase className="w-4 h-4 text-brand" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-theme-heading">{trigger.name}</p>
                            <p className="text-[10px] text-theme-muted">{trigger.type} · {trigger.date}</p>
                          </div>
                          <span className="text-[10px] text-theme-muted">in {trigger.days}d</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 bg-brand/5 hover:bg-brand/10 shape-premium-card transition-colors text-sm font-medium text-brand">
                    <Settings className="w-4 h-4" /> Edit Rule
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 shape-premium-card transition-colors text-sm font-medium text-amber-600">
                    <Bell className="w-4 h-4" /> Test Trigger
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-8 border border-surface-border shadow-sm text-center">
                <Zap className="w-10 h-10 text-theme-muted mx-auto mb-3" />
                <p className="text-sm text-theme-muted">Select a rule to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
