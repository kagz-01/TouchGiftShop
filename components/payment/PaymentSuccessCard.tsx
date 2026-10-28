"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, Package, Sparkles, ArrowRight, ShieldCheck, Clock, MapPin } from "lucide-react";
import { formatKsh } from "@/lib/utils";

interface PaymentSuccessCardProps {
  orderId?: string;
  isGiftCard?: boolean;
  isPool?: boolean;
  initialOrder?: {
    total_amount?: number;
    status?: string;
    recipient_name?: string;
    recipient_phone?: string;
    recipient_pin_requested?: boolean;
    mpesa_receipt_number?: string;
    created_at?: string;
  } | null;
}

export default function PaymentSuccessCard({
  orderId,
  isGiftCard = false,
  isPool = false,
  initialOrder,
}: PaymentSuccessCardProps) {
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState(initialOrder);

  // Trigger celebration confetti on mount
  useEffect(() => {
    import("canvas-confetti")
      .then((mod) => {
        const confetti = mod.default;
        // First burst from center
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#9B1B5A", "#D4A853", "#10B981", "#F59E0B", "#FFFFFF"],
        });
        // Follow-up burst from edges
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#D4A853", "#9B1B5A", "#34D399"],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#D4A853", "#9B1B5A", "#34D399"],
          });
        }, 300);
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    if (!orderId) return;
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const amount = order?.total_amount ? Number(order.total_amount) : null;
  const isPaid = order?.status === "processing" || order?.status === "completed" || order?.status === "paid";

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Luxury Celebration Card */}
      <div className="bg-white/95 dark:bg-[#1a0f1d]/95 backdrop-blur-2xl border border-black/8 dark:border-gold/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-center relative overflow-hidden">
        {/* Glow ambient highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/15 dark:bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Checkmark Badge */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-500/35 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10 border border-emerald-300/40">
            {isGiftCard ? (
              <span className="text-3xl">🎁</span>
            ) : isPool ? (
              <span className="text-3xl">🎉</span>
            ) : (
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {isGiftCard ? "Gift Card Activated" : isPool ? "Contribution Confirmed" : "Payment Successful"}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-deep dark:text-white tracking-tight">
          {isGiftCard
            ? "Your Gift Card Is Ready!"
            : isPool
            ? "Thank You for Contributing!"
            : "Payment Received!"}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-white/80 mt-2 max-w-md mx-auto leading-relaxed">
          {isGiftCard
            ? "Your gift card has been created. The recipient will receive their code shortly."
            : isPool
            ? "Your contribution has been verified and added to the gift pool balance."
            : "Thank you for choosing TouchGift. We have received your payment and our team is already preparing your gift with care."}
        </p>

        {/* Order Receipt Details Block */}
        {(orderId || amount) && (
          <div className="mt-8 bg-gray-50/80 dark:bg-white/[0.04] border border-black/6 dark:border-white/10 rounded-2xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/8">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Total Paid
              </span>
              <span className="font-display text-xl sm:text-2xl font-bold text-brand-deep dark:text-gold-light">
                {amount ? formatKsh(amount) : "Verified"}
              </span>
            </div>

            {orderId && (
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-brand-muted">Reference</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-brand-deep dark:text-white bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg select-all max-w-[200px] sm:max-w-none truncate">
                    {orderId}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy reference code"
                    className="p-1.5 rounded-lg bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 text-brand-muted hover:text-brand-deep transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-brand-muted">Payment Partner</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Verified by Paystack
              </span>
            </div>

            {order?.recipient_name && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-brand-muted">Delivering To</span>
                <span className="font-semibold text-brand-deep dark:text-white">
                  {order.recipient_name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Live Delivery Progress Stepper */}
        {!isGiftCard && !isPool && (
          <div className="mt-6 text-left border-t border-black/5 dark:border-white/8 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4 text-center sm:text-left">
              Fulfillment Journey
            </p>
            <div className="space-y-3">
              {[
                { title: "Payment Verified", desc: "Received and confirmed via Paystack", status: "done" },
                { title: "Curation & Wrapping", desc: "Handcrafted and inspected by our team", status: "current" },
                { title: "Quality Photo Proof", desc: "You receive a photo before dispatch", status: "upcoming" },
                { title: "Out for Delivery", desc: "Fast express courier to recipient", status: "upcoming" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5">
                    {step.status === "done" ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : step.status === "current" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-gold flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-white/20" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${step.status === "current" ? "text-gold-dark dark:text-gold-light" : step.status === "done" ? "text-emerald-700 dark:text-emerald-400" : "text-brand-muted"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-white/50">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {isGiftCard ? (
            <Link
              href="/gift-cards"
              className="px-6 py-3.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-center"
            >
              View Gift Cards →
            </Link>
          ) : isPool ? (
            <Link
              href="/gift-lab"
              className="px-6 py-3.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-center"
            >
              Explore Gift Lab →
            </Link>
          ) : (
            <Link
              href={orderId ? `/orders/${orderId}` : "/orders"}
              className="px-6 py-3.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Track Your Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/shop"
            className="px-6 py-3.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-brand-deep dark:text-white rounded-2xl font-semibold text-sm transition-all text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

