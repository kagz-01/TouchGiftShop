import Link from "next/link";
import { ArrowLeft, ShoppingBag, Users, Sparkles, Shield, Clock, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Lab | TouchGift",
  description: "Build a custom hamper or pool a gift with friends. Two creative ways to give something truly special.",
};

export default function GiftLabPage() {
  return (
    <div className="min-h-screen section-theme-c">
      {/* ── Header ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-brand-deep text-sm leading-none">Gift Lab</h1>
            <p className="text-[11px] text-brand-muted mt-0.5">Two creative ways to make someone&apos;s day</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero copy */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/8 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[11px] font-semibold text-brand uppercase tracking-wider">Gift Lab</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-deep mb-3 leading-tight">
            Go beyond the generic.
          </h2>
          <p className="text-brand-muted max-w-md mx-auto text-sm leading-relaxed">
            Handpick every item in a custom hamper, or rally your group to chip in together.
            Either way, we&apos;ll make sure it arrives wrapped beautifully.
          </p>
        </div>

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Build a Hamper */}
          <Link
            href="/gift-lab/build-hamper"
            id="gift-lab-hamper-link"
            className="group block relative overflow-hidden bg-white rounded-3xl p-7 border border-black/6 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-brand group-hover:scale-105 transition-all duration-300">
                <ShoppingBag className="w-6 h-6 text-brand group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-xl font-bold text-brand-deep mb-2 group-hover:text-brand transition-colors">
                Build a Hamper
              </h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-5">
                Choose a box, handpick every item inside. Perfect for when you want something personal, curated, and unique.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Custom sizes", "100+ products", "Beautiful boxing"].map((tag) => (
                  <span key={tag} className="text-[10px] bg-brand/8 text-brand px-2.5 py-1 rounded-full font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-brand group-hover:gap-2.5 transition-all">
                Start building
                <span className="text-base">→</span>
              </div>
            </div>
          </Link>

          {/* Pool a Gift */}
          <Link
            href="/pool/create"
            id="gift-lab-pool-link"
            className="group block relative overflow-hidden bg-white rounded-3xl p-7 border border-black/6 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/8 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gold/15 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-gold group-hover:scale-105 transition-all duration-300">
                <Users className="w-6 h-6 text-gold-dark group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-xl font-bold text-brand-deep mb-2 group-hover:text-gold-dark transition-colors">
                Pool a Gift
              </h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-5">
                Rally friends, family, or colleagues to chip in together. Share a link — everyone pays their portion via M-Pesa.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Split the cost", "M-Pesa friendly", "Auto-orders"].map((tag) => (
                  <span key={tag} className="text-[10px] bg-gold/15 text-gold-dark px-2.5 py-1 rounded-full font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-gold-dark group-hover:gap-2.5 transition-all">
                Start a pool
                <span className="text-base">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Shield className="w-4 h-4 text-brand" />, label: "Secure payments" },
            { icon: <Clock className="w-4 h-4 text-brand" />, label: "Same-day delivery" },
            { icon: <Heart className="w-4 h-4 text-brand" />, label: "Beautifully wrapped" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-black/5 flex flex-col items-center gap-2 text-center">
              {item.icon}
              <p className="text-[11px] font-medium text-brand-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
