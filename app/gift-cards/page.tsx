"use client";

import { useState } from "react";
import Link from "next/link";
import BackToHome from "@/components/ui/BackToHome";
import GiftCardPreview from "@/components/gift-cards/GiftCardPreview";
import { formatKsh } from "@/lib/utils";
import {
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  Gift,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Sparkles,
} from "lucide-react";

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 15000];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (finalAmount < 500) {
      setErrorMessage("Minimum gift card amount is KSh 500.");
      setIsSubmitting(false);
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
      setStep("redirecting");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setStep("success");
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Redirecting state ──
  if (step === "redirecting") {
    return (
      <div className="page-container py-6 max-w-lg mx-auto space-y-6">
        <div className="mb-4">
          <BackToHome />
        </div>
        <div className="card-theme rounded-3xl border border-surface-border p-10 text-center">
          <div className="w-16 h-16 bg-brand/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-7 h-7 text-brand animate-spin" />
          </div>
          <h3 className="font-display text-xl font-bold text-theme-heading mb-2">
            Creating your gift card…
          </h3>
          <p className="text-sm text-theme-muted mb-6">
            You&apos;ll complete your{" "}
            <span className="font-semibold text-brand">{formatKsh(finalAmount)}</span> payment
            securely via PesaPal.
          </p>
          {redirectUrl && (
            <div className="space-y-3 mt-4">
              <p className="text-xs text-theme-muted">Didn&apos;t redirect automatically?</p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => window.open(redirectUrl, "_blank")}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
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
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-theme-surface text-theme-heading text-sm font-semibold rounded-xl hover:bg-theme-surface/80 transition-colors border border-surface-border"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Success state ──
  if (step === "success") {
    return (
      <div className="page-container py-6 max-w-lg mx-auto space-y-6">
        <div className="mb-4">
          <BackToHome />
        </div>

        {/* Card reveal */}
        <div className="flex justify-center">
          <GiftCardPreview
            amount={finalAmount}
            recipientName={form.recipientName}
            senderName={form.senderName}
            message={form.message}
            code={cardCode}
            flipped
          />
        </div>

        {/* Code + copy */}
        <div className="card-theme rounded-3xl border border-surface-border p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-theme-heading mb-1">
              Gift Card Created!
            </p>
            <p className="text-sm text-theme-muted">
              Share this code with <span className="font-semibold text-brand">{form.recipientName}</span>. They can redeem it at checkout.
            </p>
          </div>

          <div className="bg-theme-surface rounded-2xl border border-surface-border p-4">
            <p className="text-[10px] uppercase tracking-widest text-theme-muted font-bold mb-1">
              Gift Card Code
            </p>
            <p className="font-mono text-xl font-black tracking-[0.15em] text-brand">
              {cardCode}
            </p>
            <p className="text-xs text-theme-muted mt-1">
              Value: {formatKsh(finalAmount)}
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(cardCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand/5 border border-brand/10 text-brand font-semibold text-sm hover:bg-brand/10 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Gift Card Code
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep("form");
              setFormStep(1);
              setCardCode("");
              setAmount(2000);
              setCustomAmount("");
              setForm({ senderName: "", recipientName: "", recipientPhone: "", message: "" });
            }}
            className="flex-1 py-3 rounded-xl border border-surface-border text-sm font-semibold text-theme-heading hover:bg-theme-surface transition-colors"
          >
            Buy Another
          </button>
          <Link
            href="/shop"
            className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold text-center hover:bg-brand-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div className="page-container py-6 md:py-10">
      {/* Hero header */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-6">
          <BackToHome />
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/shop" className="text-brand hover:text-brand-dark transition-colors">
              Go to Shop
            </Link>
          </div>
        </div>

        <div className="text-center max-w-xl mx-auto">
          <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-7 h-7 text-gold" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-theme-heading mb-3">
            Give the{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Perfect Gift
            </span>
          </h1>
          <p className="text-theme-muted text-sm md:text-base leading-relaxed">
            A stored-value code they can use to choose exactly what they love.
            <br className="hidden sm:block" /> Instant delivery, zero guesswork.
          </p>
        </div>

        {/* How it works — 3 steps */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mt-6 md:mt-8">
          {[
            { icon: CreditCard, label: "Choose value" },
            { icon: Sparkles, label: "Add a message" },
            { icon: Zap, label: "Instant delivery" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2 text-theme-muted">
              <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center">
                <Icon className="w-4 h-4 text-brand" />
              </div>
              <span className="text-xs font-medium hidden sm:inline">{label}</span>
              {i < 2 && <ArrowRight className="w-3 h-3 text-theme-muted/40 ml-2 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Main: form + preview */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left: Form */}
          <div className="card-theme rounded-3xl border border-surface-border p-6 md:p-8 order-2 md:order-1">
            {formStep === 1 ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-theme-heading mb-1">
                    Choose an amount
                  </h2>
                  <p className="text-xs text-theme-muted">
                    Select a preset or enter a custom amount (min KSh 500)
                  </p>
                </div>

                {/* Amount presets */}
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        setAmount(a);
                        setCustomAmount("");
                        setErrorMessage("");
                      }}
                      className={`relative rounded-2xl border-2 py-3.5 text-center transition-all duration-200 ${
                        amount === a && !customAmount
                          ? "border-brand bg-brand/5 shadow-sm"
                          : "border-surface-border hover:border-brand/20 hover:bg-theme-surface"
                      }`}
                    >
                      {amount === a && !customAmount && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span
                        className={`font-display text-lg font-bold ${
                          amount === a && !customAmount ? "text-brand" : "text-theme-heading"
                        }`}
                      >
                        {formatKsh(a)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted font-bold text-sm">
                    KSh
                  </span>
                  <input
                    type="number"
                    min={500}
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full pl-12 pr-4 py-3.5 border border-surface-border bg-theme-bg text-theme-heading rounded-2xl text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand/30 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (finalAmount < 500) {
                      setErrorMessage("Minimum gift card amount is KSh 500.");
                      return;
                    }
                    setErrorMessage("");
                    setFormStep(2);
                  }}
                  className="w-full rounded-2xl bg-brand text-white py-3.5 font-bold hover:bg-brand-deep transition-colors flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-xl font-bold text-theme-heading">
                    Personalize
                  </h2>
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="text-xs text-theme-muted hover:text-brand flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-theme-muted block mb-1.5">
                      Your name *
                    </label>
                    <input
                      required
                      value={form.senderName}
                      onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                      placeholder="e.g. Jane"
                      className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand/30 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-theme-muted block mb-1.5">
                      Recipient&apos;s name *
                    </label>
                    <input
                      required
                      value={form.recipientName}
                      onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      placeholder="e.g. Sarah"
                      className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand/30 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-theme-muted block mb-1.5">
                    Recipient&apos;s phone{" "}
                    <span className="normal-case font-normal">(optional — for SMS)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.recipientPhone}
                    onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                    placeholder="07XX XXX XXX"
                    className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand/30 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-theme-muted block mb-1.5">
                    Gift message{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Happy birthday! Choose something you love."
                    rows={2}
                    className="w-full border border-surface-border bg-theme-bg text-theme-heading rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand/30 focus:outline-none resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-brand text-white py-3.5 font-bold hover:bg-brand-deep transition-colors flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Pay {formatKsh(finalAmount)} with M-Pesa
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Live card preview */}
          <div className="order-1 md:order-2 md:sticky md:top-24">
            <GiftCardPreview
              amount={finalAmount}
              recipientName={form.recipientName}
              senderName={form.senderName}
              message={form.message}
            />

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 mt-5">
              {[
                { icon: Zap, label: "Instant" },
                { icon: Shield, label: "Secure" },
                { icon: Clock, label: "12-month validity" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-theme-muted">
                  <Icon className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
