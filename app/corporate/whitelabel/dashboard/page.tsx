"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Globe, Palette, Users, CreditCard,
  Package, TrendingUp, ArrowUpRight, CheckCircle2,
  ExternalLink, ChevronRight, MessageSquare, ShieldCheck,
} from "lucide-react";
import CorporateHeader from "@/components/corporate/dashboard/CorporateHeader";
import { formatKsh } from "@/lib/utils";

export default function WhiteLabelDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "earnings">("overview");

  return (
    <div className="corporate-shell min-h-screen bg-gray-50 dark:bg-[#0B1620] text-gray-900 dark:text-zinc-100 font-sans pb-36">
      <CorporateHeader activeTabLabel="Agency Dashboard" />

      {/* Hero Strip */}
      <div className="bg-gradient-to-r from-brand/5 via-amber-500/5 to-transparent border-b border-gray-200 dark:border-white/10 py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand text-white font-bold text-[10px] uppercase tracking-wider">
                Agency Partner Console
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                Luxe Events & PR Ltd
              </span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mt-1">
              White-Label Client Gifting Hub
            </h1>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
              Live orders, client commissions, and branded storefront management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/corporate/whitelabel"
              className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Palette className="w-3.5 h-3.5" />
              Storefront Configurator
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: "Active Client Accounts", value: "14", trend: "+2 this month", icon: Users, color: "text-blue-500" },
            { label: "Hampers Dispatched", value: "128", trend: "+24% vs last month", icon: Package, color: "text-emerald-500" },
            { label: "Client Gross Turnover", value: "KSh 1.28M", trend: "Processed to date", icon: TrendingUp, color: "text-amber-500" },
            { label: "Earned Commission", value: "KSh 153.6K", trend: "12% average rate", icon: CreditCard, color: "text-brand" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                    {stat.label}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    {stat.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Orders & Commission Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Recent Client Campaign Orders
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Orders placed by your corporate clients through your white-label portal.
                </p>
              </div>
              <span className="text-xs font-semibold text-brand">Auto-Dispatched</span>
            </div>

            <div className="space-y-2.5">
              {[
                { client: "Acme Industrial PLC", date: "Today, 10:45 AM", amount: 45000, com: 5400, status: "Delivered", items: "15 Onboarding Kits" },
                { client: "TechFlow Solutions Nairobi", date: "Yesterday, 3:20 PM", amount: 120000, com: 14400, status: "Processing", items: "25 Executive VIP Hampers" },
                { client: "Nexus Media Group", date: "Oct 28, 9:00 AM", amount: 62000, com: 7440, status: "Delivered", items: "30 Custom Branded Tumblers" },
                { client: "Oasis Capital Partners", date: "Oct 24, 11:15 AM", amount: 88000, com: 10560, status: "Delivered", items: "20 Year-End Wine Sets" },
              ].map((order, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {order.client}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                      {order.items} · <span className="opacity-80">{order.date}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatKsh(order.amount)}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatKsh(order.com)} payout
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      order.status === "Delivered"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Settlement Status */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Agency Payout Status
              </h3>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-zinc-300">Ready for Withdrawal:</span>
                  <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    {formatKsh(37800)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                  Settled automatically via M-Pesa Paybill / Bank Transfer every 1st & 15th of the month.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/corporate/build"
                  className="w-full py-2.5 px-3 rounded-xl bg-brand text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Package className="w-3.5 h-3.5" />
                  Configure New Client Hamper
                </Link>

                <a
                  href="https://wa.me/254183172111?text=Hi%20TouchGift!%20Agency%20payout%20inquiry%20for%20Luxe%20Events."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  WhatsApp Concierge Desk
                </a>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                Setup Checklist
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { text: "Custom Subdomain Active", done: true },
                  { text: "Brand Colors Configured", done: true },
                  { text: "eTIMS Sub-Agent Agreement Signed", done: true },
                  { text: "M-Pesa B2B Paybill Connected", done: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-gray-700 dark:text-zinc-300 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
