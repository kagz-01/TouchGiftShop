"use client";
/**
 * WelcomeOnboarding — shown once on first visit.
 *
 * HCI principles applied:
 * • Hick's Law: 3 clear paths, not 10 tabs
 * • Von Restorff: "Start Shopping" pops on amber — everything else is quiet
 * • Progressive Disclosure: features revealed step by step, not all at once
 * • Recognition over Recall: real images + plain-English benefit statements
 * • Serial Position: most important CTA is FIRST and LAST
 * • Emotional Design (Visceral level): warm, personal tone — not enterprise-cold
 */
import { useState, useEffect } from "react";
import Image from "next/image";
import { Gift, Package, Users, Target, ChevronRight, X, Sparkles, Zap } from "lucide-react";

const STORAGE_KEY = "tg_corp_welcomed_v1";

const PATHS = [
  {
    id: "shop",
    icon: Package,
    emoji: "🛍️",
    headline: "I want to browse & order gifts",
    sub: "Branded merchandise, hampers, trophies, tech — with MOQ pricing and instant quote",
    badge: "Most Popular",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    cta: "Go to Shop →",
    ctaStyle: "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200",
  },
  {
    id: "hamper",
    icon: Gift,
    emoji: "🎁",
    headline: "I want to build a custom gift hamper",
    sub: "Pick items, add recipients, submit — we handle packaging, branding and delivery",
    badge: "Best Experience",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    cta: "Build a Hamper →",
    ctaStyle: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-amber-300",
  },
  {
    id: "pools",
    icon: Target,
    emoji: "🏆",
    headline: "My team wants to pool money for a gift",
    sub: "Create a shared gift fund, share a link — colleagues contribute towards one great gift",
    badge: "Teams Love This",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    cta: "Create a Pool →",
    ctaStyle: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-amber-300",
  },
];

const STATS = [
  { val: "4 hrs", label: "Average order to delivery" },
  { val: "KES 850", label: "Minimum order value" },
  { val: "500+", label: "Corporate gift SKUs" },
  { val: "100%", label: "Invoiced & LPO ready" },
];

interface Props {
  onNavigate: (tab: string) => void;
}

export default function WelcomeOnboarding({ onNavigate }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep]       = useState<"welcome" | "paths">("welcome");

  useEffect(() => {
    // Show only on first visit; localStorage persists across refreshes
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function choose(tabId: string) {
    dismiss();
    onNavigate(tabId);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Dismiss */}
        <button onClick={dismiss} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {step === "welcome" ? (
          /* ── STEP 1: Welcome ── */
          <div>
            {/* Hero band */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 px-8 pt-10 pb-6 text-center border-b border-amber-100">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <Image src="/logo/logo.webp" alt="TouchGift" fill sizes="64px" className="rounded-2xl object-cover ring-2 ring-amber-200 shadow-lg" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full mb-4">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Corporate Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Kenya's simplest way to<br />
                <span className="text-amber-600">gift your team at scale</span>
              </h1>
              <p className="text-base text-gray-500 max-w-md mx-auto">
                Order branded gifts, build custom hampers, run team gift pools — fully invoiced, LPO-ready, delivered across Kenya.
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
              {STATS.map(s => (
                <div key={s.label} className="px-4 py-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{s.val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="px-8 py-5 flex flex-wrap items-center justify-center gap-4 border-b border-gray-100">
              {[
                "✅ Official Invoice & LPO",
                "🚀 Same-day Nairobi delivery",
                "🎁 Custom branding on all items",
                "📞 Dedicated account manager",
              ].map(b => (
                <span key={b} className="text-xs text-gray-600 font-medium">{b}</span>
              ))}
            </div>

            {/* CTA */}
            <div className="px-8 py-6 flex flex-col sm:flex-row gap-3">
              <button onClick={() => setStep("paths")}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 hover:-translate-y-0.5 active:translate-y-0">
                <Zap className="w-5 h-5" />
                Get Started — What do you need?
              </button>
              <button onClick={() => choose("overview")}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-sm rounded-xl transition-all">
                Explore the dashboard
              </button>
            </div>
          </div>
        ) : (
          /* ── STEP 2: Path chooser ── */
          <div>
            <div className="px-8 pt-8 pb-4 border-b border-gray-100">
              <button onClick={() => setStep("welcome")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4">
                <ChevronRight className="w-3 h-3 rotate-180" /> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">What would you like to do?</h2>
              <p className="text-sm text-gray-400 mt-1">Pick one to jump straight in — you can always switch tabs later</p>
            </div>

            <div className="px-6 py-5 space-y-3">
              {PATHS.map((p, i) => (
                <button key={p.id} onClick={() => choose(p.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all group hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-2xl">
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-900">{p.headline}</p>
                      <span className={`hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>{p.badge}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{p.sub}</p>
                  </div>
                  <div className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${i === 0 ? p.ctaStyle : "bg-white border border-gray-200 text-gray-600 group-hover:border-amber-300 group-hover:text-amber-700"}`}>
                    {i === 0 ? "Start →" : "→"}
                  </div>
                </button>
              ))}
            </div>

            <div className="px-8 pb-6 pt-2">
              <button onClick={() => choose("overview")}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Skip — take me to the dashboard overview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
