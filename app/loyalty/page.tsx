"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, Gift, TrendingUp, Zap, Crown,
  Check, ChevronRight, ShoppingBag, Users, Award,
  Sparkles, Lock, Info, Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mirror of server-side lib/loyalty.ts ──
const TIERS = [
  {
    key: "bronze",
    name: "Bronze",
    color: "#CD7F32",
    bg: "from-amber-800 to-amber-600",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    discount: 0,
    minOrders: 0,
    minSpend: 0,
    multiplier: "1×",
    perks: [
      "Earn 1 pt per KSh 10 spent",
      "2 pts = KSh 1 at checkout",
      "Referral bonuses (1,000 pts per friend)",
    ],
  },
  {
    key: "silver",
    name: "Silver",
    color: "#C0C0C0",
    bg: "from-slate-400 to-slate-600",
    textColor: "text-slate-600",
    bgColor: "bg-slate-50 dark:bg-slate-900/30",
    borderColor: "border-slate-200 dark:border-slate-700",
    discount: 5,
    minOrders: 5,
    minSpend: 10000,
    multiplier: "1.5×",
    perks: [
      "5% off every order (auto-applied)",
      "1.5× points on every spend",
      "Early access to new products",
    ],
  },
  {
    key: "gold",
    name: "Gold",
    color: "#FFD700",
    bg: "from-yellow-400 to-amber-500",
    textColor: "text-amber-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    discount: 10,
    minOrders: 15,
    minSpend: 50000,
    multiplier: "2×",
    perks: [
      "10% off every order (auto-applied)",
      "2× points on every spend",
      "Free gift wrapping on all orders",
      "Priority customer support",
    ],
  },
  {
    key: "platinum",
    name: "Platinum",
    color: "#E5E4E2",
    bg: "from-slate-300 to-slate-500",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50 dark:bg-slate-800/30",
    borderColor: "border-slate-300 dark:border-slate-600",
    discount: 15,
    minOrders: 30,
    minSpend: 150000,
    multiplier: "3×",
    perks: [
      "15% off every order (auto-applied)",
      "3× points on every spend",
      "Free express delivery always",
      "Dedicated account manager",
      "Access to exclusive & limited gifts",
    ],
  },
];

interface LoyaltyData {
  tier: string;
  tierConfig?: { name: string; color: string; discount: number };
  totalOrders: number;
  totalSpend: number;
  totalPoints: number;
  totalPointsEarned: number;
  availableCredits: number;
  discountPercent: number;
  nextTier: string | null;
  ordersToNext: number;
}

function fmtKsh(n: number) {
  return `KSh ${Number(n).toLocaleString()}`;
}

function fmtPts(n: number) {
  return `${Number(n).toLocaleString()} pts`;
}

const HOW_EARN = [
  { icon: <ShoppingBag className="w-5 h-5 text-brand" />, label: "Place an order", detail: "1 pt per KSh 10 spent", highlight: false },
  { icon: <Users className="w-5 h-5 text-gold" />, label: "Refer a friend", detail: "1,000 pts when they order", highlight: true },
  { icon: <Gift className="w-5 h-5 text-coral" />, label: "Buy a gift sub", detail: "Bonus pts on subscription start", highlight: false },
];

const HOW_REDEEM = [
  { label: "Rate", value: "2 pts = KSh 1" },
  { label: "Minimum", value: "200 pts (KSh 100)" },
  { label: "Max per order", value: "Up to 50% of item value" },
];

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    fetch("/api/loyalty")
      .then((r) => r.json())
      .then((d) => {
        if (!d.tier) { setIsGuest(true); setLoading(false); return; }
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const currentTierConfig = TIERS.find((t) => t.key === (data?.tier ?? "bronze")) ?? TIERS[0];
  const nextTierConfig = data?.nextTier ? TIERS.find((t) => t.key === data.nextTier) : null;

  // Progress toward next tier (based on orders)
  const ordersProgress = nextTierConfig
    ? Math.min(100, ((data?.totalOrders ?? 0) / nextTierConfig.minOrders) * 100)
    : 100;

  const pointsValueKsh = Math.floor((data?.totalPoints ?? 0) / 2);

  if (isGuest) return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm card-theme rounded-3xl p-10 border border-surface-border shadow-soft">
        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Star className="w-8 h-8 text-brand" />
        </div>
        <h1 className="font-display text-xl font-bold text-theme-heading mb-2">Sign in to see your points</h1>
        <p className="text-sm text-theme-body mb-6">Every order earns you points. Sign in to see your balance and tier.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?next=/loyalty" className="px-6 py-3 bg-brand text-white rounded-2xl font-semibold text-sm">Sign in</Link>
          <Link href="/login?mode=signup&next=/loyalty" className="px-6 py-3 border border-surface-border text-theme-heading rounded-2xl font-semibold text-sm">Create account</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-bg pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-8">

        <div className="flex items-center justify-between">
          <Link href="/account" className="inline-flex items-center gap-2 text-sm text-theme-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Account
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-theme-muted hover:text-brand transition-colors">Home</Link>
            <Link href="/shop" className="text-brand hover:text-brand-dark transition-colors">Go to Shop</Link>
          </div>
        </div>

        {/* ── Hero: Current Tier Card ── */}
        <div className={cn("relative overflow-hidden rounded-3xl p-8 md:p-12 text-white shadow-2xl bg-gradient-to-br", currentTierConfig.bg)}>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
                <Award className="w-3.5 h-3.5" /> Loyalty Programme
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black leading-tight mb-2">
                {currentTierConfig.name}
              </h1>
              <p className="text-white/70 text-base mb-6">
                {currentTierConfig.discount > 0
                  ? `${currentTierConfig.discount}% off every order, ${currentTierConfig.multiplier} points earned`
                  : "Start earning — every KSh 10 spent = 1 point"}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Points", value: fmtPts(data?.totalPoints ?? 0) },
                  { label: "Value", value: fmtKsh(pointsValueKsh) },
                  { label: "Orders", value: data?.totalOrders ?? 0 },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                    <p className="font-display font-bold text-lg">{stat.value}</p>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              {nextTierConfig ? (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 mb-1">Progress to {nextTierConfig.name}</p>
                  <p className="font-display font-bold text-2xl mb-4">
                    {data?.totalOrders} / {nextTierConfig.minOrders} orders
                  </p>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${ordersProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-white/70">
                    {data?.ordersToNext} more order{data?.ordersToNext !== 1 ? "s" : ""} to unlock {nextTierConfig.name}
                    {nextTierConfig.discount > 0 ? ` (${nextTierConfig.discount}% off)` : ""}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-white/60 mb-2">Also need:</p>
                    <p className="text-sm font-semibold">
                      {fmtKsh(Math.max(0, nextTierConfig.minSpend - (data?.totalSpend ?? 0)))} more in spend
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Crown className="w-10 h-10 mx-auto mb-3 text-gold" />
                  <p className="font-display font-bold text-xl mb-2">Platinum Member</p>
                  <p className="text-sm text-white/70">You&apos;ve reached the highest tier. Enjoy maximum rewards!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Points Balance Banner ── */}
        {(data?.totalPoints ?? 0) > 0 && (
          <div className="card-theme rounded-2xl border border-brand/20 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-xs text-theme-muted uppercase tracking-wider">Redeemable balance</p>
                <p className="font-display font-bold text-2xl text-brand">{fmtPts(data?.totalPoints ?? 0)}</p>
                <p className="text-sm text-theme-muted">≈ {fmtKsh(pointsValueKsh)} off your next order</p>
              </div>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-2 px-5 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
            >
              Redeem at checkout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Middle row: Earn + Redeem ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* How to earn */}
          <div className="card-theme rounded-2xl border border-surface-border p-6 space-y-5">
            <h2 className="font-display font-bold text-lg text-theme-heading">How to earn points</h2>
            <div className="space-y-4">
              {HOW_EARN.map((item, i) => (
                <div key={i} className={cn("flex items-start gap-4 p-3 rounded-xl", item.highlight ? "bg-gold/5 border border-gold/20" : "")}>
                  <div className="w-10 h-10 bg-theme-surface rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-theme-heading text-sm">{item.label}</p>
                    <p className="text-xs text-theme-muted">{item.detail}</p>
                    {item.highlight && <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Best way to earn</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Tier multiplier note */}
            {currentTierConfig.key !== "bronze" && (
              <div className="p-3 bg-brand/5 border border-brand/15 rounded-xl text-sm">
                <p className="font-semibold text-theme-heading flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand" />
                  {currentTierConfig.name} bonus active
                </p>
                <p className="text-theme-muted text-xs mt-0.5">
                  You earn {currentTierConfig.multiplier} points on all orders — automatically.
                </p>
              </div>
            )}
          </div>

          {/* How to redeem */}
          <div className="card-theme rounded-2xl border border-surface-border p-6 space-y-5">
            <h2 className="font-display font-bold text-lg text-theme-heading">How to redeem</h2>

            <div className="space-y-3">
              {HOW_REDEEM.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                  <span className="text-sm text-theme-body">{item.label}</span>
                  <span className="font-semibold text-theme-heading text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Visual example */}
            <div className="bg-theme-surface rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-theme-heading text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-brand" /> Example
              </p>
              <div className="flex justify-between text-theme-body">
                <span>Order total</span>
                <span>KSh 5,000</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Your 2,000 points</span>
                <span>− KSh 1,000</span>
              </div>
              <div className="h-px bg-surface-border" />
              <div className="flex justify-between font-bold text-theme-heading">
                <span>You pay</span>
                <span>KSh 4,000</span>
              </div>
              <p className="text-[11px] text-theme-muted pt-1">Points are applied at checkout — just slide the redemption toggle.</p>
            </div>

            <Link href="/shop" className="block w-full py-3 rounded-xl bg-brand/10 text-brand font-semibold text-sm text-center hover:bg-brand/20 transition-colors">
              Shop & use your points
            </Link>
          </div>
        </div>

        {/* ── All Tiers ── */}
        <div>
          <h2 className="font-display font-bold text-2xl text-theme-heading text-center mb-2">Tier benefits</h2>
          <p className="text-center text-theme-muted text-sm mb-8">Spend more, earn more — your tier unlocks automatically.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {TIERS.map((tier) => {
              const isCurrent = tier.key === (data?.tier ?? "bronze");
              const isLocked = TIERS.indexOf(tier) > TIERS.indexOf(currentTierConfig);

              return (
                <div
                  key={tier.key}
                  className={cn(
                    "card-theme rounded-2xl border p-5 transition-all duration-300 relative",
                    isCurrent ? `${tier.borderColor} ring-2 ring-offset-1` : "border-surface-border",
                    isLocked ? "opacity-60" : "hover:shadow-card-hover"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="px-3 py-0.5 bg-brand text-white rounded-full text-[10px] font-bold uppercase tracking-wider">Current</span>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-4 h-4 text-theme-muted" />
                    </div>
                  )}

                  {/* Tier badge */}
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4", tier.bgColor, tier.borderColor, "border")}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className={cn("font-bold text-sm", tier.textColor)}>{tier.name}</span>
                  </div>

                  {/* Requirements */}
                  <p className="text-xs text-theme-muted mb-1">
                    {tier.minOrders === 0
                      ? "Start here — free to join"
                      : `${tier.minOrders}+ orders · ${fmtKsh(tier.minSpend)}+ spent`}
                  </p>

                  {/* Discount badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn("font-display font-black text-2xl", tier.textColor)}>
                      {tier.discount > 0 ? `${tier.discount}% off` : "Base"}
                    </span>
                    <span className="text-xs text-theme-muted">+ {tier.multiplier} pts</span>
                  </div>

                  {/* Perks */}
                  <div className="space-y-2">
                    {tier.perks.map((perk) => (
                      <div key={perk} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-brand" />
                        </div>
                        <span className="text-xs text-theme-body">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Revenue explainer for user (customer-facing benefits) ── */}
        <div className="card-theme rounded-2xl border border-surface-border p-6 md:p-8">
          <h3 className="font-display font-bold text-lg text-theme-heading mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" /> How quickly do I earn?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { spend: 10000, pts: 1000, value: 500, label: "Casual gifter (KSh 10k spent)" },
              { spend: 50000, pts: 5000, value: 2500, label: "Regular gifter (KSh 50k spent)" },
              { spend: 150000, pts: 15000, value: 7500, label: "Power gifter (KSh 150k spent)" },
            ].map((ex) => (
              <div key={ex.spend} className="bg-theme-surface rounded-xl p-4 space-y-2">
                <p className="text-xs text-theme-muted">{ex.label}</p>
                <p className="font-display font-bold text-xl text-brand">{fmtPts(ex.pts)}</p>
                <p className="text-sm text-theme-muted">≈ {fmtKsh(ex.value)} to spend on gifts</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-theme-muted mt-4">
            Higher tiers earn multiplied points — Gold members earn 2× and Platinum earn 3× on the same spend.
          </p>
        </div>

      </div>
    </div>
  );
}
