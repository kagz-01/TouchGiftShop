"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Gift, Heart
} from "lucide-react";

const OCCASIONS = [
  { id: "birthday",       label: "Birthday",       emoji: "🎂" },
  { id: "wedding",        label: "Wedding",        emoji: "💒" },
  { id: "baby",           label: "New Baby",       emoji: "👶" },
  { id: "anniversary",    label: "Anniversary",    emoji: "💕" },
  { id: "graduation",     label: "Graduation",     emoji: "🎓" },
  { id: "christmas",      label: "Christmas",      emoji: "🎄" },
  { id: "just because",   label: "Just Because",   emoji: "💝" },
  { id: "other",          label: "Other",          emoji: "🎁" },
];

const WISHLIST_SLUG_KEY = "touchgift_wishlist_slug";
const WISHLIST_NAME_KEY = "touchgift_wishlist_name";

export default function CreateWishlistPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ownerName, setOwnerName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerName, occasion, message }),
    });
    const data = await res.json();
    if (data.wishlist) {
      localStorage.setItem(WISHLIST_SLUG_KEY, data.wishlist.slug);
      localStorage.setItem(WISHLIST_NAME_KEY, data.wishlist.owner_name);
      setCreatedSlug(data.wishlist.slug);
      setStep(3);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-1.5 text-rose-500">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span className="text-sm font-bold">TouchGift</span>
          </div>
          {step < 3 && (
            <span className="text-xs text-gray-400">Step {step} of 2</span>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Progress dots */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s
                    ? "bg-emerald-500 text-white"
                    : step === s
                    ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-0.5 rounded-full transition-all ${step > s ? "bg-emerald-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══ STEP 1: Name & Occasion ═══ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block mb-3">🌟</span>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create Your Wishlist</h1>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Tell friends & family exactly what you&apos;d love — no more guessing!
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 placeholder-gray-300 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">What&apos;s the occasion? *</label>
                <div className="grid grid-cols-4 gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => setOccasion(occ.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all ${
                        occasion === occ.id
                          ? "border-rose-400 bg-rose-50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/50"
                      }`}
                    >
                      <span className="text-2xl">{occ.emoji}</span>
                      <span className="text-[10px] font-semibold text-gray-600 leading-tight">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!ownerName.trim() || !occasion}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-sm hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══ STEP 2: Message ═══ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block mb-3">💌</span>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Add a Message</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Give your gifters some context — totally optional but adds a personal touch!
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">A note for your gifters</label>
              <textarea
                placeholder={`e.g. "I'd love anything from my birthday list — thanks so much! 🥰"`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={200}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 placeholder-gray-300 resize-none transition-all"
              />
              <p className="text-xs text-gray-300 mt-1 text-right">{message.length}/200</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-sm hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Create Wishlist!
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Success ═══ */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-200">
              <Check className="w-12 h-12 text-white" />
            </div>

            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Wishlist Created! 🎉</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Now browse the shop and heart anything you love. Your registry is ready to share!
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-3">
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-sm hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200"
              >
                <Gift className="w-4 h-4" /> Browse & Add Gifts
              </Link>
              <Link
                href={`/wishlist/${createdSlug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:border-rose-300 hover:text-rose-600 transition-all"
              >
                <Heart className="w-4 h-4" /> View My Registry
              </Link>
              <Link
                href="/wishlist"
                className="block w-full py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
              >
                Manage wishlist →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
