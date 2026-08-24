"use client";
import Link from "next/link";
import { Users, ShoppingBag, Sparkles, ArrowRight, Gift, Heart, CreditCard, Rocket } from "lucide-react";

export default function SuperpowersStrip() {
  return (
    <section className="py-10 md:py-14 section-theme-c">
      <div className="w-full page-container-capped">
        {/* Section label */}
        <div className="text-center mb-6">
          <p className="text-brand font-bold text-xs uppercase tracking-[0.2em] mb-3">
            TouchGift Exclusives
          </p>
          <h2 className="text-2xl md:text-3xl text-theme-heading leading-tight heading-elegant">
            Two ways to go{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              beyond the ordinary
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gift Pool Card */}
          <Link
            href="/pool/create"
            className="group relative block overflow-hidden bento-card-theme shape-premium-bento p-8 md:p-10 border border-brand/8 hover:border-gold/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(155,27,90,0.12)] hover:-translate-y-1.5"
          >
            {/* Animated orb */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-gold/15 rounded-full group-hover:scale-125 transition-transform duration-700 blur-sm" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full gap-4">
              {/* Icon */}
              <div className="w-14 h-14 bg-brand/8 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-gold group-hover:scale-110 transition-all duration-300 self-start">
                <Users className="w-7 h-7 text-brand group-hover:text-white transition-colors" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl md:text-2xl text-theme-heading mb-2 heading-elegant">
                  Start a Gift Pool
                </h3>
                <p className="text-theme-body leading-relaxed max-w-sm text-elegant">
                  Gather friends and family to gift something extraordinary. We elegantly manage the contributions and deliver a breathtaking surprise.
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
            className="group relative block overflow-hidden bento-card-theme shape-premium-bento p-8 md:p-10 border border-brand/8 hover:border-brand/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(155,27,90,0.12)] hover:-translate-y-1.5"
          >
            {/* Animated orb */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand/8 rounded-full group-hover:scale-125 transition-transform duration-700 blur-sm" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full gap-4">
              {/* Icon */}
              <div className="w-14 h-14 bg-brand/8 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-brand group-hover:scale-110 transition-all duration-300 self-start">
                <ShoppingBag className="w-7 h-7 text-brand group-hover:text-white transition-colors" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl md:text-2xl text-theme-heading mb-2 heading-elegant">
                  Build a Hamper
                </h3>
                <p className="text-theme-body leading-relaxed max-w-sm text-elegant">
                  Curate a masterpiece piece by piece. We meticulously arrange, wrap, and ribbon your selections into a bespoke experience they will cherish.
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

        {/* New features row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <Link href="/gift-cards" className="group flex items-center gap-3 card-theme rounded-2xl p-4 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="font-semibold text-sm text-theme-heading">Gift Cards</p>
              <p className="text-[11px] text-theme-body">Digital, instant delivery</p>
            </div>
          </Link>
          <Link href="/referrals" className="group flex items-center gap-3 card-theme rounded-2xl p-4 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-theme-heading">Refer &amp; Earn</p>
              <p className="text-[11px] text-theme-body">Earn 1,000 pts (≈KSh 500) per friend</p>
            </div>
          </Link>
          <Link href="/subscriptions" className="group flex items-center gap-3 card-theme rounded-2xl p-4 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Rocket className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-sm text-theme-heading">Gift Subscriptions</p>
              <p className="text-[11px] text-theme-body">Never forget a birthday</p>
            </div>
          </Link>
          <Link href="/account" className="group flex items-center gap-3 card-theme rounded-2xl p-4 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-sm text-theme-heading">Loyalty Points</p>
              <p className="text-[11px] text-theme-body">Earn & redeem on every order</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
