"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Zap, Share2, CheckCircle } from "lucide-react";

const OCCASIONS = [
  { id: "wedding", label: "Wedding", emoji: "💒", defaultTarget: 15000 },
  { id: "birthday", label: "Birthday", emoji: "🎂", defaultTarget: 5000 },
  { id: "baby", label: "Baby Shower", emoji: "👶", defaultTarget: 8000 },
  { id: "office", label: "Office Send-off", emoji: "💼", defaultTarget: 10000 },
  { id: "graduation", label: "Graduation", emoji: "🎓", defaultTarget: 5000 },
  { id: "other", label: "Other", emoji: "🎁", defaultTarget: 5000 },
];

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000, 10000];

type Step = "form" | "submitting" | "error";

export default function CreatePoolPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const handleOccasionSelect = (occ: (typeof OCCASIONS)[0]) => {
    setSelectedOccasion(occ.id);
    if (!title) setTitle(`${occ.label} Gift Pool`);
    setTargetAmount(occ.defaultTarget);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setErrorMessage("");

    const res = await fetch("/api/pools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        targetAmount,
        expiresAt: new Date(expiresAt).toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStep("error");
      setErrorMessage(
        data.error?.formErrors?.join(", ") ?? data.error ?? "Something went wrong."
      );
      return;
    }

    router.push(`/gift-lab/pool/${data.pool.slug}`);
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* ── Header ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/gift-lab"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 bg-gradient-to-br from-gold/30 to-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-gold-dark" />
            </div>
            <div>
              <h1 className="font-display font-bold text-brand-deep text-sm leading-none">Pool a Gift</h1>
              <p className="text-[11px] text-brand-muted mt-0.5">Chip in together · M-Pesa friendly</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* How it works — quick banner */}
        <div className="flex items-start gap-3 mb-8 bg-white rounded-2xl p-4 border border-black/6 shadow-sm">
          <div className="w-10 h-10 bg-brand/8 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-deep mb-2">Here's how it works</p>
            <div className="space-y-1.5">
              {[
                { icon: <Share2 className="w-3.5 h-3.5" />, text: "Create a pool and get a shareable link" },
                { icon: <Users className="w-3.5 h-3.5" />, text: "Friends open the link and contribute via M-Pesa" },
                { icon: <CheckCircle className="w-3.5 h-3.5" />, text: "Once the target is hit, the gift is ordered automatically" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-brand-muted">
                  <span className="text-brand/60">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* Occasion selector */}
          <div className="bg-white rounded-2xl p-6 border border-black/6 shadow-sm">
            <label className="text-sm font-semibold text-brand-deep block mb-1">What&apos;s the occasion?</label>
            <p className="text-xs text-brand-muted mb-4">We&apos;ll suggest a gift target amount for you</p>
            <div className="grid grid-cols-3 gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => handleOccasionSelect(occ)}
                  className={`p-3.5 rounded-xl border-2 text-center transition-all duration-200 ${
                    selectedOccasion === occ.id
                      ? "border-brand bg-brand/5 shadow-sm"
                      : "border-black/8 hover:border-brand/30 hover:bg-brand/3"
                  }`}
                >
                  <span className="text-2xl block mb-1.5">{occ.emoji}</span>
                  <span className={`text-[11px] font-medium ${selectedOccasion === occ.id ? "text-brand" : "text-brand-muted"}`}>
                    {occ.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-6 border border-black/6 shadow-sm space-y-5">
            <div>
              <label className="text-sm font-semibold text-brand-deep block mb-1">Pool title</label>
              <p className="text-xs text-brand-muted mb-2">Give it a name your friends will recognize</p>
              <input
                required
                minLength={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Amina's Wedding Gift 💍"
                className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-brand-deep block mb-2">Target amount (KSh)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetAmount(amt)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      targetAmount === amt
                        ? "border-brand bg-brand/8 text-brand"
                        : "border-black/8 text-brand-muted hover:border-brand/30"
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={100}
                required
                value={targetAmount || ""}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                placeholder="Or enter a custom amount"
                className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-brand-deep block mb-1">Pool closes on</label>
              <p className="text-xs text-brand-muted mb-2">Contributions stop after this date</p>
              <input
                type="date"
                required
                value={expiresAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            id="create-pool-btn"
            type="submit"
            disabled={step === "submitting" || !title || !targetAmount}
            className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {step === "submitting" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-deep/30 border-t-brand-deep rounded-full animate-spin" />
                Creating your pool…
              </span>
            ) : (
              "Create Pool & Get Shareable Link ✨"
            )}
          </button>

          <p className="text-center text-[11px] text-brand-muted/60">
            No sign-up required · Contributors pay via M-Pesa · Funds held securely by TouchGift
          </p>
        </form>
      </div>
    </div>
  );
}
