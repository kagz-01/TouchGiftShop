"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Gift, Sparkles, Heart,
  Clock, PackageX, MapPin, Banknote,
  Target, Zap, EyeOff, ShoppingBag, CreditCard, Rocket,
  Building2,
  Camera
} from "lucide-react";
import type { ReviewWithMedia } from "@/lib/types";

/* ─── Scroll-triggered animation hook ─── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Counter animation ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Section wrapper with scroll reveal ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, visible } = useInView(0.15);
  const transforms: Record<string, string> = {
    up: visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
    left: visible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0",
    right: visible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0",
    scale: visible ? "scale-100 opacity-100" : "scale-90 opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${transforms[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function useTypewriter(messages: string[], typingSpeed = 260, pauseMs = 1700) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!messages.length) return;

    const currentWords = messages[messageIndex % messages.length].split(" ");
    const isDoneTyping = wordCount === currentWords.length;
    const isDoneDeleting = wordCount === 0;

    const timeout = window.setTimeout(() => {
      if (!deleting && isDoneTyping) {
        setDeleting(true);
        return;
      }

      if (deleting && isDoneDeleting) {
        setDeleting(false);
        setMessageIndex((value) => (value + 1) % messages.length);
        return;
      }

      setWordCount((value) => value + (deleting ? -1 : 1));
    }, deleting ? typingSpeed * 0.6 : isDoneTyping ? pauseMs : typingSpeed);

    return () => window.clearTimeout(timeout);
  }, [deleting, messageIndex, messages, pauseMs, typingSpeed, wordCount]);

  return messages.length
    ? messages[messageIndex % messages.length]
        .split(" ")
        .slice(0, wordCount)
        .join(" ")
    : "";
}

function highlightDeliveryCopy(text: string) {
  const highlights = ["3 PM", "same-day delivery", "tomorrow", "next day", "today", "today’s"];
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let matchStart = -1;
    let matchText = "";

    for (const phrase of highlights) {
      const index = text.toLowerCase().indexOf(phrase.toLowerCase(), cursor);
      if (index !== -1 && (matchStart === -1 || index < matchStart)) {
        matchStart = index;
        matchText = text.slice(index, index + phrase.length);
      }
    }

    if (matchStart === -1) {
      parts.push(text.slice(cursor));
      break;
    }

    if (matchStart > cursor) {
      parts.push(text.slice(cursor, matchStart));
    }

    parts.push(
      <span key={`${matchStart}-${matchText}`} className="text-gold font-semibold">
        {matchText}
      </span>
    );

    cursor = matchStart + matchText.length;
  }

  return parts;
}

/* ══════════════════════════════════════════════════════════
   SECTION 1: THE HOOK — 3/4 cinematic hero with logo reveal
   ══════════════════════════════════════════════════════════ */
export function HeroCinematic() {
  const [loaded, setLoaded] = useState(false);
  const deliveryMessage = useTypewriter([
    "TouchGift makes gifting feel thoughtful.",
    "Order now for fast same-day gift delivery in Nairobi.",
    "Wrapped beautifully. Delivered with care.",
  ]);

  useEffect(() => { setLoaded(true); }, []);

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
    <section className="relative min-h-[60vh] md:min-h-[75vh] flex items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand via-brand-deep to-[#14080D]">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-light/20 rounded-full blur-[140px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/15 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-coral/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 md:py-12 relative z-40">
        <div className="grid md:grid-cols-2 gap-8 xl:gap-16 items-center max-w-[1800px] mx-auto">
          
          {/* ── LEFT COLUMN: COPY & CTA ── */}
          <div className="w-full text-left">
            {/* Typewriter delivery note */}
            <div className={`inline-flex flex-col items-start bg-brand-deep/5 dark:bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 mb-4 border border-brand-deep/10 dark:border-white/10 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-white/60 dark:text-gold/80 mb-1 font-bold">
                TouchGift Promise
              </span>
              <div className="flex items-center gap-2 text-sm md:text-[15px] text-white/90 dark:text-white/90 font-medium tracking-tight min-h-[1.5rem] leading-snug">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
                <span className="whitespace-normal tracking-tight">
                  {highlightDeliveryCopy(deliveryMessage)}
                  <span className="inline-block w-[1px] h-4 align-middle bg-brand-deep/50 dark:bg-white/70 ml-0.5 animate-pulse" />
                </span>
              </div>
            </div>

            {/* Main headline */}
            <h1 className={`font-display font-bold text-white leading-[0.95] mb-4 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontSize: "clamp(2.5rem, 5vw + 1rem, 5rem)" }}
            >
              <span className="relative inline-block py-1 dark:text-shadow-glow">
                Elevate the art
                <br />
                <span className="relative inline-block">
                  <span className="text-gradient bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent tracking-tight">
                    of gifting
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 C50 2, 150 2, 198 8" stroke="url(#gold-gradient)" strokeWidth="3" strokeLinecap="round" className={loaded ? "animate-[draw-line_1s_ease-out_0.8s_forwards]" : ""} style={{ strokeDasharray: 200, strokeDashoffset: 200 }} />
                    <defs>
                      <linearGradient id="gold-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop offset="0%" stopColor="#D4A853" />
                        <stop offset="100%" stopColor="#E8C97A" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className={` text-white/75 max-w-xl mb-6 leading-relaxed transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontSize: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)" }}
            >
              Discover beautifully curated gifts for every occasion. We handle the presentation and same-day delivery across Nairobi, so you can focus on the moment.
            </p>

            {/* CTA */}
            <div className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Link
                href="/shop"
                className="group relative px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl text-lg overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Shop All Gifts
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <Link
                href="/gift-lab"
                className="group px-8 py-4 bg-brand-deep/5 dark:bg-white/10 backdrop-blur-sm text-white dark:text-white font-semibold rounded-2xl text-lg border border-white/20 dark:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Build a Hamper
                  <Sparkles className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Quick Action Pills */}
            <div className={`mt-8 flex flex-wrap items-center gap-3 transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Link href="/gift-finder" className="flex items-center gap-1.5 px-4 py-2 bg-brand-deep/5 hover:bg-brand-deep/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-brand-deep/10 dark:border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white transition-all">
                <Target className="w-3.5 h-3.5 text-coral" />
                AI Gift Match
              </Link>
              <Link href="/shop?category=corporate" className="flex items-center gap-1.5 px-4 py-2 bg-brand-deep/5 hover:bg-brand-deep/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-brand-deep/10 dark:border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white transition-all">
                <Building2 className="w-3.5 h-3.5 text-gold" />
                Corporate Gifts
              </Link>
              <Link href="/pool/create" className="flex items-center gap-1.5 px-4 py-2 bg-brand-deep/5 hover:bg-brand-deep/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-brand-deep/10 dark:border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white transition-all">
                <span className="text-[14px]">👥</span>
                Pool a Gift
              </Link>
              <Link href="/surprise" className="flex items-center gap-1.5 px-4 py-2 bg-brand-deep/5 hover:bg-brand-deep/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-brand-deep/10 dark:border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white transition-all">
                <EyeOff className="w-3.5 h-3.5 text-brand-light" />
                Send Anonymously
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SPLIT STORY VISUALS ── */}
          <div className={`relative h-[320px] md:h-[380px] xl:h-[440px] hidden md:flex gap-4 overflow-hidden rounded-[2.5rem] transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            
            {/* Column 1: Premium Products (Scrolling Up) */}
            <div className="flex-1 relative">
              <div className="flex flex-col gap-4 animate-marquee-vertical hover:[animation-play-state:paused]">
                {[...PRODUCTS, ...PRODUCTS].map((src, i) => (
                  <div key={`prod-${i}`} className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-brand-deep/5 dark:bg-white/10 group border border-brand-deep/10 dark:border-white/10">
                    <img src={src} alt="Premium Gift" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Emotional Reactions (Scrolling Down) */}
            <div className="flex-1 relative pt-12">
              <div className="flex flex-col gap-4 animate-marquee-vertical-reverse hover:[animation-play-state:paused]">
                {[...LIFESTYLE, ...LIFESTYLE].map((src, i) => (
                  <div key={`life-${i}`} className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-brand-deep/5 dark:bg-white/10 group border border-brand-deep/10 dark:border-white/10">
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

/* ══════════════════════════════════════════════════════════
   SECTION 2: THE PROBLEM — Relatable pain point
   ══════════════════════════════════════════════════════════ */
export function ProblemSection() {
  const problems = [
    { 
      title: "The Racing Clock", 
      desc: "Forgot an important date? We orchestrate lightning-fast same-day deliveries across Nairobi, ensuring your gesture arrives exactly when it should.",
      icon: <Clock className="w-8 h-8 text-brand" />,
      colSpan: "md:col-span-2",
      bg: "bg-blush/40 dark:bg-white/5",
      titleColor: "text-brand-deep dark:text-white",
      textColor: "text-brand-deep/75 dark:text-white/70",
    },
    { 
      title: "Uninspired Choices", 
      desc: "We bypass the ordinary, offering only meticulously curated pieces designed to leave a lasting impression.",
      icon: <PackageX className="w-8 h-8 text-gold" />,
      colSpan: "md:col-span-1",
      bg: "bg-surface-secondary dark:bg-white/5",
      titleColor: "text-brand-deep dark:text-white",
      textColor: "text-brand-deep/75 dark:text-white/70",
    },
    { 
      title: "Logistical Headaches", 
      desc: "No address? No problem. We seamlessly coordinate with your recipient, preserving the magic without the stress.",
      icon: <MapPin className="w-8 h-8 text-coral" />,
      colSpan: "md:col-span-1",
      bg: "bg-surface-warm dark:bg-white/5",
      titleColor: "text-brand-deep dark:text-white",
      textColor: "text-brand-deep/75 dark:text-white/70",
    },
    { 
      title: "Unexpected Costs", 
      desc: "Experience absolute transparency. What you see is exactly what you pay—no hidden fees, just pure peace of mind.",
      icon: <Banknote className="w-8 h-8 text-brand" />,
      colSpan: "md:col-span-2",
      bg: "bg-white dark:bg-white/5",
      titleColor: "text-brand-deep dark:text-white",
      textColor: "text-brand-deep/75 dark:text-white/70",
    },
  ];

  return (
    <section className="py-10 md:py-14 section-theme-a relative overflow-hidden">
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              The Gifting Dilemma
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold mb-6 text-theme-heading">
              Finding the perfect gift
              <br />
              <span className="text-theme-muted font-normal italic">is often harder than it should be.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-theme-body text-lg leading-relaxed">
              You want to show how much you care, but finding the perfect gift shouldn't be stressful. We're here to make the experience as beautiful as the gesture itself.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <Reveal key={i} delay={300 + i * 150} direction="up" className={p.colSpan}>
              <div className={`h-full p-6 md:p-8 shape-premium-card border border-brand/5 shadow-soft hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 group card-theme backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="mb-4 p-3 bg-brand/10 dark:bg-white/10 shape-premium-button shadow-sm inline-block group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    {p.icon}
                  </div>
                  <h3 className={`text-2xl font-display font-bold mb-3 heading-elegant text-theme-heading`}>{p.title}</h3>
                  <p className={`leading-relaxed text-elegant text-theme-body`}>{p.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3: THE SOLUTION — Brand reveal
   ══════════════════════════════════════════════════════════ */
export function SolutionSection() {
  const bentoCards = [
    {
      icon: <Target className="w-8 h-8 text-gold" />,
      title: "Bespoke Curation",
      desc: "Each piece is hand-selected for uncompromising quality and elegance, ensuring every unboxing is a moment of pure delight.",
      colSpan: "md:col-span-2 lg:col-span-2",
      bg: "bento-card-theme",
      accentColor: "group-hover:border-gold/50",
      isBrand: false,
    },
    {
      icon: <Zap className="w-8 h-8 text-brand" />,
      title: "Impeccable Timing",
      desc: "Swift, seamless delivery across Nairobi, arriving beautifully presented exactly when it matters most.",
      colSpan: "md:col-span-1 lg:col-span-1",
      bg: "bento-card-theme",
      accentColor: "group-hover:border-brand/40",
      isBrand: false,
    },
    {
      icon: <MapPin className="w-8 h-8 text-coral" />,
      title: "The Mystery Pin-Drop",
      desc: "A touch of mystery. We discreetly coordinate the delivery location with them, preserving the magic of the surprise.",
      colSpan: "md:col-span-1 lg:col-span-1",
      bg: "bento-card-theme",
      accentColor: "group-hover:border-coral/40",
      isBrand: false,
    },
    {
      icon: <EyeOff className="w-8 h-8 text-brand-light" />,
      title: "Absolute Discretion",
      desc: "Total discretion. Price tags and sender details are entirely removed, allowing the sentiment to speak for itself.",
      colSpan: "md:col-span-1 lg:col-span-1",
      bg: "bento-card-theme",
      accentColor: "group-hover:border-brand-light/40",
      isBrand: false,
    },
    {
      icon: <Camera className="w-8 h-8 text-success" />,
      title: "A Glimpse of Joy",
      desc: "See the magic unfold. You receive a photograph of the exquisitely wrapped gift just before it begins its journey.",
      colSpan: "md:col-span-1 lg:col-span-1",
      bg: "bento-card-theme",
      accentColor: "group-hover:border-success/40",
      isBrand: false,
    },
  ];

  return (
    <section className="py-10 md:py-14 section-theme-c relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gold/8 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-brand/25 rounded-full blur-[100px] pointer-events-none animate-pulse-soft" style={{ animationDelay: "1s" }} />

      {/* Top/bottom gold rule */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        {/* Heading block */}
        <div className="text-center mb-4">
          <Reveal direction="scale">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-gold/30 bg-gradient-to-br from-gold/20 to-gold/5 shadow-[0_0_48px_rgba(212,168,83,0.25)] animate-float">
              <Gift className="w-10 h-10 text-gold" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold italic tracking-wide text-theme-heading mb-6">
              The Art of{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                Gifting
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-theme-body max-w-2xl mx-auto mb-4 text-lg leading-relaxed">
              We don't just fulfil orders. We architect emotional experiences, transforming the act of giving into an unforgettable story.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bentoCards.map((card, i) => (
            <Reveal key={i} delay={300 + i * 100} direction="up" className={card.colSpan}>
              <div
                className={`group relative h-full shape-premium-bento p-6 md:p-8 text-left border ${
                  card.isBrand ? 'border-white/10' : 'border-brand/8 dark:border-white/10'
                } ${
                  card.accentColor
                } transition-all duration-500 overflow-hidden cursor-default ${
                  card.bg
                }`}
              >
                {/* Per-card shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${
                    card.isBrand ? 'bg-white/10' : 'bg-brand/8 dark:bg-white/10'
                  } backdrop-blur-md flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                    {card.icon}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-theme-heading mb-3 italic group-hover:text-gold transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-theme-body leading-relaxed group-hover:text-theme-heading transition-colors duration-300">
                    {card.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 4: HOW IT WORKS — 3-step process
   ══════════════════════════════════════════════════════════ */
export function StoryHowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <ShoppingBag className="w-9 h-9 text-gold" />,
      title: "Curate the Perfect Gift",
      desc: "Explore our exquisite collections by occasion or mood, or let our intelligent concierge find the ideal match in seconds.",
      accent: "from-gold/20 to-gold/5",
      borderHover: "hover:border-gold/50",
      numColor: "text-gold",
    },
    {
      num: "02",
      icon: <CreditCard className="w-9 h-9 text-brand-light" />,
      title: "Effortless Checkout",
      desc: "A frictionless experience. Securely complete your order and add a bespoke, heartfelt message—no account required.",
      accent: "from-brand-light/20 to-brand-light/5",
      borderHover: "hover:border-brand-light/40",
      numColor: "text-brand-light",
    },
    {
      num: "03",
      icon: <Rocket className="w-9 h-9 text-success" />,
      title: "The Grand Reveal",
      desc: "We meticulously wrap and dispatch your gift. You receive a final photograph before it departs, ensuring absolute perfection.",
      accent: "from-success/20 to-success/5",
      borderHover: "hover:border-success/40",
      numColor: "text-success",
    },
  ];

  return (
    <section className="py-10 md:py-14 section-theme-b relative overflow-hidden">
      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="w-full px-4 md:px-12 lg:px-16 relative z-10">
        {/* Heading */}
        <div className="text-center mb-4">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Effortless Gifting
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold italic tracking-wide text-theme-heading">
              The Journey of a{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                Gift
              </span>
            </h2>
          </Reveal>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[16.67%] right-[16.67%] h-[1px] bg-gradient-to-r from-gold/30 via-brand-light/30 to-success/30 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 relative z-10">
            {steps.map((step, i) => (
              <Reveal key={i} delay={200 + i * 180} direction="up">
                <div
                  className={`group relative h-full shape-premium-card p-6 md:p-8 border border-brand/10 dark:border-white/10 ${step.borderHover} bg-gradient-to-br ${step.accent} backdrop-blur-sm card-theme transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2 overflow-hidden`}
                >
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Large background step number */}
                  <span className={`absolute -top-2 -right-2 font-display text-[7rem] font-black leading-none opacity-[0.06] ${step.numColor} select-none pointer-events-none`}>
                    {step.num}
                  </span>

                  <div className="relative z-10">
                    {/* Small numbered badge */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`font-display text-xs font-black uppercase tracking-[0.2em] ${step.numColor}`}>
                        Step {step.num}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 shape-premium-button bg-brand/10 dark:bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      {step.icon}
                    </div>

                    <h3 className="font-display text-2xl font-bold text-theme-heading mb-3 heading-elegant group-hover:text-gold transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-theme-body leading-relaxed text-elegant group-hover:text-theme-heading transition-colors duration-300">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 5: SOCIAL PROOF — Numbers + testimonials
   ══════════════════════════════════════════════════════════ */
export function SocialProof() {
  const [reviews, setReviews] = useState<ReviewWithMedia[]>([]);

  useEffect(() => {
    fetch("/api/reviews?limit=10&sort=helpful")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  const displayReviews = reviews.length > 0
    ? reviews.map((r) => ({
        name: r.reviewer_name || r.reviewerName || "Anonymous",
        text: r.body || r.title || "",
        occasion: "Gift",
        stars: r.rating,
        initials: (r.reviewer_name || r.reviewerName || "A").slice(0, 2).toUpperCase(),
      }))
    : [
        { name: "Wanjiku M.", initials: "WM", text: "Saved me from a last-minute birthday disaster. Ordered at 1pm, delivered by 5pm. The flowers were gorgeous!", occasion: "Birthday", stars: 5 },
        { name: "Brian K.", initials: "BK", text: "The group gifting feature is genius. We pooled KSh 15,000 for our colleague's send-off. Everyone paid separately — no awkward cash collection.", occasion: "Corporate", stars: 5 },
        { name: "Amina H.", initials: "AH", text: "Anonymous mode is everything. Sent a 'just because' gift without them knowing it was me. No drama, just vibes.", occasion: "Just Because", stars: 5 },
        { name: "Kevin O.", initials: "KO", text: "The presentation is what did it for me. The box, the ribbon, the handwritten note — it felt so premium.", occasion: "Anniversary", stars: 5 },
        { name: "Stella N.", initials: "SN", text: "My mom actually cried when she got the wellness hamper. They didn't just deliver a box, they delivered a moment.", occasion: "Mother's Day", stars: 5 },
      ];

  const stats = [
    { target: 2400, suffix: "+", label: "Gifts sent", icon: "🎁" },
    { target: 98, suffix: "%", label: "On-time delivery", icon: "⚡" },
    { target: 749, suffix: "+", label: "Products", icon: "🛍️" },
    { target: 4, suffix: ".9★", label: "Average rating", icon: "⭐" },
  ];

  const StarRow = ({ count }: { count: number }) => (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, j) => (
        <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section className="py-10 md:py-14 section-theme-e relative overflow-hidden">
      {/* Subtle warm gradient top */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Heading */}
        <div className="text-center mb-4">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Real people. Real moments.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold mb-4 text-theme-heading">
              Loved by{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                gift-givers
              </span>{" "}
              across Nairobi
            </h2>
          </Reveal>
        </div>

        {/* Stats — editorial large numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4 md:mb-6">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 80} direction="up">
              <div className="group relative shape-premium-card p-6 card-theme text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative z-10">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="font-display text-4xl md:text-5xl font-black text-theme-heading mb-1">
                    <Counter target={stat.target} suffix={stat.suffix} />
                  </p>
                  <p className="text-theme-body text-sm font-medium italic">{stat.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials Marquee */}
        <Reveal>
          <div className="relative flex overflow-x-hidden group w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -ml-4 md:-ml-8 px-4 md:px-8 py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            {[0, 1].map((track) => (
              <div
                key={track}
                aria-hidden={track === 1}
                className="animate-marquee flex gap-5 min-w-full shrink-0 items-stretch group-hover:[animation-play-state:paused]"
              >
                {displayReviews.map((t, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[300px] md:w-[360px] card-theme rounded-[1.5rem] p-6 flex flex-col gap-4 whitespace-normal"
                  >
                    {/* Stars */}
                    <StarRow count={t.stars} />

                    {/* Quote */}
                    <p className="text-sm md:text-base leading-relaxed text-theme-heading flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>

                    {/* Author row */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-deep flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{t.initials}</span>
                        </div>
                        <span className="font-semibold text-sm tracking-wide text-theme-heading">{t.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-brand/8 text-gold px-3 py-1.5 rounded-full">
                        {t.occasion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 7: FINAL CTA — Convert
   ══════════════════════════════════════════════════════════ */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden section-theme-g py-10 md:py-14 flex items-center justify-center text-center border-t border-brand/10 dark:border-white/10">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[10%] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[130px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-brand/5 rounded-full blur-[80px]" />
      </div>

      <div className="w-full page-container relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 backdrop-blur-sm border border-brand/10 rounded-full mb-6">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-theme-body text-xs font-semibold tracking-wide">Now delivering across Nairobi</span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display display-heading font-bold text-theme-heading mb-4">
            Ready to create
            <br />
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              an unforgettable
            </span>
            <br />
            moment?
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-lg md:text-xl text-theme-body max-w-2xl mx-auto mb-6 leading-relaxed">
            Skip the stress. We curate, wrap beautifully, and deliver with care — so all you have to do is watch them smile.
          </p>
        </Reveal>

        {/* Primary CTAs */}
        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/shop"
              className="group relative inline-flex px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(212,168,83,0.5)] hover:-translate-y-1 items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Send a Gift Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link
              href="/gift-finder"
              className="group px-8 py-4 bg-brand-deep/5 dark:bg-white/10 backdrop-blur-sm text-theme-heading font-semibold rounded-2xl text-lg border border-surface-border hover:bg-brand/10 dark:hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center justify-center gap-2">
                AI Gift Finder
                <Target className="w-5 h-5 text-coral group-hover:scale-110 transition-transform" />
              </span>
            </Link>
          </div>
        </Reveal>

        {/* Secondary CTAs — new features */}
        <Reveal delay={400}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link
              href="/gift-cards"
              className="group card-theme rounded-2xl p-5 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-gold" />
              </div>
              <p className="font-display font-bold text-theme-heading text-sm mb-1">Gift Cards</p>
              <p className="text-theme-body text-xs">Let them choose. Digital codes sent instantly.</p>
            </Link>
            <Link
              href="/referrals"
              className="group card-theme rounded-2xl p-5 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-display font-bold text-theme-heading text-sm mb-1">Refer &amp; Earn</p>
              <p className="text-theme-body text-xs">Earn 1,000 pts (≈KSh 500) when friends order. Share your code.</p>
            </Link>
            <Link
              href="/subscriptions"
              className="group card-theme rounded-2xl p-5 border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-brand" />
              </div>
              <p className="font-display font-bold text-theme-heading text-sm mb-1">Gift Subscriptions</p>
              <p className="text-theme-body text-xs">Never forget a birthday. AI auto-sends gifts.</p>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

