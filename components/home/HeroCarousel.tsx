"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: 1,
    tag: "Same-Day Delivery",
    title: "Send Love,\nInstantly",
    subtitle: "Beautiful gifts delivered same-day in Nairobi. M-Pesa checkout in seconds.",
    cta: { label: "Shop Now", href: "/?category=birthdays" },
    secondaryCta: { label: "Gift Finder", href: "/gift-finder" },
    gradient: "from-brand-dark via-brand to-brand-light",
    emoji: "🎁",
  },
  {
    id: 2,
    tag: "Group Gifting",
    title: "Pool a Gift,\nSplit the Joy",
    subtitle: "Start a group fund for weddings, birthdays, or baby showers. Everyone contributes via M-Pesa.",
    cta: { label: "Start a Pool", href: "/pool/create" },
    secondaryCta: { label: "How it Works", href: "/gift-lab" },
    gradient: "from-brand-dark via-[#7B1144] to-brand",
    emoji: "Pool",
  },
  {
    id: 3,
    tag: "Corporate Gifting",
    title: "Delight Your\nTeam",
    subtitle: "Bulk gifts with volume discounts. Personalized hampers for 10+ employees.",
    cta: { label: "Corporate Orders", href: "/corporate" },
    secondaryCta: { label: "Build a Hamper", href: "/gift-lab/build-hamper" },
    gradient: "from-[#1A1A2E] via-brand-dark to-brand",
    emoji: "🏢",
  },
  {
    id: 4,
    tag: "Recipient-Led Delivery",
    title: "They Drop\nthe Pin",
    subtitle: "Don't know their address? Let them choose the exact delivery spot. No price shown.",
    cta: { label: "See How", href: "/delivery" },
    secondaryCta: { label: "Shop Gifts", href: "/" },
    gradient: "from-brand via-brand-dark to-[#1A1A2E]",
    emoji: "📍",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br transition-all duration-700",
        slide.gradient
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-5 select-none pointer-events-none">
          {slide.emoji}
        </div>
      </div>

      <div className="page-container py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              {slide.tag}
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] whitespace-pre-line">
              {slide.title}
            </h1>

            <p className="text-white/70 text-sm md:text-base max-w-md leading-relaxed">
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={slide.cta.href}
                className="px-6 py-3 bg-gold text-brand-deep rounded-xl font-bold text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {slide.cta.label}
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-6 animate-float" />
              <div className="absolute inset-0 bg-white/10 rounded-3xl -rotate-3 animate-float" style={{ animationDelay: "0.5s" }} />
              <div className="absolute inset-0 bg-white/10 rounded-3xl flex items-center justify-center">
                <span className="text-8xl">{slide.emoji}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-gold"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
