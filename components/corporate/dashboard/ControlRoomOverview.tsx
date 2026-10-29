"use client";

import { useState } from "react";
import WidgetActionCenter from "./WidgetActionCenter";
import WidgetBulkDispatch from "./WidgetBulkDispatch";
import WidgetMilestoneEngine from "./WidgetMilestoneEngine";
import WidgetFinanceHub from "./WidgetFinanceHub";
import QuickActionBar from "./QuickActionBar";
import { Package, DollarSign, Calendar, ShieldCheck, ChevronRight, Sparkles, Building2, CreditCard } from "lucide-react";
import Link from "next/link";

interface ControlRoomOverviewProps {
  stats: any;
  loading: boolean;
  onNavigateTab: (tab: any) => void;
  onSelectPreset?: (preset: string) => void;
}

function fmtKsh(n: number) {
  if (!n) return "KES 0";
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `KES ${Math.round(n / 1_000)}K`;
  return `KES ${n.toLocaleString()}`;
}

export default function ControlRoomOverview({
  stats,
  loading,
  onNavigateTab,
  onSelectPreset,
}: ControlRoomOverviewProps) {
  const companyName = stats?.companyName || "TouchGift Corporate";
  const isDemo = Boolean(stats?.isDemo);
  const accountTier = stats?.accountTier || "Enterprise Client";

  return (
    <div className="space-y-6">
      {/* ── Welcome & Enterprise Tier Bar ── */}
      <div
        className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: "var(--portal-surface)",
          border: "1px solid var(--portal-border)",
          boxShadow: "var(--portal-shadow)",
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0"
            style={{
              background: "var(--portal-accent-tint)",
              color: "var(--portal-accent)",
              border: "1px solid var(--portal-border-soft)",
            }}
          >
            {companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>
                {companyName}
              </h2>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "var(--portal-gold-tint)",
                  color: "var(--portal-gold)",
                }}
              >
                {accountTier}
              </span>
              {isDemo && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: "var(--portal-positive-tint)",
                    color: "var(--portal-positive)",
                  }}
                >
                  Interactive Walkthrough Mode
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
              Nairobi Corporate Control Room · Centralized Gifting, eTIMS Invoicing & Magic Links
            </p>
          </div>
        </div>

        {/* Demo Preset Switcher (allows instant testing of Safaricom / Equity / KCB) */}
        {isDemo && onSelectPreset && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl shrink-0 self-start md:self-center" style={{ background: "var(--portal-surface-2)", border: "1px solid var(--portal-border-soft)" }}>
            <span className="text-[11px] font-semibold px-2" style={{ color: "var(--portal-text-faint)" }}>
              Demo Client:
            </span>
            {(stats?.availablePresets || [
              { id: "safaricom", name: "Safaricom" },
              { id: "equity", name: "Equity" },
              { id: "kcb", name: "KCB" },
            ]).map((p: any) => (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: (stats?.demoPreset === p.id || (!stats?.demoPreset && p.id === "safaricom")) ? "var(--portal-accent)" : "transparent",
                  color: (stats?.demoPreset === p.id || (!stats?.demoPreset && p.id === "safaricom")) ? "var(--portal-accent-text)" : "var(--portal-text-muted)",
                }}
              >
                {p.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Action Tiles ── */}
      <QuickActionBar onNavigateTab={onNavigateTab} />

      {/* ── KPI Metrics Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Corporate Dispatches",
            value: stats ? String(stats.totalCorpOrders) : "—",
            sub: `${stats?.monthCorpOrders ?? 0} dispatched this month`,
            icon: Package,
            tint: "var(--portal-accent-tint)",
            color: "var(--portal-accent)",
          },
          {
            label: "Total Paid Spend",
            value: stats ? fmtKsh(stats.totalRevenuePaid) : "—",
            sub: "KRA eTIMS cleared",
            icon: DollarSign,
            tint: "var(--portal-positive-tint)",
            color: "var(--portal-positive)",
          },
          {
            label: "Outstanding Due",
            value: stats ? fmtKsh(stats.totalRevenueUnpaid) : "—",
            sub: `${stats?.unpaidInvoices ?? 0} active invoice${(stats?.unpaidInvoices ?? 0) === 1 ? "" : "s"}`,
            icon: CreditCard,
            tint: (stats?.overdueInvoices ?? 0) > 0 ? "var(--portal-stop-tint)" : "var(--portal-warn-tint)",
            color: (stats?.overdueInvoices ?? 0) > 0 ? "var(--portal-stop)" : "var(--portal-warn)",
          },
          {
            label: "Active Milestones",
            value: stats ? String(stats.activeMilestones || (stats.milestones?.length ?? 0)) : "—",
            sub: "Birthdays & Workiversaries",
            icon: Calendar,
            tint: "var(--portal-gold-tint)",
            color: "var(--portal-gold)",
          },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-2xl p-4 transition-all"
              style={{
                background: "var(--portal-surface)",
                border: "1px solid var(--portal-border)",
                boxShadow: "var(--portal-shadow)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: k.tint, color: k.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--portal-text-faint)" }}>
                  Live Ops
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight" style={{ color: "var(--portal-text)" }}>
                {loading ? "..." : k.value}
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                {k.label}
              </p>
              <p className="text-[11px] mt-2 pt-2 border-t" style={{ borderColor: "var(--portal-border-soft)", color: "var(--portal-text-faint)" }}>
                {k.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── THE 4-WIDGET CONTROL ROOM COCKPIT ── */}

      {/* Row 1: Widget 1 (Action Center) & Widget 2 (Bulk Dispatch & Magic Links) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetActionCenter
          blockers={stats?.blockers || []}
          companyName={companyName}
          onNavigateTab={onNavigateTab}
        />
        <WidgetBulkDispatch
          batches={stats?.recentBatches || []}
          companyName={companyName}
        />
      </div>

      {/* Row 2: Widget 3 (Milestone Engine) & Widget 4 (Finance & Invoicing Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetMilestoneEngine
          milestones={stats?.milestones || []}
          companyName={companyName}
        />
        <WidgetFinanceHub
          invoices={stats?.invoices || stats?.recentInvoices || []}
          companyName={companyName}
        />
      </div>

      {/* ── Recent Corporate Orders Feed ── */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--portal-surface)",
            border: "1px solid var(--portal-border)",
            boxShadow: "var(--portal-shadow)",
          }}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: "var(--portal-border-soft)" }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--portal-text)" }}>
                Recent Corporate Dispatches
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                Live dispatch log from TouchGift Concierge Fleet
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-bold flex items-center gap-1"
              style={{ color: "var(--portal-accent)" }}
            >
              <span>View All Dispatches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
            {stats.recentOrders.map((ord: any) => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--portal-accent-tint)", color: "var(--portal-accent)" }}
                  >
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--portal-text)" }}>
                      {ord.company_name || ord.sender_name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                      {ord.recipient_count || 1} Recipients · {new Date(ord.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>
                    KES {Number(ord.subtotal).toLocaleString()}
                  </p>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      background: ord.status === "delivered" ? "var(--portal-positive-tint)" : "var(--portal-warn-tint)",
                      color: ord.status === "delivered" ? "var(--portal-positive)" : "var(--portal-warn)",
                    }}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

