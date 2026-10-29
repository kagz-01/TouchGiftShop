"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatKsh } from "@/lib/utils";

interface TierPreview {
  minAmount: number;
  title: string;
  description: string;
  badge: string;
  sampleItems: string[];
}

const TIERS: TierPreview[] = [
  {
    minAmount: 5000,
    title: "Artisanal Treat Box",
    description: "Curated Kenyan single-origin chocolates, roasted macadamia nuts & artisanal tea.",
    badge: "Budget Friendly",
    sampleItems: ["Handmade Truffles", "Gourmet Macadamias", "Kericho Reserve Tea", "Custom Card"],
  },
  {
    minAmount: 12000,
    title: "Celebration Hamper",
    description: "Fine wine or sparkling cider, premium glass tumblers, luxury scented candle & sweet treats.",
    badge: "Most Popular",
    sampleItems: ["Robertson Winery Reserve", "2x Engraved Tumblers", "Soy Scented Candle", "Wax-Sealed Card"],
  },
  {
    minAmount: 25000,
    title: "Executive Luxury Crate",
    description: "Single Malt Whisky or Moët Champagne, leather-bound desk planner, imported confection & fresh orchids.",
    badge: "Corporate & Milestones",
    sampleItems: ["Glenfiddich 12YO / Moët", "Genuine Leather Journal", "Swiss Lindt Selection", "Calligraphy Signed Card"],
  },
  {
    minAmount: 45000,
    title: "Presidential Gilded Suite",
    description: "Bespoke mahogany chest, designer fragrance, crystal glassware, bespoke plaque & premium champagne.",
    badge: "Ultimate VIP",
    sampleItems: ["Designer Eau de Parfum", "Dom Pérignon Vintage", "Handcrafted Wood Chest", "Engraved Brass Plaque"],
  },
];

export default function PoolGiftShowcase() {
  const [peopleCount, setPeopleCount] = useState<number>(6);
  const [perPersonAmount, setPerPersonAmount] = useState<number>(2500);

  const totalPot = peopleCount * perPersonAmount;

  // Determine active tier based on totalPot
  const currentTier = [...TIERS].reverse().find((t) => totalPot >= t.minAmount) ?? TIERS[0];

  const chipOptions = [1000, 2000, 2500, 5000, 7500];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-surface-primary via-surface-secondary/40 to-surface-primary border-y border-surface-border relative overflow-hidden">
      {/* Decorative ambient orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/20 text-brand dark:text-brand-light text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Collaborative Gifting · Zero Awkward Chasing</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-theme-heading leading-tight mb-3">
            Split the cost. <span className="text-gradient bg-gradient-to-r from-brand to-gold bg-clip-text text-transparent">Multiply the luxury.</span>
          </h2>
          <p className="text-theme-body text-sm md:text-base leading-relaxed">
            Weddings, baby showers, office goodbyes, or landmark birthdays: pool contributions effortlessly via M-Pesa. Everyone chips in, we deliver one magnificent gift with all your names signed.
          </p>
        </div>

        {/* Interactive Calculator & Outcome Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Controls side (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-white/[0.03] border border-surface-border rounded-3xl p-6 sm:p-8 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg md:text-xl text-theme-heading">
                Interactive Pool Simulator
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant M-Pesa Links
              </span>
            </div>

            {/* Slider: Number of contributors */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-theme-body/80">
                  Number of Contributors
                </label>
                <span className="font-display font-bold text-lg text-brand dark:text-brand-light">
                  {peopleCount} {peopleCount === 1 ? "person" : "people"}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full h-2 bg-surface-secondary rounded-lg appearance-none cursor-pointer accent-brand"
                aria-label="Number of contributors"
              />
              <div className="flex justify-between text-[11px] text-theme-body/50 mt-1">
                <span>2 (Duo)</span>
                <span>10 (Friends squad)</span>
                <span>25 (Whole team)</span>
              </div>
            </div>

            {/* Selector: Contribution per person */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-body/80 mb-2.5">
                Contribution per Person
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {chipOptions.map((amt) => {
                  const active = perPersonAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPerPersonAmount(amt)}
                      className={`py-2 px-1 text-center rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        active
                          ? "bg-brand text-white border-brand shadow-sm scale-102"
                          : "bg-surface-secondary/50 text-theme-heading border-surface-border hover:border-brand/40"
                      }`}
                    >
                      {formatKsh(amt)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Math Callout */}
            <div className="p-4 rounded-2xl bg-brand/5 dark:bg-brand/10 border border-brand/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-theme-body/70">Calculated Group Budget</p>
                <div className="text-2xl sm:text-3xl font-display font-bold text-brand dark:text-brand-light">
                  {formatKsh(totalPot)}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block text-[11px] font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30">
                  {peopleCount} × {formatKsh(perPersonAmount)} each
                </span>
                <p className="text-[11px] text-theme-body/60 mt-1">Automated receipts & tracking</p>
              </div>
            </div>

            {/* 3 Steps Mini-Strip */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-surface-border text-center">
              <div>
                <div className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold mx-auto mb-1.5 flex items-center justify-center">1</div>
                <p className="font-semibold text-xs text-theme-heading">Create Pool</p>
                <p className="text-[10px] text-theme-body/60 mt-0.5">Free, 60 seconds</p>
              </div>
              <div>
                <div className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold mx-auto mb-1.5 flex items-center justify-center">2</div>
                <p className="font-semibold text-xs text-theme-heading">WhatsApp Share</p>
                <p className="text-[10px] text-theme-body/60 mt-0.5">M-Pesa STK push</p>
              </div>
              <div>
                <div className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold mx-auto mb-1.5 flex items-center justify-center">3</div>
                <p className="font-semibold text-xs text-theme-heading">VIP Delivery</p>
                <p className="text-[10px] text-theme-body/60 mt-0.5">Wax-sealed card</p>
              </div>
            </div>
          </div>

          {/* Outcome & Wax-Sealed Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#12121e] to-[#1c1825] text-white border border-white/10 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/15 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest text-gold font-bold px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                  {currentTier.badge}
                </span>
                <span className="text-xs text-white/50">Unlocked tier</span>
              </div>

              <h4 className="font-display text-xl sm:text-2xl font-bold mb-2 text-white">
                {currentTier.title}
              </h4>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-5">
                {currentTier.description}
              </p>

              {/* What's included preview */}
              <div className="space-y-2 mb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Includes in the hamper:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {currentTier.sampleItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-white/90">
                      <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wax seal keepsake card preview */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm mb-6">
                <div className="flex items-center justify-between text-[11px] text-white/60 mb-1">
                  <span>Signatures on card</span>
                  <span className="text-gold font-semibold">Wax-Sealed Touch</span>
                </div>
                <p className="text-xs italic text-white/90 line-clamp-1">
                  &ldquo;With love from {peopleCount > 3 ? "Sarah, Kevin, David & 3 others" : "Sarah & friends"}&rdquo;
                </p>
              </div>

              {/* Action */}
              <Link
                href="/pool/create"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-[#E5BE6C] text-[#1a0a10] font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl hover:brightness-105 transition-all shadow-md hover:shadow-lg group"
              >
                <span>Start a Gift Pool</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Safety & Auto-Refund Guarantee Card */}
            <div className="bg-white dark:bg-white/[0.03] border border-surface-border rounded-2xl p-4 flex items-center gap-3.5 text-xs text-theme-body">
              <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-theme-heading">100% Risk-Free Guarantee</p>
                <p className="text-[11px] text-theme-body/70">
                  Target not met before the event? Contributors can extend, top up, or trigger instant automated M-Pesa refunds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

