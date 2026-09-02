"use client";

import BackToHome from "@/components/ui/BackToHome";
import GiftCardShowcase from "@/components/gift-cards/GiftCardShowcase";
import { Gift, Zap, Shield, Clock, ArrowRight, CreditCard, Sparkles } from "lucide-react";

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="text-center px-4 pt-12 pb-8">
        <BackToHome />
        <div className="inline-flex items-center gap-2 bg-brand/5 border border-brand/15 rounded-full px-4 py-1.5 mb-4">
          <Sparkles className="w-4 h-4 text-brand" />
          <span className="text-xs font-semibold text-brand">Digital Gift Cards</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-deep mb-3">
          Give the <span className="text-brand">Perfect Gift</span>
        </h1>
        <p className="text-brand-muted max-w-lg mx-auto text-sm md:text-base">
          A stored-value gift card they can use to choose exactly what they love.
          Instant delivery, secure, and valid for 12 months.
        </p>
      </section>

      {/* Main Showcase */}
      <section className="px-4">
        <GiftCardShowcase />
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-4 mt-16">
        <h2 className="font-display text-2xl font-bold text-brand-deep text-center mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "1", icon: <CreditCard className="w-5 h-5" />, title: "Choose amount", desc: "Pick a preset or enter a custom value" },
            { step: "2", icon: <Sparkles className="w-5 h-5" />, title: "Personalize", desc: "Add a message to make it special" },
            { step: "3", icon: <Zap className="w-5 h-5" />, title: "Send instantly", desc: "Delivered to their email in seconds" },
            { step: "4", icon: <Gift className="w-5 h-5" />, title: "They choose", desc: "Recipient picks exactly what they love" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                {item.step}
              </div>
              <h3 className="font-semibold text-brand-deep text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-brand-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-2xl mx-auto px-4 mt-12 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: <Zap className="w-5 h-5 text-green-500" />, label: "Instant delivery" },
          { icon: <Shield className="w-5 h-5 text-blue-500" />, label: "Secure payments" },
          { icon: <Clock className="w-5 h-5 text-amber-500" />, label: "12-month validity" },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/60 border border-surface-border">
            {b.icon}
            <span className="text-xs font-semibold text-brand-deep">{b.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
