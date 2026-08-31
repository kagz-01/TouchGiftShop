"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette, Globe, CreditCard, Eye, Check, Upload, Crown,
  Package, TrendingUp, Lock, Code, Save, RefreshCw
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type AgencyPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  commission: string;
  popular?: boolean;
};

const PLANS: AgencyPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "For individual event planners testing the platform",
    commission: "8% per order",
    features: [
      "Basic white-label storefront",
      "Up to 50 orders/month",
      "Standard gift catalog",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "KSh 15,000",
    period: "/month",
    description: "For growing agencies with multiple clients",
    commission: "5% per order",
    features: [
      "Custom domain & branding",
      "Unlimited orders",
      "Full gift catalog + custom sourcing",
      "Client portal access",
      "Priority support",
      "API access",
      "Bulk order discounts",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large agencies and corporate gifting companies",
    commission: "2% per order",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "White-label WhatsApp bot",
      "Multi-brand support",
      "Net-30 payment terms",
      "SLA guarantee",
    ],
  },
];

export default function WhiteLabelPortal() {
  const [activeTab, setActiveTab] = useState<"preview" | "settings" | "plans">("preview");
  const [brandName, setBrandName] = useState("MyGift Agency");
  const [brandColor, setBrandColor] = useState("#9B1B5A");
  const [brandLogo, setBrandLogo] = useState("");
  const [domain, setDomain] = useState("gifts.myagency.com");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [commissionEarned, setCommissionEarned] = useState(0);

  useEffect(() => {
    fetch("/api/corporate/brand-config")
      .then(r => r.json())
      .then(d => {
        if (d.config) {
          setBrandName(d.config.company_name || "MyGift Agency");
          setBrandColor(d.config.brand_color || "#9B1B5A");
          setBrandLogo(d.config.logo_url || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/corporate/stats")
      .then(r => r.json())
      .then(d => {
        const revenue = d.totalRevenue ?? 0;
        setMonthlyRevenue(revenue);
        setCommissionEarned(Math.round(revenue * 0.05));
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
          brandColor: brandColor,
          logoUrl: brandLogo || null,
        }),
      });
      if (res.ok) {
        setSaveMsg("Brand settings saved!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch { /* noop */ }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `brand-logos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setBrandLogo(data.publicUrl);
    }
  };

  const previewProducts = [
    { name: "Executive Hamper", price: "KSh 8,500", emoji: "🎁" },
    { name: "Welcome Kit", price: "KSh 3,200", emoji: "📦" },
    { name: "Birthday Surprise", price: "KSh 4,500", emoji: "🎂" },
    { name: "Thank You Box", price: "KSh 2,800", emoji: "💝" },
    { name: "Holiday Collection", price: "KSh 5,500", emoji: "🎄" },
    { name: "Team Gift Set", price: "KSh 6,000", emoji: "👥" },
  ];

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">White-Label Portal</h1>
              <p className="text-theme-muted text-sm">Offer TouchGift under your own brand. Your clients never see our logo.</p>
            </div>
            {activeTab === "settings" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>

          {saveMsg && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 shape-premium-card text-sm text-success font-semibold">
              {saveMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: "preview" as const, label: "Storefront Preview", icon: <Eye className="w-4 h-4" /> },
              { id: "settings" as const, label: "Brand Settings", icon: <Palette className="w-4 h-4" /> },
              { id: "plans" as const, label: "Plans & Pricing", icon: <CreditCard className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 shape-premium-button text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? "bg-brand text-white" : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        {/* ═══ STOREFRONT PREVIEW ═══ */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card border border-surface-border shadow-sm overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-3 border-b border-surface-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-xs text-theme-muted font-mono">{domain}</div>
              </div>

              <div className="p-6 text-center" style={{ backgroundColor: `${brandColor}10` }}>
                {brandLogo ? (
                  <div className="w-16 h-16 mx-auto shape-premium-card overflow-hidden mb-3 relative">
                    <Image src={brandLogo} alt={brandName} fill className="object-cover" sizes="64px" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto shape-premium-card flex items-center justify-center text-white text-xl font-bold mb-3" style={{ backgroundColor: brandColor }}>
                    {brandName.charAt(0)}
                  </div>
                )}
                <h2 className="font-display italic text-2xl font-bold text-theme-heading">{brandName}</h2>
                <p className="text-theme-muted text-sm mt-1">Premium corporate gifting, curated with care</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewProducts.map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-white/5 shape-premium-card p-4 text-center hover:shadow-card-hover transition-all cursor-pointer">
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <p className="text-sm font-semibold text-theme-heading">{item.name}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: brandColor }}>{item.price}</p>
                      <button className="mt-3 w-full py-2 text-white text-xs font-semibold shape-premium-button" style={{ backgroundColor: brandColor }}>Order Now</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 text-center border-t border-surface-border">
                <p className="text-xs text-theme-muted">Powered by <span className="font-semibold text-brand">TouchGift</span> · Your brand, your storefront</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BRAND SETTINGS ═══ */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-theme-heading">Brand Identity</h3>

              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Agency Name</label>
                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Brand Color</label>
                <div className="flex gap-3 items-center">
                  {["#9B1B5A", "#D4A853", "#FF6B6B", "#10B981", "#3B82F6", "#475569"].map((c) => (
                    <button key={c} onClick={() => setBrandColor(c)} className={`w-10 h-10 rounded-full border-2 transition-all ${brandColor === c ? "border-theme-heading scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                  <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-10 h-10 rounded-full cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="brand-logo" />
                <label htmlFor="brand-logo" className="block border-2 border-dashed border-surface-border rounded-xl p-8 text-center hover:border-brand/30 transition-all cursor-pointer">
                  {brandLogo ? (
                    <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden mb-2">
                      <Image src={brandLogo} alt="Logo" fill className="object-cover" sizes="80px" />
                    </div>
                  ) : (
                    <Upload className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                  )}
                  <p className="text-sm font-semibold text-theme-heading">{brandLogo ? "Change logo" : "Upload your logo"}</p>
                  <p className="text-xs text-theme-muted">PNG, SVG. Max 2MB.</p>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Custom Domain</label>
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                <p className="text-xs text-theme-muted mt-1">Point your CNAME to <span className="font-mono">proxy.touchgift.co.ke</span></p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-theme-heading">Payment & Commission</h3>

              <div className="p-4 bg-brand/5 border border-brand/20 shape-premium-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-theme-heading">Commission Rate</span>
                  <span className="text-lg font-bold text-brand">5%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: "50%" }} />
                </div>
                <p className="text-xs text-theme-muted mt-1">Reach KSh 100K monthly sales for 3% commission</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 shape-premium-card text-center">
                  <p className="text-2xl font-bold text-theme-heading">KSh {monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-theme-muted">This month&apos;s revenue</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 shape-premium-card text-center">
                  <p className="text-2xl font-bold text-success">KSh {commissionEarned.toLocaleString()}</p>
                  <p className="text-xs text-theme-muted">Your commission earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PLANS & PRICING ═══ */}
        {activeTab === "plans" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display italic text-2xl font-bold mb-2">Choose your plan</h2>
              <p className="text-theme-muted">Scale your gifting agency with the right tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`bg-white/80 backdrop-blur-sm shape-premium-card p-6 border-2 transition-all ${plan.popular ? "border-brand shadow-ribbon" : "border-surface-border hover:border-brand/30"}`}>
                  {plan.popular && (
                    <div className="bg-brand text-white text-xs font-bold px-3 py-1 shape-premium-button inline-block mb-4">Most Popular</div>
                  )}
                  <h3 className="font-display italic text-xl font-bold text-theme-heading">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-theme-heading">{plan.price}</span>
                    <span className="text-sm text-theme-muted">{plan.period}</span>
                  </div>
                  <p className="text-sm text-theme-muted mb-4">{plan.description}</p>
                  <div className="mb-4 p-3 bg-success/5 border border-success/20 shape-premium-card">
                    <p className="text-xs text-success font-semibold">Commission: {plan.commission}</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-body">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 shape-premium-card font-semibold text-sm transition-all ${plan.popular ? "bg-brand text-white hover:bg-brand-dark" : "bg-brand/10 text-brand hover:bg-brand/20"}`}>
                    {plan.price === "Custom" ? "Contact Sales" : plan.price === "Free" ? "Get Started" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
