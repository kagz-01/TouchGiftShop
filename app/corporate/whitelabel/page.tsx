"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette, Globe, CreditCard, Eye, Check, Upload, Crown,
  Package, TrendingUp, ShieldCheck, ArrowRight, Save, RefreshCw,
  Smartphone, Monitor, Sparkles, MessageSquare, DollarSign, Building2,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";
import CorporateHeader from "@/components/corporate/dashboard/CorporateHeader";

type AgencyPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  commission: string;
  badge?: string;
  popular?: boolean;
};

const AGENCY_PLANS: AgencyPlan[] = [
  {
    id: "starter",
    name: "Independent Planner",
    price: "Free",
    period: "forever",
    tagline: "For boutique wedding planners & freelance corporate event coordinators.",
    commission: "8% commission per order",
    features: [
      "Branded client presentation links",
      "Up to 30 bulk client orders / month",
      "Complete TouchGift brandable catalog",
      "Automated eTIMS procurement receipts",
      "Standard email & WhatsApp support",
    ],
  },
  {
    id: "professional",
    name: "Agency Partner Tier",
    price: "KSh 15,000",
    period: "/month",
    tagline: "For PR, creative agencies & marketing firms handling corporate client accounts.",
    commission: "15% wholesale discount + 5% payout",
    badge: "Most Popular",
    popular: true,
    features: [
      "Custom domain (gifts.yourbrand.co.ke)",
      "100% white-label: clients never see TouchGift",
      "Unlimited client gifting campaigns",
      "Co-branded 3D proofs & PDF proformas",
      "Direct rider dispatch & recipient pin tracking",
      "Dedicated corporate concierge manager",
      "Priority 24-hour delivery turnaround",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Fleet",
    price: "Custom",
    period: "annual",
    tagline: "For multi-national PR conglomerates and enterprise loyalty fulfillment.",
    commission: "Wholesale contract pricing",
    features: [
      "All Professional tier capabilities",
      "Multi-brand client accounts (unlimited sub-agencies)",
      "Direct ERP & HRMS webhook integrations",
      "Custom product manufacturing & sourcing",
      "Net-30 / Net-60 procurement terms & LPO credit",
      "SLA guarantee with dedicated account director",
    ],
  },
];

const PREVIEW_GIFTS = [
  { name: "Executive Leather Folio & Pen Set", price: 4200, category: "Executive" },
  { name: "Thermal Vacuum Tumbler & Artisan Roast", price: 3100, category: "Welcome Kit" },
  { name: "Luxury Champagne & Truffle Hamper", price: 6800, category: "VIP Celebration" },
  { name: "Conference Swag Tote & Water Bottle", price: 1950, category: "Event Swag" },
];

export default function WhiteLabelPortal() {
  const [activeTab, setActiveTab] = useState<"preview" | "settings" | "plans">("preview");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");

  // White-label branding state
  const [brandName, setBrandName] = useState("Horizon Media & Events");
  const [tagline, setTagline] = useState("Curated Gifting & Premium Merchandise");
  const [brandColor, setBrandColor] = useState("#9B1B5A");
  const [brandLogo, setBrandLogo] = useState("");
  const [domain, setDomain] = useState("gifts.horizonagency.co.ke");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Quick preset colors (brand-compliant, no purple)
  const PRESET_COLORS = ["#9B1B5A", "#0F766E", "#1E3A8A", "#D97706", "#18181B", "#B91C1C"];

  useEffect(() => {
    fetch("/api/corporate/brand-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.config) {
          if (d.config.company_name) setBrandName(d.config.company_name);
          if (d.config.brand_color) setBrandColor(d.config.brand_color);
          if (d.config.logo_url) setBrandLogo(d.config.logo_url);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/corporate/brand-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: brandName,
          brandColor,
          logoUrl: brandLogo || null,
        }),
      });

      if (res.ok) {
        setSaveMsg("White-label settings saved successfully!");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg("Changes saved locally for this session.");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch {
      setSaveMsg("Saved locally for simulator session.");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const agencyWhatsAppHref = `https://wa.me/254183172111?text=${encodeURIComponent(
    `Hi TouchGift! I'm interested in the Agency White-Label Partnership for "${brandName}". We'd like to discuss custom domains, client billing, and wholesale fulfillment terms.`
  )}`;

  return (
    <div className="corporate-shell min-h-screen bg-gray-50 dark:bg-[#0B1620] text-gray-900 dark:text-zinc-100 font-sans pb-36">
      <CorporateHeader activeTabLabel="White-Label Portal" />

      {/* Hero Strip */}
      <div className="bg-gradient-to-r from-brand/5 via-amber-500/5 to-transparent border-b border-gray-200 dark:border-white/10 py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand text-white font-bold text-[10px] uppercase tracking-wider">
                B2B Agency Reseller Platform
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                100% Unbranded Fulfillment
              </span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mt-1">
              White-Label Corporate Gifting Portal
            </h1>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Sell luxury corporate gifts, onboarding packs, and custom branded merchandise under <strong>your agency&apos;s brand</strong>. Your clients never see TouchGift — we manufacture, assemble, and dispatch in the background.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={agencyWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Apply for Agency Access
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: "preview" as const, label: "Live Storefront Simulator", icon: Eye },
              { id: "settings" as const, label: "Agency Brand Settings", icon: Palette },
              { id: "plans" as const, label: "Partner Tiers & Economics", icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                    isActive
                      ? "bg-brand text-white shadow-sm -translate-y-0.5"
                      : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "preview" && (
            <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-200 dark:bg-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewportMode === "desktop"
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewportMode === "mobile"
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Mobile</span>
              </button>
            </div>
          )}
        </div>

        {saveMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* ═══ TAB 1: LIVE STOREFRONT SIMULATOR ═══ */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
              <p>
                Interactive simulation of how your corporate clients will experience your branded gifting portal:
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="text-brand font-bold hover:underline"
              >
                Edit Brand & Colors →
              </button>
            </div>

            {/* Browser Frame */}
            <div
              className={`mx-auto bg-white dark:bg-[#121B26] rounded-3xl border border-gray-300 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-300 ${
                viewportMode === "mobile" ? "max-w-sm ring-8 ring-gray-900/10 dark:ring-white/5" : "w-full"
              }`}
            >
              {/* Browser URL Bar */}
              <div className="bg-gray-100 dark:bg-[#0E1520] px-4 py-2.5 flex items-center gap-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-rose-400 rounded-full inline-block" />
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block" />
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block" />
                </div>
                <div className="flex-1 bg-white dark:bg-zinc-800 rounded-lg px-3 py-1 text-xs text-gray-600 dark:text-zinc-300 font-mono truncate border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-gray-400">https://</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{domain}</span>
                </div>
              </div>

              {/* Client Branded Header */}
              <div
                className="p-6 text-center transition-colors"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}18 0%, ${brandColor}06 100%)`,
                  borderBottom: `2px solid ${brandColor}30`,
                }}
              >
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md transition-all"
                  style={{ backgroundColor: brandColor }}
                >
                  {brandLogo ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <Image src={brandLogo} alt={brandName} fill className="object-cover" />
                    </div>
                  ) : (
                    brandName.charAt(0)
                  )}
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">
                  {brandName}
                </h2>
                <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 max-w-md mx-auto">
                  {tagline}
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    Client Procurement Active
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    LPO & Direct Bank Settlement
                  </span>
                </div>
              </div>

              {/* Sample Catalog Products as Seen by Client */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Corporate Hampers & Brandables
                  </h3>
                  <span className="text-[11px] text-gray-500">Wholesale Volume Guaranteed</span>
                </div>

                <div className={`grid gap-3 ${viewportMode === "mobile" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"}`}>
                  {PREVIEW_GIFTS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-zinc-800/40 hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2">
                          {item.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
                        <span className="text-[10px] text-gray-400 block">Client Rate</span>
                        <p className="font-bold text-xs" style={{ color: brandColor }}>
                          {formatKsh(item.price)}
                        </p>
                        <button
                          type="button"
                          className="w-full mt-2 py-1.5 rounded-lg text-white font-bold text-[10px] shadow-xs"
                          style={{ backgroundColor: brandColor }}
                        >
                          Select for Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* White-Label Footer */}
              <div className="p-4 bg-gray-50 dark:bg-[#0E1520] border-t border-gray-200 dark:border-white/10 text-center text-xs text-gray-500 dark:text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                <span>© {new Date().getFullYear()} {brandName}. All rights reserved.</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Encrypted B2B Portal · Powered by Secure Fulfillment
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: AGENCY BRAND SETTINGS ═══ */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                White-Label Storefront Identity
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Configure your agency branding. These parameters reflect in the live simulator and your agency quote links.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                  Agency / Brand Name *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Apex PR & Events"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                  Subdomain or Custom URL *
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="gifts.youragency.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Storefront Greeting / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Curated Executive Gifting by Apex PR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
              />
            </div>

            {/* Brand Accent Color */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-2">
                Primary Brand Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className={`w-9 h-9 rounded-xl transition-transform flex items-center justify-center text-white ${
                      brandColor.toLowerCase() === c.toLowerCase() ? "scale-110 ring-2 ring-brand ring-offset-2" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {brandColor.toLowerCase() === c.toLowerCase() && <Check className="w-4 h-4" />}
                  </button>
                ))}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
                  <span className="text-xs font-mono text-gray-500">Hex:</span>
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-20 text-xs font-mono font-bold bg-transparent outline-none uppercase"
                  />
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-deep text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 min-h-[44px]"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Update Simulator
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className="px-5 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
              >
                View Live Simulator
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: PARTNER TIERS & ECONOMICS ═══ */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">
                Agency Partnership Tiers & Revenue Share
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Choose how your agency earns from corporate gifting fulfillment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {AGENCY_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border-2 flex flex-col justify-between transition-all ${
                    plan.popular
                      ? "border-brand bg-brand/[0.02] dark:bg-brand/[0.06] shadow-md ring-1 ring-brand/30 -translate-y-1"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand text-white">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="font-display font-bold text-3xl text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-xs text-gray-500">/{plan.period}</span>
                    </div>

                    <p className="text-xs text-brand font-bold mb-3">
                      {plan.commission}
                    </p>

                    <p className="text-xs text-gray-600 dark:text-zinc-400 mb-5 leading-relaxed">
                      {plan.tagline}
                    </p>

                    <div className="space-y-2 border-t border-gray-100 dark:border-white/5 pt-4 text-xs text-gray-700 dark:text-zinc-300">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={agencyWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-6 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      plan.popular
                        ? "bg-brand hover:bg-brand-deep text-white"
                        : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    <span>Select {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>

            {/* Procurement Guarantee */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#121B26] border border-gray-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs text-gray-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>eTIMS compliant invoice split: Your agency receives a registered sub-agent commission slip with zero tax complexity.</span>
              </div>
              <Link
                href="/corporate/vendor-pack"
                className="font-bold text-brand hover:underline flex items-center gap-1"
              >
                View Procurement Vendor Pack <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
