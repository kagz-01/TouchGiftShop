"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, CreditCard, Smartphone, Ghost, Eye, EyeOff, Users2, Copy, CheckCircle2, Link2 } from "lucide-react";

type PoolSummary = {
  title: string; recipient_name: string; target_amount: number;
  current_balance: number; min_contribution: number; gift_name: string | null;
  ghost_mode_allowed: boolean; privacy_mode: "named" | "anonymous"; slug: string;
  is_poll_mode?: boolean;
  poll_options?: Array<{ name: string; price: number }> | null;
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
  const searchParams = useSearchParams();
  const voteParam = searchParams.get("vote");
  const [pollVoteIndex, setPollVoteIndex] = useState<number | null>(
    voteParam !== null ? parseInt(voteParam) : null
  );
  const splitParam = searchParams.get("split");     // split parent contribution id (friend link)
  const amountParam = searchParams.get("amount");   // pre-filled amount for friend

  const [pool, setPool] = useState<PoolSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | "">(amountParam ? Number(amountParam) : "");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGhost, setIsGhost] = useState(false);
  const [showName, setShowName] = useState(true);

  // Split-with-a-friend state
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitRatio, setSplitRatio] = useState<50 | 33 | "custom">(50);
  const [customSplit, setCustomSplit] = useState<number | "">(""   );
  const [splitCopied, setSplitCopied] = useState(false);
  const [splitParentId] = useState<string | null>(splitParam);

  const myAmount = Number(amount) || 0;
  const friendShare = (() => {
    if (splitRatio === 50) return Math.ceil(myAmount / 2);
    if (splitRatio === 33) return Math.ceil(myAmount * 2 / 3);
    return Number(customSplit) || 0;
  })();
  const myShare = myAmount - friendShare;

  const splitLink = typeof window !== "undefined" && myAmount > 0
    ? `${window.location.origin}/pool/${slug}/contribute?split=PENDING&amount=${friendShare}`
    : "";

  const copySplitLink = () => {
    if (!splitLink) return;
    navigator.clipboard?.writeText(splitLink);
    setSplitCopied(true);
    setTimeout(() => setSplitCopied(false), 3000);
  };

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
          pollVoteIndex: pollVoteIndex !== null ? pollVoteIndex : undefined,
          splitParentId: splitParentId ?? undefined,
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
      <div className="min-h-screen flex items-center justify-center bg-[#14080D]">
        <div className="w-10 h-10 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14080D] px-4">
        <div className="text-center">
          <p className="text-white/50 mb-4">Pool not found</p>
          <Link href="/" className="text-rose-400 font-semibold text-sm hover:text-rose-300 transition-colors">Go Home</Link>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((pool.current_balance / pool.target_amount) * 100));

  return (
    <div className="min-h-screen bg-[#14080D] pb-24 text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-rose-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md mx-auto px-4 pt-6">

        {/* Back */}
        <Link href={`/pool/${slug}`} className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to pool
        </Link>

        {/* Split-with-friend invite banner (shown when arriving via split link) */}
        {splitParentId && (
          <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border border-blue-400/30 rounded-3xl p-5 mb-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users2 className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">You&apos;ve been invited to split!</p>
                <p className="text-white font-semibold">A friend is splitting a contribution with you</p>
                <p className="text-white/60 text-sm mt-1">
                  Your share: <span className="text-blue-300 font-bold">KES {Number(amountParam || 0).toLocaleString()}</span> — already pre-filled below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pool summary banner */}
        <div className="bg-gradient-to-br from-[#1F0A1C] via-rose-950/80 to-[#14080D] rounded-3xl p-5 text-white mb-5 relative overflow-hidden border border-rose-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Contributing to</p>
            <h1 className="font-display text-xl font-bold italic text-white">{pool.title}</h1>
            {pool.gift_name && <p className="text-white/50 text-sm mt-1">🎁 {pool.gift_name}</p>}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80 font-semibold">KES {pool.current_balance.toLocaleString()}</span>
                <span className="text-white/40">of KES {pool.target_amount.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-rose-400 text-xs mt-1 font-semibold">{pct}% funded</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Amount */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5">
            <label className="block text-sm font-bold text-white mb-3">Your Contribution (KES) *</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_AMOUNTS.filter(a => a >= pool.min_contribution).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    amount === a
                      ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                      : "bg-white/5 text-white/70 border border-white/10 hover:border-rose-400/30 hover:text-white"
                  }`}
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
              className="w-full px-4 py-3 rounded-2xl border-2 border-white/10 focus:border-rose-400 focus:outline-none font-sans text-white bg-black/30 text-lg font-bold placeholder-white/30"
            />

            {/* Split-with-friend card — only shown if amount ≥ 2x minimum and not already a split contributor */}
            {myAmount >= (pool.min_contribution) * 2 && !splitParentId && (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-blue-400/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setIsSplitMode(!isSplitMode)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                      <Users2 className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Split with a friend</p>
                      <p className="text-xs text-white/50">Share the cost — send them a pre-filled link</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isSplitMode ? "bg-blue-500" : "bg-white/10"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow mt-0.5 transition-all ${isSplitMode ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </button>

                {isSplitMode && (
                  <div className="px-4 pb-4 space-y-4 bg-blue-500/5 border-t border-blue-400/15">
                    {/* Split ratio options */}
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mt-3 mb-2">How to split</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { label: "50 / 50", value: 50 as const },
                          { label: "33 / 67", value: 33 as const },
                          { label: "Custom", value: "custom" as const },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSplitRatio(opt.value)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              splitRatio === opt.value
                                ? "bg-blue-500 text-white"
                                : "bg-white/5 text-white/60 border border-white/10 hover:border-blue-400/30"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {splitRatio === "custom" && (
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wide block mb-1">Friend pays (KES)</label>
                        <input
                          type="number"
                          value={customSplit}
                          onChange={e => setCustomSplit(e.target.value ? Number(e.target.value) : "")}
                          max={myAmount - pool.min_contribution}
                          min={pool.min_contribution}
                          placeholder="e.g. 1500"
                          className="w-full px-3 py-2.5 rounded-xl bg-black/30 border-2 border-white/10 focus:border-blue-400 focus:outline-none text-white text-sm"
                        />
                      </div>
                    )}

                    {/* Share preview */}
                    {(splitRatio !== "custom" || Number(customSplit) > 0) && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1">You pay</p>
                          <p className="text-lg font-bold text-white">KES {myShare > 0 ? myShare.toLocaleString() : "—"}</p>
                        </div>
                        <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-400/20">
                          <p className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wide mb-1">Friend pays</p>
                          <p className="text-lg font-bold text-blue-300">KES {friendShare > 0 ? friendShare.toLocaleString() : "—"}</p>
                        </div>
                      </div>
                    )}

                    {/* Copy link */}
                    {friendShare > 0 && myShare >= pool.min_contribution && (
                      <button
                        type="button"
                        onClick={copySplitLink}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
                          splitCopied
                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                            : "bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25"
                        }`}
                      >
                        {splitCopied
                          ? <><CheckCircle2 className="w-4 h-4" /> Link copied! Send it to your friend</>
                          : <><Link2 className="w-4 h-4" /> Copy friend&apos;s share link</>
                        }
                      </button>
                    )}
                    <p className="text-xs text-white/30 text-center">
                      Your amount adjusts to KES {myShare > 0 ? myShare.toLocaleString() : "—"} when you proceed
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">Your Details</label>
              {pool.ghost_mode_allowed && (
                <button
                  type="button"
                  onClick={() => setIsGhost(!isGhost)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    isGhost
                      ? "bg-white/20 text-white border border-white/20"
                      : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Ghost className="w-3.5 h-3.5" />
                  {isGhost ? "Ghost Mode ON" : "Go Ghost"}
                </button>
              )}
            </div>

            {isGhost ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Ghost className="w-6 h-6 mx-auto mb-2 text-white/40" />
                <p className="text-sm text-white/60 font-medium">You&apos;re contributing anonymously</p>
                <p className="text-xs text-white/30 mt-1">No name shown anywhere — not even to the organiser</p>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Name</label>
                    {pool.privacy_mode === "named" && (
                      <button type="button" onClick={() => setIsAnonymous(!isAnonymous)} className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors">
                        {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isAnonymous ? "Name hidden" : "Name visible"}
                      </button>
                    )}
                  </div>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/10 focus:border-rose-400 focus:outline-none font-sans text-white bg-black/30 placeholder-white/30"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Phone Number *</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                type="tel"
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-white/10 focus:border-rose-400 focus:outline-none font-sans text-white bg-black/30 placeholder-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Message <span className="font-normal text-white/20">(optional)</span></label>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={200}
                placeholder={`A message for ${pool.recipient_name}…`}
                className="w-full px-4 py-3 rounded-2xl border-2 border-white/10 focus:border-rose-400 focus:outline-none font-sans text-white bg-black/30 placeholder-white/30"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5">
            <label className="block text-sm font-bold text-white mb-3">Pay With</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === pm.id
                      ? "border-rose-500 bg-rose-500/10"
                      : "border-white/10 hover:border-white/20 bg-white/3"
                  }`}
                >
                  <span className="text-2xl">{pm.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{pm.label}</p>
                    <p className="text-xs text-white/40">{pm.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                    paymentMethod === pm.id ? "border-rose-500 bg-rose-500" : "border-white/20"
                  }`}>
                    {paymentMethod === pm.id && <div className="w-full h-full rounded-full bg-white scale-50" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !amount}
            className="w-full py-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-3xl font-bold text-lg hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            {submitting ? "Processing…" : `Contribute KES ${amount ? Number(amount).toLocaleString() : "—"}`}
          </button>

          <p className="text-center text-xs text-white/30 px-4">
            Payments are secured by PesaPal. Funds are held in escrow until the pool closes.
          </p>
        </form>
      </div>
    </div>
  );
}
