"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, CreditCard, Smartphone, Ghost, Eye, EyeOff } from "lucide-react";

type PoolSummary = {
  title: string; recipient_name: string; target_amount: number;
  current_balance: number; min_contribution: number; gift_name: string | null;
  ghost_mode_allowed: boolean; privacy_mode: "named" | "anonymous"; slug: string;
};

const PAYMENT_METHODS = [
  { id: "mpesa", label: "M-Pesa", icon: "📱", desc: "STK push to your phone" },
  { id: "card", label: "Card", icon: "💳", desc: "Visa / Mastercard" },
  { id: "airtel", label: "Airtel Money", icon: "📲", desc: "Airtel Money push" },
];

const QUICK_AMOUNTS = [200, 500, 1000, 2000, 5000];

export default function ContributePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [pool, setPool] = useState<PoolSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGhost, setIsGhost] = useState(false);
  const [showName, setShowName] = useState(true);

  useEffect(() => {
    fetch(`/api/pools/${slug}`)
      .then(r => r.json())
      .then(d => { setPool(d.pool); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < (pool?.min_contribution ?? 50)) {
      setError(`Minimum contribution is KES ${pool?.min_contribution ?? 50}`);
      return;
    }
    if (!phone.trim()) { setError("Phone number is required for payment"); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/pools/${slug}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributorName: isGhost ? null : (name || "Anonymous"),
          contributorPhone: phone,
          amount: Number(amount),
          message: message || undefined,
          isAnonymous,
          isGhost,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");

      // Redirect to PesaPal or directly to thanks on success
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/pool/${slug}/thanks?contribution=${data.contributionId}`);
      }
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF5F8] to-white">
        <div className="w-10 h-10 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-deep/60 mb-4">Pool not found</p>
          <Link href="/" className="text-brand font-semibold text-sm">Go Home</Link>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((pool.current_balance / pool.target_amount) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-white pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">

        {/* Back */}
        <Link href={`/pool/${slug}`} className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to pool
        </Link>

        {/* Pool summary */}
        <div className="bg-gradient-to-br from-brand-deep to-brand rounded-3xl p-5 text-white mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Contributing to</p>
            <h1 className="font-display text-xl font-bold italic">{pool.title}</h1>
            {pool.gift_name && <p className="text-white/60 text-sm mt-1">🎁 {pool.gift_name}</p>}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80 font-semibold">KES {pool.current_balance.toLocaleString()}</span>
                <span className="text-white/50">of KES {pool.target_amount.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-white/50 text-xs mt-1">{pct}% funded</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Amount */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <label className="block text-sm font-bold text-brand-deep mb-3">Your Contribution (KES) *</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_AMOUNTS.filter(a => a >= pool.min_contribution).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${amount === a ? "bg-brand text-white shadow-md" : "bg-brand/5 text-brand-deep hover:bg-brand/10"}`}
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder={`Custom amount (min KES ${pool.min_contribution})`}
              min={pool.min_contribution}
              className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-brand/2 text-lg font-bold"
            />
          </div>

          {/* Identity */}
          <div className="bg-white rounded-3xl shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-brand-deep">Your Details</label>
              {pool.ghost_mode_allowed && (
                <button
                  type="button"
                  onClick={() => setIsGhost(!isGhost)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${isGhost ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  <Ghost className="w-3.5 h-3.5" />
                  {isGhost ? "Ghost Mode ON" : "Go Ghost"}
                </button>
              )}
            </div>

            {isGhost ? (
              <div className="p-4 rounded-2xl bg-gray-50 text-center">
                <Ghost className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 font-medium">You&apos;re contributing anonymously</p>
                <p className="text-xs text-gray-400 mt-1">No name shown anywhere — not even to the organiser</p>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-brand-deep/60 uppercase tracking-wide">Name</label>
                    {pool.privacy_mode === "named" && (
                      <button type="button" onClick={() => setIsAnonymous(!isAnonymous)} className="flex items-center gap-1 text-xs text-brand-deep/40 hover:text-brand-deep transition-colors">
                        {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isAnonymous ? "Name hidden" : "Name visible"}
                      </button>
                    )}
                  </div>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-deep/60 uppercase tracking-wide mb-2">Phone Number *</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                type="tel"
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-deep/60 uppercase tracking-wide mb-2">Message <span className="font-normal text-brand-deep/30">(optional)</span></label>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={200}
                placeholder={`A message for ${pool.recipient_name}…`}
                className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none font-sans text-brand-deep bg-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <label className="block text-sm font-bold text-brand-deep mb-3">Pay With</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${paymentMethod === pm.id ? "border-brand bg-brand/5" : "border-brand/10 hover:border-brand/25"}`}
                >
                  <span className="text-2xl">{pm.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-brand-deep text-sm">{pm.label}</p>
                    <p className="text-xs text-brand-deep/40">{pm.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${paymentMethod === pm.id ? "border-brand bg-brand" : "border-brand/20"}`}>
                    {paymentMethod === pm.id && <div className="w-full h-full rounded-full bg-white scale-50" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !amount}
            className="w-full py-5 bg-gradient-to-r from-brand to-brand-deep text-white rounded-3xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            {submitting ? "Processing…" : `Contribute KES ${amount ? Number(amount).toLocaleString() : "—"}`}
          </button>

          <p className="text-center text-xs text-brand-deep/40 px-4">
            Payments are secured by PesaPal. Funds are held in escrow until the pool closes.
          </p>
        </form>
      </div>
    </div>
  );
}
