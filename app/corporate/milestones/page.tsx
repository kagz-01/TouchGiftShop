"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, Clock, Gift, Users, Calendar, Check, Plus,
  Settings, ArrowRight, Bell, Sparkles, Trophy,
  Cake, Briefcase, Star, ToggleLeft, ToggleRight
} from "lucide-react";

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

const MOCK_RULES: MilestoneRule[] = [
  {
    id: "1",
    name: "Birthday Surprise",
    trigger: "Employee birthday",
    description: "Send a personalized gift 3 days before each employee's birthday",
    giftBudget: 3500,
    giftType: "Birthday Joy Box",
    enabled: true,
    autoOrder: true,
    notifyHR: true,
    lastTriggered: "2026-08-15",
    totalTriggered: 24,
  },
  {
    id: "2",
    name: "Work Anniversary",
    trigger: "Employment anniversary",
    description: "Celebrate each year of service with an escalating gift",
    giftBudget: 5000,
    giftType: "Anniversary Hamper",
    enabled: true,
    autoOrder: true,
    notifyHR: true,
    lastTriggered: "2026-08-10",
    totalTriggered: 18,
  },
  {
    id: "3",
    name: "Promotion Celebration",
    trigger: "Job title change",
    description: "Congratulate promotions with a premium gift",
    giftBudget: 6000,
    giftType: "Executive Luxe Hamper",
    enabled: true,
    autoOrder: false,
    notifyHR: true,
    totalTriggered: 8,
  },
  {
    id: "4",
    name: "New Hire Welcome",
    trigger: "New employee added",
    description: "Welcome new team members with an onboarding kit on day 1",
    giftBudget: 2500,
    giftType: "Welcome Aboard Kit",
    enabled: true,
    autoOrder: true,
    notifyHR: false,
    lastTriggered: "2026-08-20",
    totalTriggered: 32,
  },
  {
    id: "5",
    name: "1-Year Client Anniversary",
    trigger: "Client relationship anniversary",
    description: "Thank clients on their 1-year partnership anniversary",
    giftBudget: 8000,
    giftType: "Client Appreciation Set",
    enabled: false,
    autoOrder: false,
    notifyHR: false,
    totalTriggered: 5,
  },
  {
    id: "6",
    name: "Team Milestone",
    trigger: "Project completion",
    description: "Celebrate successful project deliveries with team gifts",
    giftBudget: 2000,
    giftType: "Team Celebration Pack",
    enabled: false,
    autoOrder: false,
    notifyHR: true,
    totalTriggered: 12,
  },
];

export default function AutomatedMilestones() {
  const [rules, setRules] = useState(MOCK_RULES);
  const [selectedRule, setSelectedRule] = useState<MilestoneRule | null>(null);

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
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Wanjiku", date: "Sep 1", type: "Birthday", days: 8 },
                      { name: "James Ochieng", date: "Sep 5", type: "Anniversary", days: 12 },
                      { name: "Amina Hassan", date: "Sep 15", type: "Birthday", days: 22 },
                    ].map((trigger, i) => (
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
