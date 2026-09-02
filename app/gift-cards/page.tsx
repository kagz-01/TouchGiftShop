"use client";

import BackToHome from "@/components/ui/BackToHome";
import GiftCardShowcase from "@/components/gift-cards/GiftCardShowcase";
import { Sparkles } from "lucide-react";

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
          Instant delivery, secure, and valid for 3 months.
        </p>
      </section>

      {/* Main Showcase */}
      <section className="px-4">
        <GiftCardShowcase />
      </section>
    </div>
  );
}
