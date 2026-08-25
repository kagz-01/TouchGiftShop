"use client";

import Link from "next/link";

export default function HeroSection() {
  const PRODUCTS = [
    "/Hero/3-luxury-gifts-in-1-box.webp",
    "/Hero/chocolates.webp",
    "/Hero/flowers-chocolate.webp",
    "/Hero/perfume-bouquet.webp",
    "/Hero/perfume-hamper.webp",
    "/Hero/couple-jewelry.webp",
    "/Hero/glow-in-the-dark-necklace-and-bracelet-set-color-black-silver-size-os.webp",
    "/Hero/Luxury-Packaging_3.webp",
  ];

  const LIFESTYLE = [
    "/Hero/jearsy.webp",
    "/Hero/caps.webp",
    "/Hero/shades.webp",
    "/Hero/bags.webp",
    "/Hero/runners-gifts.webp",
    "/Hero/gymn-hamper.webp",
    "/Hero/women-set.webp",
    "/Hero/saudades-pai.webp",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-warm">
      {/* Decorative Elements — kept subtle, no blur on image area */}

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
          <div className="relative h-[550px] hidden lg:flex gap-4 overflow-hidden rounded-[2.5rem] animate-fade-in-up animate-delay-300">
            {/* Columns wrapper */}
            
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
