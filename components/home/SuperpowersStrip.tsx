"use client";
import Link from "next/link";
import { Users, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

export default function SuperpowersStrip() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="w-full page-container-capped">
        {/* Section label */}
        <div className="text-center mb-12">
          <p className="text-brand font-bold text-xs uppercase tracking-[0.2em] mb-3">
            TouchGift Exclusives
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-deep leading-tight">
            Two ways to go{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              beyond the ordinary
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gift Pool Card */}
          <Link
            href="/gift-lab/pool"
            className="group relative block overflow-hidden bg-brand-bg rounded-[2rem] p-10 md:p-12 border border-brand/5 hover:border-brand/25 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1.5"
          >
            {/* Animated orb */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-gold/15 rounded-full group-hover:scale-125 transition-transform duration-700 blur-sm" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full gap-6">
              {/* Icon */}
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-gold group-hover:scale-110 transition-all duration-300 self-start">
                <Users className="w-7 h-7 text-brand group-hover:text-white transition-colors" />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 rounded-full mb-4">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">New Feature</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-brand-deep mb-3">
                  Start a Gift Pool
                </h3>
                <p className="text-brand-muted leading-relaxed max-w-sm">
                  Chip in with friends or colleagues to get them something truly premium. We handle the money collection and the flawless delivery — stress-free.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-brand group-hover:text-gold transition-colors duration-300">
                Pool a Gift
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Build a Hamper Card */}
          <Link
            href="/gift-lab"
            className="group relative block overflow-hidden bg-blush rounded-[2rem] p-10 md:p-12 border border-brand/5 hover:border-brand/25 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1.5"
          >
            {/* Animated orb */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand/8 rounded-full group-hover:scale-125 transition-transform duration-700 blur-sm" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full gap-6">
              {/* Icon */}
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-brand group-hover:scale-110 transition-all duration-300 self-start">
                <ShoppingBag className="w-7 h-7 text-brand group-hover:text-white transition-colors" />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/8 rounded-full mb-4">
                  <Sparkles className="w-3 h-3 text-brand" />
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">Fully Custom</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-brand-deep mb-3">
                  Build a Hamper
                </h3>
                <p className="text-brand-muted leading-relaxed max-w-sm">
                  Handpick every single item. We'll beautifully curate, package, and ribbon it up — creating a one-of-a-kind gifting experience they'll never forget.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-brand group-hover:text-brand-dark transition-colors duration-300">
                <Sparkles className="w-4 h-4" />
                Start Building
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
