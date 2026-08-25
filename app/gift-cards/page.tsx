"use client";

import { useState } from "react";
import Link from "next/link";
import BackToHome from "@/components/ui/BackToHome";
import { formatKsh } from "@/lib/utils";
import { ExternalLink, Copy, CheckCircle2, Loader2 } from "lucide-react";

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000];

type Step = "form" | "redirecting" | "success";

export default function GiftCardsPage() {
  const [step, setStep] = useState<Step>("form");
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState(2000);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    recipientPhone: "",
    message: "",
  });
  const [cardCode, setCardCode] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setStep("redirecting");

    const finalAmount = customAmount ? Number(customAmount) : amount;

    if (finalAmount < 500) {
      setErrorMessage("Minimum gift card amount is KSh 500.");
      setStep("form");
      setFormStep(1);
      return;
    }

    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          senderName: form.senderName,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone || undefined,
          message: form.message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create gift card");

      setCardCode(data.card.code);
      setRedirectUrl(data.redirectUrl ?? null);

      if (data.redirectUrl) {
        // Redirect to PesaPal payment
        window.location.href = data.redirectUrl;
      } else {
        setStep("success");
      }
    } catch (err: any) {
      setStep("form");
      setErrorMessage(err?.message ?? "Something went wrong");
    }
  }

  const finalAmount = customAmount ? Number(customAmount) : amount;

  // Redirecting state
  if (step === "redirecting") {
    return (
      <div className="page-container py-6 max-w-md mx-auto space-y-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <BackToHome />
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link href="/shop" className="text-brand hover:text-brand-dark transition-colors">Go to Shop</Link>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-brand/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-7 h-7 text-brand animate-spin" />
          </div>
          <h3 className="font-display text-xl font-bold text-brand-deep mb-2">
            Creating your gift card…
          </h3>
          <p className="text-sm text-brand-muted mb-6">
            You&apos;ll complete your <span className="font-semibold text-brand-deep">{formatKsh(finalAmount)}</span> payment securely via PesaPal.
          </p>
          {redirectUrl && (
            <div className="space-y-3 mt-4">
              <p className="text-xs text-brand-muted">Didn&apos;t redirect automatically?</p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => window.open(redirectUrl, "_blank")}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
                >
                  Open payment page
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(redirectUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-brand-deep text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="page-container py-6 max-w-md mx-auto space-y-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <BackToHome />
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link href="/shop" className="text-brand hover:text-brand-dark transition-colors">Go to Shop</Link>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center space-y-3">
          <p className="font-medium text-green-800">Gift card created!</p>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs text-brand-muted mb-1">Code</p>
            <p className="text-lg font-mono font-bold tracking-wider">{cardCode}</p>
            <p className="text-sm text-brand-muted mt-1">{formatKsh(finalAmount)}</p>
          </div>
          <p className="text-sm text-green-700">
            Share this code with {form.recipientName}. They can redeem it at checkout.
          </p>
        </div>
        <button
          onClick={() => {
            setStep("form");
            setCardCode("");
            setForm({ senderName: "", recipientName: "", recipientPhone: "", message: "" });
          }}
          className="w-full rounded-lg border border-gray-300 py-3 text-sm font-medium"
        >
          Buy another
        </button>
      </div>
    );
  }

  // Form state
  return (
    <div className="page-container py-6 max-w-md mx-auto space-y-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <BackToHome />
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/shop" className="text-brand hover:text-brand-dark transition-colors">Go to Shop</Link>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Digital Gift Card</h1>
        <p className="text-sm text-brand-muted">
          Send a stored-value code instantly. The recipient can choose their own gift.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-surface-border shadow-sm">
        {formStep === 1 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-theme-heading block">Select Amount (KSh)</label>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`rounded-xl border-2 py-3 text-sm font-bold transition-all ${
                      amount === a && !customAmount
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-surface-border text-theme-heading hover:border-brand/30"
                    }`}
                  >
                    {formatKsh(a)}
                  </button>
                ))}
              </div>
              
              <div className="relative mt-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted font-bold text-sm">KSh</span>
                <input
                  type="number"
                  min={500}
                  placeholder="Custom amount (Min 500)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-surface-border bg-theme-bg text-theme-heading rounded-xl text-sm focus:ring-2 focus:ring-brand/40 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const currentAmount = customAmount ? Number(customAmount) : amount;
                if (currentAmount < 500) {
                  setErrorMessage("Minimum gift card amount is KSh 500.");
                  return;
                }
                setErrorMessage("");
                setFormStep(2);
              }}
              className="w-full rounded-xl bg-brand text-white py-3.5 font-bold mt-2 hover:bg-brand-deep transition-colors"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <button 
              type="button"
              onClick={() => setFormStep(1)}
              className="text-sm text-theme-muted hover:text-brand flex items-center gap-1 -mt-2 mb-4"
            >
              ← Back to amount
            </button>
            
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted block mb-1.5">Your name</label>
              <input
                required
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted block mb-1.5">Recipient's name</label>
              <input
                required
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted block mb-1.5">
                Recipient's phone <span className="normal-case font-normal">(Optional - for SMS delivery)</span>
              </label>
              <input
                type="tel"
                value={form.recipientPhone}
                onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                placeholder="07XX XXX XXX"
                className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted block mb-1.5">Message <span className="normal-case font-normal">(Optional)</span></label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Happy birthday! Choose something you love."
                rows={2}
                className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand text-white py-3.5 font-bold mt-2 hover:bg-brand-deep transition-colors"
            >
              Pay {formatKsh(customAmount ? Number(customAmount) : amount)} with M-Pesa
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
