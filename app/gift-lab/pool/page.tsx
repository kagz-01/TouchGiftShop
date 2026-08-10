"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackToHome from "@/components/ui/BackToHome";

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

  const handleOccasionSelect = (occ: typeof OCCASIONS[0]) => {
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
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-lg mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link href="/gift-lab" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Gift Lab
          </Link>
          <BackToHome />
        </div>

        <div className="text-center mb-10">
          <span className="text-5xl block mb-4">Pool</span>
          <h1 className="font-display text-3xl font-bold mb-3">Pool a Gift</h1>
          <p className="text-brand-muted max-w-md mx-auto">
            Start a group fund. Share the link — everyone contributes via M-Pesa.
            Once the target is hit, the gift is ordered automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === "error" && (
            <div className="bg-brand-coral/10 border border-brand-coral/30 rounded-2xl p-4 text-sm text-brand-coral">
              {errorMessage}
            </div>
          )}

          {/* Occasion */}
          <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-4">
            <label className="text-sm font-semibold">What&apos;s the occasion?</label>
            <div className="grid grid-cols-3 gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => handleOccasionSelect(occ)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedOccasion === occ.id
                      ? "border-brand bg-brand/5 shadow-ribbon"
                      : "border-surface-border hover:border-brand/30"
                  }`}
                >
                  <span className="text-2xl block mb-1">{occ.emoji}</span>
                  <span className="text-[11px] font-medium text-brand-muted">{occ.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Pool title</label>
              <p className="text-xs text-brand-muted mb-2">Give it a name your friends will recognize</p>
              <input
                required
                minLength={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Amina's Wedding Gift"
                className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Target amount (KSh)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetAmount(amt)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      targetAmount === amt
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-surface-border text-brand-muted hover:border-brand/30"
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
                className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Closes on</label>
              <p className="text-xs text-brand-muted mb-2">Contributions stop after this date</p>
              <input
                type="date"
                required
                value={expiresAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl p-6 border border-surface-border">
            <h3 className="text-sm font-semibold mb-4">How it works</h3>
            <div className="space-y-3">
              {[
                { icon: "1️⃣", text: "Create a pool and get a shareable link" },
                { icon: "2️⃣", text: "Friends open the link and contribute via M-Pesa" },
                { icon: "3️⃣", text: "Track progress on the live progress bar" },
                { icon: "4️⃣", text: "Once target is hit, the gift is ordered automatically" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">{step.icon}</span>
                  <p className="text-xs text-brand-muted pt-0.5">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={step === "submitting" || !title || !targetAmount}
            className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold hover:shadow-gold-lg transition-all disabled:opacity-50"
          >
            {step === "submitting" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-deep/30 border-t-brand-deep rounded-full animate-spin" />
                Creating pool...
              </span>
            ) : (
              "Create Pool & Get Shareable Link ✨"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
