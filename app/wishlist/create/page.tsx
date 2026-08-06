"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const OCCASIONS = [
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "wedding", label: "Wedding", emoji: "💒" },
  { id: "baby", label: "New Baby", emoji: "👶" },
  { id: "anniversary", label: "Anniversary", emoji: "💕" },
  { id: "graduation", label: "Graduation", emoji: "🎓" },
  { id: "christmas", label: "Christmas", emoji: "🎄" },
  { id: "just because", label: "Just Because", emoji: "💝" },
  { id: "other", label: "Other", emoji: "🎁" },
];

export default function CreateWishlistPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerName, occasion, message }),
    });

    const data = await res.json();
    if (data.wishlist) {
      router.push(`/wishlist/${data.wishlist.slug}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-lg mx-auto px-4 md:px-8 py-12">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-5xl block mb-4">📝</span>
          <h1 className="font-display text-3xl font-bold mb-3">
            Create Your Wishlist
          </h1>
          <p className="text-brand-muted max-w-md mx-auto">
            Add things you&apos;d actually love to receive. Share the link with
            friends and family so they never have to guess.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? "bg-brand text-white" : "bg-gray-200 text-brand-muted"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-brand" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold mb-2">What&apos;s your name?</label>
                <p className="text-xs text-brand-muted mb-3">This appears as the wishlist owner</p>
                <input
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Grace"
                  className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => ownerName.trim() && setStep(2)}
                disabled={!ownerName.trim()}
                className="w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Occasion + Message */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 border border-surface-border space-y-6 animate-fade-in">
              {/* Occasion */}
              <div>
                <label className="block text-sm font-semibold mb-3">What&apos;s the occasion?</label>
                <div className="grid grid-cols-4 gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        occasion === occ.id
                          ? "border-brand bg-brand/5 shadow-ribbon"
                          : "border-surface-border hover:border-brand/30"
                      }`}
                    >
                      <span className="text-xl block mb-1">{occ.emoji}</span>
                      <span className="text-[10px] font-medium text-brand-muted">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold mb-2">Add a message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Here are some things I&apos;d love for my birthday! No pressure though 🎁"
                  rows={3}
                  maxLength={200}
                  className="w-full bg-gray-50 border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                />
                <p className="text-xs text-brand-muted text-right">{message.length}/200</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-gray-100 text-brand-muted rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-xl font-semibold text-sm hover:shadow-gold transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-brand-deep/30 border-t-brand-deep rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Wishlist ✨"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* How it works */}
        <div className="mt-12 text-center">
          <p className="text-xs text-brand-muted uppercase tracking-wider mb-4">How it works</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "📝", text: "Create your wishlist" },
              { icon: "🔗", text: "Share the link" },
              { icon: "🎁", text: "Friends send gifts" },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <span className="text-2xl block mb-2">{step.icon}</span>
                <p className="text-xs text-brand-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
