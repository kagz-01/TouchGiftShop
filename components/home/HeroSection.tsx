"use client";

import Link from "next/link";

export default function HeroSection() {
  const PRODUCTS = [
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1577212017184-80cc0da11082?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554522851-140b2b801a61?q=80&w=600&auto=format&fit=crop",
  ];

  const LIFESTYLE = [
    "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1525026198548-4baa0d203f19?q=80&w=600&auto=format&fit=crop",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-warm">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gold/20 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-brand/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-coral/10 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }} />

      <div className="w-full page-container-capped py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 xl:gap-12 items-center">
          
          {/* ── LEFT COLUMN: COPY & CTA ── */}
          <div className="max-w-2xl z-10">
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

          {/* ── RIGHT COLUMN: SPLIT STORY VISUALS ── */}
          <div className="relative h-[550px] hidden lg:flex gap-4 overflow-hidden rounded-[2.5rem] p-4 bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm animate-fade-in-up animate-delay-300">
            {/* Soft gradient masks to fade top and bottom edges smoothly */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface-warm to-transparent z-10 pointer-events-none rounded-t-[2.5rem]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-warm to-transparent z-10 pointer-events-none rounded-b-[2.5rem]" />
            
            {/* Column 1: Premium Products (Scrolling Up) */}
            <div className="flex-1 relative">
              <div className="flex flex-col gap-4 animate-marquee-vertical hover:[animation-play-state:paused]">
                {[...PRODUCTS, ...PRODUCTS].map((src, i) => (
                  <div key={`prod-${i}`} className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-white group border border-black/5">
                    <img src={src} alt="Premium Gift" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Emotional Reactions (Scrolling Down) */}
            <div className="flex-1 relative pt-12">
              <div className="flex flex-col gap-4 animate-marquee-vertical-reverse hover:[animation-play-state:paused]">
                {[...LIFESTYLE, ...LIFESTYLE].map((src, i) => (
                  <div key={`life-${i}`} className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-white group border border-black/5">
                    <img src={src} alt="Happy reaction" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
