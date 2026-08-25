"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Crown, Check, Plus, Trash2,
  Pause, Play, X, UserRound, Phone, Heart, Cake,
  Wallet, Bell, Gift, Users, Zap, ChevronRight, Star,
  TrendingUp, AlertCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Recipient {
  name: string;
  phone: string;
  relationship: string;
  occasion: string;
  occasionMonth: string;
  occasionDay: string;
  budgetRange: string;
  preferences: string;
}

interface SubscriptionRecipient {
  id: string;
  recipient_name: string;
  recipient_phone: string | null;
  relationship: string | null;
  occasion: string | null;
  occasion_month: number | null;
  occasion_day: number | null;
  budget_range: string;
  preferences: string | null;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  monthly_savings_contribution: number;
  platform_fee: number;
  monthly_price: number;
  wallet_balance: number;
  recipient_count: number;
  max_recipients: number;
  next_billing_date: string;
  subscription_recipients: SubscriptionRecipient[];
}

const PLAN_CONFIG = [
  {
    key: "starter",
    name: "Starter",
    platformFee: 200,
    maxRecipients: 3,
    badge: null,
    icon: <Star className="w-5 h-5 text-white" />,
    gradient: "from-slate-500 to-slate-700",
    minSavings: 500,
    suggestedSavings: [1000, 2000, 3000],
  },
  {
    key: "family",
    name: "Family",
    platformFee: 500,
    maxRecipients: 10,
    badge: "Most Popular",
    icon: <Users className="w-5 h-5 text-white" />,
    gradient: "from-brand to-brand-deep",
    minSavings: 2000,
    suggestedSavings: [3000, 5000, 8000],
  },
  {
    key: "executive",
    name: "Executive",
    platformFee: 1000,
    maxRecipients: 25,
    badge: "Best Value",
    icon: <Crown className="w-5 h-5 text-white" />,
    gradient: "from-gold to-amber-600",
    minSavings: 5000,
    suggestedSavings: [8000, 15000, 25000],
  },
];

const RELATIONSHIPS = ["Partner", "Parent", "Sibling", "Child", "Friend", "Colleague", "Client", "Mentor"];
const OCCASIONS = ["Birthday", "Anniversary", "Valentine's Day", "Christmas", "Mother's Day", "Father's Day", "Graduation", "Wedding"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BUDGETS = [
  { value: "1000-2000", label: "KSh 1,000 – 2,000" },
  { value: "2000-5000", label: "KSh 2,000 – 5,000" },
  { value: "5000-10000", label: "KSh 5,000 – 10,000" },
  { value: "10000-20000", label: "KSh 10,000 – 20,000" },
];

function emptyRecipient(): Recipient {
  return { name: "", phone: "", relationship: "", occasion: "Birthday", occasionMonth: "", occasionDay: "", budgetRange: "2000-5000", preferences: "" };
}

function fmtKsh(n: number) {
  return `KSh ${Number(n).toLocaleString()}`;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [step, setStep] = useState<"plans" | "configure" | "recipients" | "success">("plans");
  const [selectedPlan, setSelectedPlan] = useState<typeof PLAN_CONFIG[0] | null>(null);
  const [monthlySavings, setMonthlySavings] = useState<number>(2000);
  const [customSavings, setCustomSavings] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([emptyRecipient()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setIsAuthenticated(false);
        setSubscriptions(d.subscriptions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeSubscription = subscriptions.find((s) => s.status === "active" || s.status === "paused");

  function updateRecipient(i: number, field: keyof Recipient, v: string) {
    setRecipients((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: v } : r));
  }

  async function handleAction(id: string, action: "pause" | "resume" | "cancel") {
    const res = await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      setSubscriptions((prev) => prev.map((s) =>
        s.id === id
          ? { ...s, status: action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled" }
          : s
      ));
    }
  }

  async function handleSubscribe() {
    if (!selectedPlan) return;
    const validRecipients = recipients.filter((r) => r.name.trim());
    if (!validRecipients.length) { setError("Add at least one recipient."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan.key,
          monthlySavings,
          recipients: validRecipients.map((r) => ({
            name: r.name, phone: r.phone || null,
            relationship: r.relationship || null, occasion: r.occasion || null,
            occasionMonth: r.occasionMonth ? parseInt(r.occasionMonth) : null,
            occasionDay: r.occasionDay ? parseInt(r.occasionDay) : null,
            budgetRange: r.budgetRange, preferences: r.preferences || null,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to create subscription.");
      const data = await res.json();
      setSubscriptions((prev) => [data.subscription, ...prev]);
      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm card-theme rounded-3xl p-10 border border-surface-border shadow-soft">
        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Wallet className="w-8 h-8 text-brand" />
        </div>
        <h1 className="font-display text-xl font-bold text-theme-heading mb-2">Sign in to subscribe</h1>
        <p className="text-sm text-theme-body mb-6">Create an account to start your gift savings plan.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?next=/subscriptions" className="px-6 py-3 bg-brand text-white rounded-2xl font-semibold text-sm">Sign in</Link>
          <Link href="/login?mode=signup&next=/subscriptions" className="px-6 py-3 border border-surface-border text-theme-heading rounded-2xl font-semibold text-sm">Create account</Link>
        </div>
      </div>
    </div>
  );

  // ── Success screen ──
  if (step === "success") return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md card-theme rounded-3xl p-10 border border-surface-border shadow-soft">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-theme-heading mb-3">You&apos;re saving! 🎉</h2>
        <p className="text-theme-body mb-2">
          {fmtKsh(monthlySavings)} will be added to your Gift Wallet every month.
        </p>
        <p className="text-sm text-theme-muted mb-6">
          We&apos;ll remind you before every occasion so you always send the perfect gift on time.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setStep("plans")} className="px-5 py-3 border border-surface-border text-theme-heading rounded-2xl font-semibold text-sm hover:bg-theme-surface transition-colors">
            Manage plan
          </button>
          <Link href="/shop" className="px-5 py-3 bg-brand text-white rounded-2xl font-semibold text-sm hover:bg-brand-deep transition-colors">
            Browse gifts
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Recipients screen ──
  if (step === "recipients" && selectedPlan) return (
    <div className="min-h-screen bg-theme-bg pt-28 pb-24">
      <div className="max-w-2xl mx-auto px-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep("configure")} className="w-9 h-9 rounded-xl bg-theme-surface border border-surface-border flex items-center justify-center text-theme-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-theme-heading">Add your recipients</h1>
            <p className="text-sm text-theme-muted">Who will you be gifting? We&apos;ll remind you before each occasion.</p>
          </div>
        </div>

        {recipients.map((r, idx) => (
          <div key={idx} className="card-theme rounded-2xl border border-surface-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-theme-heading flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                Recipient {idx + 1}
              </h3>
              {recipients.length > 1 && (
                <button onClick={() => setRecipients((p) => p.filter((_, i) => i !== idx))} className="text-theme-muted hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Full Name *</label>
                <input required value={r.name} onChange={(e) => updateRecipient(idx, "name", e.target.value)} placeholder="e.g. Jane Kamau"
                  className="w-full bg-theme-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-brand/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Phone</label>
                <input value={r.phone} onChange={(e) => updateRecipient(idx, "phone", e.target.value)} placeholder="07XX XXX XXX"
                  className="w-full bg-theme-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-brand/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Relationship</label>
                <select value={r.relationship} onChange={(e) => updateRecipient(idx, "relationship", e.target.value)}
                  className="w-full bg-theme-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/40">
                  <option value="">Select...</option>
                  {RELATIONSHIPS.map((rel) => <option key={rel} value={rel.toLowerCase()}>{rel}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Occasion</label>
                <select value={r.occasion} onChange={(e) => updateRecipient(idx, "occasion", e.target.value)}
                  className="w-full bg-theme-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/40">
                  {OCCASIONS.map((occ) => <option key={occ} value={occ.toLowerCase()}>{occ}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Date of occasion</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={r.occasionMonth} onChange={(e) => updateRecipient(idx, "occasionMonth", e.target.value)}
                    className="bg-theme-bg border border-surface-border rounded-xl px-3 py-3 text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/40">
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <input type="number" min={1} max={31} value={r.occasionDay} onChange={(e) => updateRecipient(idx, "occasionDay", e.target.value)} placeholder="Day"
                    className="bg-theme-bg border border-surface-border rounded-xl px-3 py-3 text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/40" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Budget per occasion</label>
                <select value={r.budgetRange} onChange={(e) => updateRecipient(idx, "budgetRange", e.target.value)}
                  className="w-full bg-theme-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/40">
                  {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-1.5">Preferences <span className="normal-case font-normal">(optional)</span></label>
                <input value={r.preferences} onChange={(e) => updateRecipient(idx, "preferences", e.target.value)}
                  placeholder="e.g. Loves skincare, prefers experiences, allergic to nuts..."
                  className="w-full bg-theme-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-brand/40" />
              </div>
            </div>
          </div>
        ))}

        {recipients.length < selectedPlan.maxRecipients && (
          <button onClick={() => setRecipients((p) => [...p, emptyRecipient()])}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-surface-border hover:border-brand/40 text-theme-muted hover:text-brand transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add another recipient
          </button>
        )}

        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Summary */}
        <div className="card-theme rounded-2xl border border-brand/20 p-6 space-y-3">
          <h3 className="font-display font-semibold text-theme-heading">Monthly breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-theme-body">
              <span>Gift Wallet contribution</span>
              <span className="font-semibold text-emerald-600">+{fmtKsh(monthlySavings)}</span>
            </div>
            <div className="flex justify-between text-theme-body">
              <span>Platform service fee</span>
              <span className="text-theme-muted">{fmtKsh(selectedPlan.platformFee)}</span>
            </div>
            <div className="h-px bg-surface-border" />
            <div className="flex justify-between text-theme-heading font-bold">
              <span>Total charged monthly</span>
              <span>{fmtKsh(monthlySavings + selectedPlan.platformFee)}</span>
            </div>
          </div>
          <p className="text-xs text-theme-muted">
            The {fmtKsh(monthlySavings)} savings portion lives in your Gift Wallet and can be spent on any gift, anytime.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={isSubmitting}
            className="w-full py-4 rounded-full bg-brand text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-brand-deep transition-colors disabled:opacity-60">
            {isSubmitting ? "Activating..." : `Activate — ${fmtKsh(monthlySavings + selectedPlan.platformFee)}/mo`}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Configure savings ──
  if (step === "configure" && selectedPlan) return (
    <div className="min-h-screen bg-theme-bg pt-28 pb-24">
      <div className="max-w-lg mx-auto px-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep("plans")} className="w-9 h-9 rounded-xl bg-theme-surface border border-surface-border flex items-center justify-center text-theme-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-theme-heading">{selectedPlan.name} plan</h1>
            <p className="text-sm text-theme-muted">Set your monthly savings contribution</p>
          </div>
        </div>

        {/* Explainer */}
        <div className="p-5 bg-brand/5 border border-brand/15 rounded-2xl flex gap-3">
          <Info className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
          <div className="text-sm text-theme-body space-y-1">
            <p className="font-semibold text-theme-heading">How your savings work</p>
            <p>Every month, your chosen amount is added to your <strong>Gift Wallet</strong>. The balance accumulates — like a chama — so when an occasion arrives, you always have enough to send a meaningful gift.</p>
          </div>
        </div>

        {/* Savings picker */}
        <div className="card-theme rounded-2xl border border-surface-border p-6 space-y-5">
          <p className="font-semibold text-theme-heading">Monthly savings amount</p>

          {/* Quick picks */}
          <div className="grid grid-cols-3 gap-3">
            {selectedPlan.suggestedSavings.map((amt) => (
              <button key={amt} onClick={() => { setMonthlySavings(amt); setCustomSavings(""); }}
                className={cn("py-4 rounded-xl border-2 text-center transition-all",
                  monthlySavings === amt && !customSavings
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-surface-border text-theme-heading hover:border-brand/30")}>
                <span className="font-display font-bold text-sm block">KSh {amt.toLocaleString()}</span>
                <span className="text-xs text-theme-muted">/month</span>
              </button>
            ))}
          </div>

          {/* Custom */}
          <div>
            <label className="text-xs font-medium text-theme-muted uppercase tracking-wider block mb-2">Or enter custom amount (min KSh {selectedPlan.minSavings.toLocaleString()})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted font-bold text-sm">KSh</span>
              <input
                type="text"
                value={customSavings}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setCustomSavings(v);
                  if (v && parseInt(v) >= selectedPlan.minSavings) setMonthlySavings(parseInt(v));
                }}
                placeholder="Enter amount..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-border bg-theme-bg text-theme-heading focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>

          {/* Platform fee note */}
          <div className="bg-theme-surface rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-theme-body">
              <span>Gift Wallet contribution</span>
              <span className="font-semibold text-emerald-600">+{fmtKsh(monthlySavings)}</span>
            </div>
            <div className="flex justify-between text-theme-body">
              <span>Platform service fee</span>
              <span className="text-theme-muted">{fmtKsh(selectedPlan.platformFee)}</span>
            </div>
            <div className="h-px bg-surface-border" />
            <div className="flex justify-between font-bold text-theme-heading">
              <span>Total per month</span>
              <span>{fmtKsh(monthlySavings + selectedPlan.platformFee)}</span>
            </div>
          </div>
        </div>

        {/* Projection */}
        <div className="card-theme rounded-2xl border border-surface-border p-5">
          <p className="text-sm font-semibold text-theme-heading mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand" /> Your wallet after...
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[3, 6, 12].map((months) => (
              <div key={months} className="bg-theme-surface rounded-xl p-3">
                <p className="font-display font-bold text-brand">{fmtKsh(monthlySavings * months)}</p>
                <p className="text-xs text-theme-muted mt-1">{months} months</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-theme-muted mt-3">Unused balance rolls over — it never expires.</p>
        </div>

        <button
          onClick={() => setStep("recipients")}
          disabled={monthlySavings < selectedPlan.minSavings}
          className="w-full py-4 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-deep transition-colors disabled:opacity-50">
          Continue — Add recipients <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Plans screen ──
  return (
    <div className="min-h-screen bg-theme-bg pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/account" className="inline-flex items-center gap-2 text-sm text-theme-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Account
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-theme-muted hover:text-brand transition-colors">Home</Link>
            <Link href="/shop" className="text-brand hover:text-brand-dark transition-colors">Go to Shop</Link>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Gift Subscriptions
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-theme-heading leading-tight mb-4">
            Save monthly. <span className="text-brand">Gift perfectly.</span>
          </h1>
          <p className="text-lg text-theme-body leading-relaxed">
            Like a chama, but for gifts. Commit a monthly amount that builds up in your Gift Wallet. We handle the reminders, curation, and delivery.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Wallet className="w-5 h-5 text-brand" />, title: "Set your savings", desc: "Choose how much to save per month" },
            { icon: <Users className="w-5 h-5 text-gold" />, title: "Add loved ones", desc: "We track their birthdays & occasions" },
            { icon: <Bell className="w-5 h-5 text-coral" />, title: "Get reminded", desc: "Alerts 2 weeks before every occasion" },
            { icon: <Gift className="w-5 h-5 text-emerald-500" />, title: "Spend your wallet", desc: "Pick any gift, pay from your balance" },
          ].map((item, i) => (
            <div key={i} className="card-theme rounded-2xl border border-surface-border p-5 text-center hover:shadow-card-hover transition-all duration-300">
              <div className="w-10 h-10 bg-theme-surface rounded-xl flex items-center justify-center mx-auto mb-3">{item.icon}</div>
              <p className="font-semibold text-theme-heading text-sm mb-1">{item.title}</p>
              <p className="text-xs text-theme-muted">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Active subscription */}
        {activeSubscription && (
          <div className="card-theme rounded-3xl border border-brand/20 p-6 md:p-8">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="font-display font-bold text-theme-heading capitalize">{activeSubscription.plan} Plan</p>
                  <p className="text-sm text-theme-muted">{fmtKsh(activeSubscription.monthly_savings_contribution)}/mo savings · {activeSubscription.recipient_count} recipients</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  activeSubscription.status === "active"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400")}>
                  {activeSubscription.status}
                </span>
                {activeSubscription.status === "active" && (
                  <button onClick={() => handleAction(activeSubscription.id, "pause")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border text-theme-muted hover:text-amber-600 hover:border-amber-300 text-xs font-medium transition-colors">
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                )}
                {activeSubscription.status === "paused" && (
                  <button onClick={() => handleAction(activeSubscription.id, "resume")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border text-theme-muted hover:text-emerald-600 hover:border-emerald-300 text-xs font-medium transition-colors">
                    <Play className="w-3.5 h-3.5" /> Resume
                  </button>
                )}
                <button onClick={() => { if (confirm("Cancel subscription? Your wallet balance stays.")) handleAction(activeSubscription.id, "cancel"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border text-theme-muted hover:text-red-500 hover:border-red-300 text-xs font-medium transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>

            {/* Wallet balance */}
            <div className="bg-brand/5 border border-brand/10 rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-xs text-theme-muted uppercase tracking-wider">Gift Wallet Balance</p>
                  <p className="font-display font-bold text-2xl text-brand">{fmtKsh(activeSubscription.wallet_balance)}</p>
                </div>
              </div>
              <Link href="/shop" className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors flex items-center gap-1.5">
                Spend <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              {activeSubscription.subscription_recipients.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                      <UserRound className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-theme-heading">{r.recipient_name}</p>
                      <p className="text-xs text-theme-muted capitalize">
                        {r.relationship || "Friend"} · {r.occasion || "Birthday"}
                        {r.occasion_month ? ` · ${MONTHS[r.occasion_month - 1]}${r.occasion_day ? ` ${r.occasion_day}` : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-theme-surface text-theme-muted px-2.5 py-1 rounded-full">{r.budget_range}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-theme-muted mt-4">
              Next billing: {new Date(activeSubscription.next_billing_date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="font-display font-bold text-2xl text-theme-heading text-center mb-8">
            {activeSubscription ? "Upgrade your plan" : "Choose a plan"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLAN_CONFIG.map((plan) => (
              <div key={plan.key}
                onClick={() => { setSelectedPlan(plan); setMonthlySavings(plan.suggestedSavings[1]); setStep("configure"); }}
                className={cn("relative card-theme rounded-3xl border p-7 flex flex-col transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer group",
                  plan.badge === "Most Popular" ? "border-brand ring-2 ring-brand/20" : "border-surface-border")}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={cn("px-4 py-1 rounded-full text-xs font-bold text-white", plan.badge === "Most Popular" ? "bg-brand" : "bg-gold")}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5", plan.gradient)}>
                  {plan.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-theme-heading mb-1">{plan.name}</h3>
                <p className="text-sm text-theme-muted mb-5">Up to {plan.maxRecipients} recipients</p>
                <div className="mb-2">
                  <span className="text-xs text-theme-muted">From </span>
                  <span className="font-display text-2xl font-black text-theme-heading">{fmtKsh(plan.minSavings + plan.platformFee)}</span>
                  <span className="text-theme-muted text-sm">/month</span>
                </div>
                <p className="text-xs text-theme-muted mb-6">
                  incl. {fmtKsh(plan.platformFee)} service fee · savings from {fmtKsh(plan.minSavings)}/mo
                </p>
                <div className="space-y-2.5 flex-1 mb-6">
                  {[
                    `${plan.maxRecipients} recipients tracked`,
                    "Birthday & occasion reminders",
                    "AI gift curation",
                    "Same-day Nairobi delivery",
                    ...(plan.key !== "starter" ? ["Personalised gift messages"] : []),
                    ...(plan.key === "executive" ? ["Dedicated account manager", "Custom gift sourcing"] : []),
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-brand" />
                      </div>
                      <span className="text-sm text-theme-body">{f}</span>
                    </div>
                  ))}
                </div>
                <button className={cn("w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  plan.badge === "Most Popular"
                    ? "bg-brand text-white hover:bg-brand-deep"
                    : "bg-theme-surface text-theme-heading hover:bg-brand hover:text-white border border-surface-border")}>
                  Get started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-theme-muted">
          Savings never expire. Cancel anytime — your wallet balance stays. Gift costs are deducted per occasion from your wallet.
        </p>
      </div>
    </div>
  );
}
