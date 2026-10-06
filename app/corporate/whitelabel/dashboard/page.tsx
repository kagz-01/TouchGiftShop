"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, Settings, Globe, Palette, Users, CreditCard, 
  Package, TrendingUp, Download, ArrowUpRight, CheckCircle2,
  Image as ImageIcon
} from "lucide-react";
import BackToHome from "@/components/ui/BackToHome";

export default function WhiteLabelDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "branding" | "clients" | "earnings">("overview");

  return (
    <div className="min-h-screen bg-[#14080D] text-white">
      {/* Header */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                <Building2 className="w-3.5 h-3.5" />
                Agency Portal
              </div>
              <h1 className="font-display italic text-2xl font-bold text-white">Luxe Events Co.</h1>
              <p className="text-white/60 text-sm">Manage your white-label gifting experience.</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="https://gifts.luxeevents.co.ke"
                target="_blank"
                className="px-5 py-3 bg-cyan-500 text-white rounded-xl font-semibold text-sm hover:bg-cyan-600 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <Globe className="w-4 h-4" /> View Live Portal
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-max border border-white/10">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "branding", label: "Branding", icon: Palette },
              { id: "clients", label: "Clients", icon: Users },
              { id: "earnings", label: "Earnings", icon: CreditCard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-cyan-400 shadow-sm" 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Active Clients", value: "14", trend: "+2 this month", icon: Users, color: "text-blue-400" },
                { label: "Orders Processed", value: "128", trend: "+24% vs last month", icon: Package, color: "text-emerald-400" },
                { label: "Total Revenue", value: "KSh 1.2M", trend: "+12% vs last month", icon: TrendingUp, color: "text-cyan-400" },
                { label: "Earned Commission", value: "KSh 144K", trend: "12% average rate", icon: CreditCard, color: "text-amber-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-xs text-white/60 mb-2">{stat.label}</p>
                  <p className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md w-max">
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Recent Client Orders</h3>
                  <button className="text-xs font-semibold text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
                    View All <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { client: "Acme Corp", date: "Today, 10:45 AM", amount: "KSh 45,000", status: "Delivered", com: "KSh 5,400" },
                    { client: "TechFlow Solutions", date: "Yesterday, 3:20 PM", amount: "KSh 120,000", status: "Processing", com: "KSh 14,400" },
                    { client: "Nexus Industries", date: "Oct 4, 9:00 AM", amount: "KSh 15,000", status: "Dispatched", com: "KSh 1,800" },
                  ].map((order, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="font-semibold text-white text-sm">{order.client}</p>
                        <p className="text-xs text-white/50">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-sm">{order.amount}</p>
                        <p className="text-xs text-cyan-400">+{order.com} commission</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
                          order.status === "Processing" ? "bg-amber-500/10 text-amber-400" :
                          "bg-blue-500/10 text-blue-400"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6">Portal Setup</h3>
                <div className="space-y-4">
                  {[
                    { label: "Custom Domain", desc: "gifts.luxeevents.co.ke", done: true },
                    { label: "Brand Colors", desc: "Navy & Gold configuration", done: true },
                    { label: "Upload Logo", desc: "High-res PNG added", done: true },
                    { label: "Payment Gateway", desc: "Connect your Stripe/Pesapal", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`mt-0.5 ${step.done ? "text-emerald-400" : "text-white/20"}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${step.done ? "text-white" : "text-white/60"}`}>{step.label}</p>
                        <p className="text-xs text-white/40">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-colors border border-white/10">
                  Complete Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6">Logos & Assets</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2">Primary Logo (Light & Dark)</label>
                    <div className="flex gap-4">
                      <div className="w-32 h-20 bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-cyan-400/50 transition-colors cursor-pointer">
                        <ImageIcon className="w-6 h-6 text-white/40" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2">Favicon</label>
                    <div className="w-16 h-16 bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-cyan-400/50 transition-colors cursor-pointer">
                      <ImageIcon className="w-5 h-5 text-white/40" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6">Custom Domain</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2">Your Portal URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        defaultValue="gifts.luxeevents.co.ke" 
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors">
                        Verify
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 mt-2">Point your CNAME record to portal.touchgift.co.ke</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Brand Colors</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-3">Primary Color</label>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0f172a] border-2 border-white/20" />
                    <input 
                      type="text" 
                      defaultValue="#0f172a" 
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-3">Accent / Button Color</label>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37] border-2 border-white/20" />
                    <input 
                      type="text" 
                      defaultValue="#d4af37" 
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-4">Live Preview</h4>
                  <div className="bg-white rounded-xl overflow-hidden border border-white/20">
                    <div className="h-16 bg-[#0f172a] flex items-center px-4">
                      <div className="w-24 h-6 bg-white/20 rounded" />
                    </div>
                    <div className="p-6">
                      <div className="w-3/4 h-8 bg-gray-200 rounded mb-4" />
                      <div className="w-full h-4 bg-gray-100 rounded mb-2" />
                      <div className="w-5/6 h-4 bg-gray-100 rounded mb-6" />
                      <button className="px-6 py-2 bg-[#d4af37] text-white rounded-lg text-sm font-semibold">
                        Action Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients and Earnings tabs would go here, omitting for brevity */}
        {(activeTab === "clients" || activeTab === "earnings") && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{activeTab === "clients" ? "Client Management" : "Earnings & Payouts"}</h2>
            <p className="text-white/60">This section is available on the Growth plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
