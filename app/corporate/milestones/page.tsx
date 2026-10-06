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

  const toggleRule = async (id: string) => {
    const ruleToToggle = rules.find((r) => r.id === id);
    if (!ruleToToggle) return;
    
    const newVal = !ruleToToggle.enabled;
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: newVal } : r)));
    
    try {
      await fetch("/api/corporate/milestones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: newVal })
      });
    } catch {
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !newVal } : r)));
    }
  };

  const activeRules = rules.filter((r) => r.enabled);
  const totalTriggered = rules.reduce((sum, r) => sum + r.totalTriggered, 0);
  const monthlyBudget = activeRules.reduce((sum, r) => sum + r.giftBudget, 0);

  return (
    <div className="min-h-screen bg-[#14080D] text-white">
      {/* Header */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold text-violet-400">Automated Milestone Gifting</h1>
              <p className="text-white/60 text-sm">Set rules, and we&apos;ll automatically send gifts for every milestone.</p>
            </div>
            <Link
              href="/corporate/milestones/add"
              className="px-5 py-3 bg-violet-500 text-white rounded-xl font-semibold text-sm hover:bg-violet-600 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              <Plus className="w-4 h-4" /> New Rule
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Active Rules", value: activeRules.length, icon: <Zap className="w-5 h-5" />, color: "text-violet-400" },
              { label: "Gifts Sent", value: totalTriggered, icon: <Gift className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Monthly Budget", value: `KSh ${(monthlyBudget / 1000).toFixed(0)}K`, icon: <Sparkles className="w-5 h-5" />, color: "text-violet-300" },
              { label: "Next Event", value: "3 days", icon: <Clock className="w-5 h-5" />, color: "text-fuchsia-400" },
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
                className={`bg-white/5 backdrop-blur-md rounded-2xl p-5 border shadow-lg cursor-pointer transition-all hover:border-violet-400/50 ${
                  selectedRule?.id === rule.id ? "border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]" : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      rule.enabled ? "bg-violet-400/20 text-violet-400" : "bg-white/5 text-white/40"
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                      <p className="text-xs text-white/60">{rule.trigger}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleRule(rule.id); }}
                    className={`transition-colors ${rule.enabled ? "text-violet-400" : "text-white/20"}`}
                  >
                    {rule.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <p className="text-sm text-white/80 mb-3">{rule.description}</p>

                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> {rule.giftType}</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> KSh {rule.giftBudget.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {rule.totalTriggered} sent</span>
                  {rule.autoOrder && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-semibold border border-emerald-500/30">Auto-Order</span>
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
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Rule Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Trigger</span>
                      <span className="text-xs font-semibold text-white">{selectedRule.trigger}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Gift Type</span>
                      <span className="text-xs font-semibold text-white">{selectedRule.giftType}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Budget</span>
                      <span className="text-xs font-semibold text-violet-400">KSh {selectedRule.giftBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Auto-Order</span>
                      <span className={`text-xs font-semibold ${selectedRule.autoOrder ? "text-emerald-400" : "text-amber-400"}`}>
                        {selectedRule.autoOrder ? "Yes" : "Manual Review"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-xs text-white/60">Notify HR</span>
                      <span className={`text-xs font-semibold ${selectedRule.notifyHR ? "text-emerald-400" : "text-white/40"}`}>
                        {selectedRule.notifyHR ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-white/60">Total Triggered</span>
                      <span className="text-xs font-semibold text-white">{selectedRule.totalTriggered}</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming triggers */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Upcoming Triggers</h3>
                  {upcomingTriggers.length === 0 ? (
                    <p className="text-xs text-white/40 text-center py-4">No upcoming triggers</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTriggers.map((trigger, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl">
                          <div className="w-8 h-8 bg-violet-400/10 rounded-lg flex items-center justify-center">
                            {trigger.type === "Birthday" ? <Cake className="w-4 h-4 text-violet-400" /> : <Briefcase className="w-4 h-4 text-violet-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{trigger.name}</p>
                            <p className="text-[10px] text-white/60">{trigger.type} · {trigger.date}</p>
                          </div>
                          <span className="text-[10px] text-white/60">in {trigger.days}d</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 bg-violet-400/10 hover:bg-violet-400/20 border border-transparent hover:border-violet-400/30 rounded-xl transition-colors text-sm font-medium text-violet-400">
                    <Settings className="w-4 h-4" /> Edit Rule
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 rounded-xl transition-colors text-sm font-medium text-amber-400">
                    <Bell className="w-4 h-4" /> Test Trigger
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-lg text-center">
                <Zap className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/60">Select a rule to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
