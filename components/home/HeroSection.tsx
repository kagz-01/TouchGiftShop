"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number } | null>(null);
  const [cutoffPassed, setCutoffPassed] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(14, 0, 0, 0);

      if (now >= cutoff) {
        setCutoffPassed(true);
        setTimeLeft(null);
        return;
      }

      const diff = cutoff.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ h, m });
      setCutoffPassed(false);
    }

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-warm">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gold/20 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-brand/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-coral/10 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-surface-border animate-fade-in">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse-soft" />
            <span className="text-xs font-medium text-brand-muted">
              Same-day delivery in Nairobi
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4 animate-fade-in-up">
            Send something they&apos;ll{" "}
            <span className="text-gradient">actually love</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-brand-muted mb-8 animate-fade-in-up animate-delay-200">
            Curated gifts, delivered same-day. No guessing, no stress — just the
            perfect gift, every time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-8 animate-fade-in-up animate-delay-300">
            <Link
              href="/?category=birthdays"
              className="btn-brand flex items-center gap-2"
            >
              <span>Browse Gifts</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/gift-lab"
              className="btn-gold flex items-center gap-2"
            >
              <span>Build a Hamper</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
          </div>

          {/* Countdown Banner */}
          <div className="animate-fade-in-up animate-delay-400">
            {cutoffPassed ? (
              <div className="inline-flex items-center gap-3 bg-brand-deep text-white rounded-xl px-5 py-3">
                <span className="text-xl">🌙</span>
                <div>
                  <p className="font-medium text-sm">Same-day delivery resumes tomorrow</p>
                  <p className="text-white/60 text-xs">Order now for next-day delivery</p>
                </div>
              </div>
            ) : timeLeft ? (
              <div className="inline-flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-soft border border-surface-border">
                <div className="flex gap-1">
                  <span className="w-10 h-10 flex items-center justify-center bg-brand text-white rounded-lg font-display font-bold text-lg">
                    {timeLeft.h}
                  </span>
                  <span className="text-brand-muted font-bold">:</span>
                  <span className="w-10 h-10 flex items-center justify-center bg-brand text-white rounded-lg font-display font-bold text-lg">
                    {String(timeLeft.m).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Same-day cutoff</p>
                  <p className="text-xs text-brand-muted">Order before 2pm</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-surface-border animate-fade-in-up animate-delay-500">
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>749+ products</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>On-time guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Anonymous mode</span>
          </div>
        </div>
      </div>
    </section>
  );
}
