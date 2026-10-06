"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Gift, Sparkles,
  MapPin,
  Target, Zap, EyeOff, ShoppingBag, CreditCard, Rocket,
  Building2,
  Camera
} from "lucide-react";
import type { ReviewWithMedia } from "@/lib/types";
import { formatKsh } from "@/lib/utils";
import type { CorporateShot } from "@/app/page";
import { useMood, MOODS } from "@/context/MoodContext";

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
  const highlights = ["same-day delivery", "tomorrow", "next day", "today", "today’s"];
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

// The 6 hero moods. Hoisted to module scope on purpose: HeroCinematic
// re-renders ~4x/second off the typewriter below, and an inline .filter()
// produced a new array reference each time — which reset the rotation
// interval on every render, so the 3s timer never got to elapse.
const HERO_MOODS = MOODS.filter((m) =>
  ["default", "corporate", "flowers", "liquor", "perfumes", "hampers"].includes(m.id)
);

const MOOD_TYPEWRITER_MESSAGES: Record<string, string[]> = {
  default:      ["Your ultimate gifting concierge.", "We curate the best gifts across Nairobi.", "Checkout securely on our partner stores.", "Wrapped beautifully. Delivered with care."],
  corporate:    ["Professional gifts. On time. Every time. 🏢", "Impeccable corporate gifting across Nairobi.", "Delivered with precision, branded with care."],
  flowers:      ["Love, wrapped and delivered today. 🌹", "Because flowers say what words cannot.", "Make their heart skip — same-day romance delivered."],
  liquor:       ["Let the celebrations begin! 🥂", "Pop. Confetti. Wow. Same-day delivery.", "Premium spirits that match the moment."],
  perfumes:     ["Authentic designer fragrances. ✨", "A memory in a bottle.", "The ultimate sensory gift delivered today."],
  hampers:      ["Generosity, beautifully packaged. 🧺", "Overflowing hampers of fresh fruits.", "Artisan treats and bespoke gifts."],
};

/* ══════════════════════════════════════════════════════════
   SECTION 1: THE HOOK — 3/4 cinematic hero with logo reveal
   ══════════════════════════════════════════════════════════ */
export function HeroCinematic() {
  const [loaded, setLoaded] = useState(false);
  const { moodMeta, setMood, clearMood, mood } = useMood();
  // Hovering the tab row pauses so you can read it; clicking a mood pins it
  // and it stays pinned after the pointer leaves, until you click it again.
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isPaused = isPinned || isHovered;

  // Background mapping
  const heroBackgrounds: Record<string, string> = {
    default: "/hero/hero-all-vibe.webp",
    corporate: "/hero/hero-corporate.webp",
    flowers: "/hero/hero-flowers.webp",
    liquor: "/hero/hero-liqour.webp",
    perfumes: "/hero/hero-perfume.webp",
    hampers: "/hero/hero-fruits.webp"
  };

  // Mount only the current mood's backdrop and the one it cross-fades into.
  const activeHeroIndex = HERO_MOODS.findIndex((m) => m.id === moodMeta.id);
  const VISIBLE_HERO_INDICES = new Set([
    activeHeroIndex < 0 ? 0 : activeHeroIndex,
    (activeHeroIndex + 1) % HERO_MOODS.length,
  ]);

  // Auto-rotate logic — every 7 seconds, so each mood lands before we move on
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const currentIndex = HERO_MOODS.findIndex(m => m.id === moodMeta.id);
      const nextIndex = (currentIndex + 1) % HERO_MOODS.length;
      setMood(HERO_MOODS[nextIndex].id, false);
    }, 7000);
    return () => clearInterval(interval);
  }, [moodMeta.id, isPaused, setMood]);

  const deliveryMessage = useTypewriter(
    MOOD_TYPEWRITER_MESSAGES[moodMeta.id] ?? MOOD_TYPEWRITER_MESSAGES.default
  );

  useEffect(() => { setLoaded(true); }, []);

  return (
    <section 
      className="relative min-h-screen -mt-[130px] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── CINEMATIC BACKGROUND IMAGES ──
          Only the active mood and the one we're about to cross-fade into are
          mounted. Rendering all six stacked at opacity 0/1 made the browser
          download every 1920x1080 hero (842KB) to show one, and apply a blur
          filter to five of them. Two is enough for the crossfade. */}
      {HERO_MOODS.map((m, i) => VISIBLE_HERO_INDICES.has(i) && (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${moodMeta.id === m.id ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={heroBackgrounds[m.id]}
            alt={`${m.label} mood background`}
            decoding="async"
            fetchPriority={moodMeta.id === m.id ? "high" : "auto"}
            className={`w-full h-full object-cover object-center transition-all ease-out ${
              moodMeta.id === m.id
                ? "duration-[5000ms] scale-105 blur-0"
                : "duration-[2000ms] scale-100 blur-sm"
            }`}
          />
          {/* Dark Overlay for better contrast */}
          <div className="absolute inset-0 bg-black/60 md:bg-black/40 transition-colors duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
        </div>
      ))}

      {/* Animated gradient orbs (Subtle) */}
      <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-light/20 rounded-full blur-[140px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/15 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      {/* ── FOREGROUND CONTENT — LEFT ALIGNED ── */}
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-[130px] md:pt-[140px] pb-10 md:pb-16 relative z-30 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-start max-w-3xl text-left">
          
          {/* Eyebrow */}
          <div className={`flex items-center gap-3 mb-3 md:mb-4 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="h-[1px] w-8 md:w-12 bg-gold"></div>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-gold font-bold">
              {moodMeta.id === "default" ? "TouchGift Signature" : moodMeta.tagline || "TouchGift Signature"}
            </span>
          </div>

          {/* Main headline */}
          <div className="flex items-center mb-4 md:mb-5 max-w-[600px]">
            <h1 className={`font-display font-bold text-white leading-[1.05] md:leading-[1.1] transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              <span className="relative inline-block py-1 drop-shadow-xl">
                {moodMeta.id === "default" ? (
                  <>
                    Elevate the
                    <br />
                    <span className="relative inline-block mt-1">
                      <span className="text-gradient bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent tracking-tight">
                        art of gifting
                      </span>
                      <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                        <path d="M2 8 C50 2, 150 2, 198 8" stroke="url(#gold-gradient)" strokeWidth="3" strokeLinecap="round" className={loaded ? "animate-[draw-line_1s_ease-out_0.8s_forwards]" : ""} style={{ strokeDasharray: 200, strokeDashoffset: 200 }} />
                        <defs>
                          <linearGradient id="gold-gradient" x1="0" y1="0" x2="200" y2="0">
                            <stop offset="0%" stopColor="#D4A853" />
                            <stop offset="100%" stopColor="#FFF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </>
                ) : (
                  <span
                    key={moodMeta.id}
                    className="bg-clip-text text-transparent animate-fade-in"
                    style={{ backgroundImage: "var(--mood-gradient-text, var(--mood-gradient, linear-gradient(to right, #D4A853, #FFFFFF)))" }}
                  >
                    {moodMeta.heroTitle}
                  </span>
                )}
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p key={`sub-${moodMeta.id}`} className={`text-white/90 max-w-lg mb-6 md:mb-8 leading-relaxed transition-all duration-1000 delay-400 animate-fade-in drop-shadow-lg font-medium ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} text-base md:text-lg`}
          >
            {moodMeta.id === "default"
              ? "Beautifully curated gifts for every occasion. Thoughtful, elegant and delivered with impeccable care."
              : moodMeta.heroSub
            }
          </p>

          {/* CTA & Features */}
          <div className={`flex flex-col items-start transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 md:mb-6 w-full sm:w-auto">
              <Link
                href={moodMeta.id === "corporate" ? "/corporate" : "/shop"}
                className="group relative px-8 py-3.5 font-bold rounded-full text-base md:text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center min-w-[180px]"
                style={{ background: "var(--mood-gradient, linear-gradient(to right, #D4A853, #E8C97A))", color: "var(--mood-on-gradient, #1A0A10)", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span key={moodMeta.cta} className="animate-fade-in">{moodMeta.cta}</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              
              {moodMeta.id === "default" && (
                <Link
                  href="/gift-lab/build-hamper"
                  className="group relative px-8 py-3.5 font-bold rounded-full text-base md:text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center min-w-[180px] bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Build a hamper
                  </span>
                </Link>
              )}

              {(moodMeta.id === "romantic" || moodMeta.id === "flowers") && (
                <button
                  className="group relative px-8 py-3.5 font-bold rounded-full text-base md:text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center min-w-[180px] bg-white text-[#5d1725] border border-white hover:bg-white/90 shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    Send anonymously
                  </span>
                </button>
              )}
            </div>

            {/* Features / Typewriter */}
            {moodMeta.id === "corporate" ? (
              <div className="flex items-center gap-2 text-xs md:text-sm text-white/90 font-medium tracking-tight">
                <span className="text-[#34A853]">✓</span> Professional gifts. On time. Every time. 🏢
              </div>
            ) : moodMeta.id === "romantic" || moodMeta.id === "flowers" ? (
              <div className="flex items-center gap-4 text-xs md:text-sm text-white/90 font-medium tracking-tight">
                <span className="flex items-center gap-1"><span className="text-[#34A853]">✓</span> Same-day Nairobi</span>
                <span className="flex items-center gap-1"><span className="text-[#34A853]">✓</span> Photo proof</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[13px] md:text-sm text-white/80 font-medium tracking-tight">
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="whitespace-normal">
                  {highlightDeliveryCopy(deliveryMessage)}
                  <span className="inline-block w-[1px] h-3.5 align-middle bg-white/70 ml-0.5 animate-pulse" />
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── BOTTOM PILL TAB NAVIGATOR ── */}
      <div 
        className="relative z-40 w-full pb-6 pt-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hint text */}
        <div className="text-center mb-3">
          <span className="text-white/50 text-[10px] uppercase tracking-widest font-semibold drop-shadow-md">
            Pick a mood to pin it · Auto-cycles every 7s
          </span>
        </div>

        {/* Tabs row */}
        <div className="flex justify-center w-full px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide max-w-full px-2 snap-x">
            {HERO_MOODS.map((m) => {
              const isActive = moodMeta.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (m.id === moodMeta.id && isPinned) {
                      setIsPinned(false); // unpin → resume cycling
                      clearMood();         // and hand the palette back
                    } else {
                      setMood(m.id, true); // deliberate: persists site-wide
                      setIsPinned(true);  // survives pointer leaving
                    }
                  }}
                  className={`snap-center relative px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border backdrop-blur-md overflow-hidden flex-shrink-0 ${
                    isActive 
                      ? 'bg-black/60 text-white border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105' 
                      : 'bg-black/30 text-white/60 border-white/10 hover:bg-black/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isActive && (
                    <div 
                      className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{ background: "var(--mood-gradient, linear-gradient(to right, #D4A853, #FFFFFF))" }}
                    />
                  )}
                  <span className="relative z-10 drop-shadow-md">{m.label}</span>

                  {/* Progress bar — shows 3s countdown on the active tab */}
                  {isActive && !isPaused && (
                    <span
                      key={`prog-${moodMeta.id}`}
                      className="absolute bottom-0 left-0 h-[2px] rounded-full animate-[grow-width_7s_linear_forwards]"
                      style={{ background: "var(--mood-gradient, linear-gradient(to right, #D4A853, #FFFFFF))" }}
                    />
                  )}
                </button>
              );
            })}
            
            {/* Custom Vibe Builder Button */}
            <button
              onClick={() => alert("Custom Builder coming soon!")}
              className="snap-center relative px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border border-white/20 bg-gradient-to-r from-brand/80 to-coral/80 text-white shadow-[0_0_15px_rgba(155,27,90,0.4)] hover:scale-105 flex-shrink-0 flex items-center gap-1.5 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Custom Vibe
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 2: THE PROBLEM — 4 compact cards, each with a
   looping mini-scene that only runs while on screen.
   ══════════════════════════════════════════════════════════ */

const DILEMMA_SCENE = "relative h-[140px] rounded-xl overflow-hidden flex-none bg-gradient-to-br from-brand/[0.04] to-gold/[0.03] dark:from-brand/[0.08] dark:to-gold/[0.05] flex items-center justify-center";

/* 1 — The Racing Clock */
function ClockScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <path d="M 0 110 Q 90 140 180 110" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="12" />
        <path d="M 0 110 Q 90 140 180 110" fill="none" stroke="#9B1B5A" strokeWidth="2" strokeDasharray="6 6" className="gd-road-svg" />
        <circle cx="90" cy="60" r="30" fill="white" stroke="#9B1B5A" strokeWidth="3" />
        <circle cx="90" cy="60" r="26" fill="url(#clockGrad)" />
        <line x1="90" y1="60" x2="90" y2="40" stroke="#9B1B5A" strokeWidth="3" strokeLinecap="round" className="gd-hand1-svg" />
        <line x1="90" y1="60" x2="105" y2="60" stroke="#D4A853" strokeWidth="3" strokeLinecap="round" className="gd-hand2-svg" />
        <circle cx="90" cy="60" r="4" fill="#9B1B5A" />
        <text x="20" y="115" fontSize="26" className="gd-scooter-svg">🛵</text>
        <defs>
          <linearGradient id="clockGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fdf8f9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* 2 — Uninspired Choices */
function PickScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <rect x="0" y="100" width="180" height="6" fill="rgba(0,0,0,0.1)" />
        <g className="gd-boxes-svg">
          <rect x="20" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
          <rect x="60" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
          <rect x="100" y="65" width="36" height="36" rx="6" fill="url(#brandGrad)" filter="url(#glow)" className="gd-perfect-svg" />
          <path d="M 118 65 L 118 101" stroke="white" strokeWidth="2" opacity="0.5" className="gd-perfect-svg" />
          <path d="M 100 83 L 136 83" stroke="white" strokeWidth="2" opacity="0.5" className="gd-perfect-svg" />
          <rect x="146" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
          <rect x="186" y="70" width="30" height="30" rx="4" fill="#e5e5e5" stroke="#ccc" strokeWidth="1" />
        </g>
        <text x="135" y="60" fontSize="16" className="gd-sparkle-svg">✨</text>
        <defs>
          <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B1B5A" />
            <stop offset="100%" stopColor="#D4A853" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/* 3 — Logistical Headaches */
function LogisticsScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <path d="M 30 70 Q 50 20, 80 80 T 120 40 T 150 70" fill="none" stroke="#ccc" strokeWidth="2" strokeDasharray="4 4" className="gd-chaos-svg" />
        <path d="M 30 70 Q 90 20 150 70" fill="none" stroke="#9B1B5A" strokeWidth="3" strokeDasharray="140" className="gd-smooth-svg" />
        <text x="30" y="80" textAnchor="middle" fontSize="24">🏠</text>
        <text x="150" y="80" textAnchor="middle" fontSize="24">🎁</text>
        <text x="150" y="45" textAnchor="middle" fontSize="24" className="gd-mappin-svg">📍</text>
      </svg>
    </div>
  );
}

/* 4 — Unexpected Costs */
function CostScene() {
  return (
    <div className={DILEMMA_SCENE}>
      <svg viewBox="0 0 180 140" className="w-full h-full" aria-hidden>
        <g className="gd-receipt-svg">
          <rect x="50" y="30" width="80" height="90" fill="white" filter="url(#shadow3)" />
          <path d="M 50 120 L 55 115 L 60 120 L 65 115 L 70 120 L 75 115 L 80 120 L 85 115 L 90 120 L 95 115 L 100 120 L 105 115 L 110 120 L 115 115 L 120 120 L 125 115 L 130 120" fill="white" />
          <rect x="60" y="45" width="40" height="4" fill="#ccc" rx="2" />
          <rect x="110" y="45" width="10" height="4" fill="#ccc" rx="2" />
          <rect x="60" y="60" width="30" height="4" fill="#ccc" rx="2" />
          <rect x="110" y="60" width="10" height="4" fill="#ccc" rx="2" />
          <line x1="60" y1="75" x2="120" y2="75" stroke="#eee" strokeWidth="2" />
          <rect x="60" y="85" width="20" height="6" fill="#221512" rx="2" />
          <rect x="100" y="85" width="20" height="6" fill="#221512" rx="2" className="gd-total-svg" />
        </g>
        <g className="gd-stamp-svg">
          <rect x="35" y="55" width="110" height="30" rx="4" fill="none" stroke="#22c55e" strokeWidth="3" transform="rotate(-15 90 70)" />
          <text x="90" y="76" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="800" letterSpacing="1" transform="rotate(-15 90 70)">NO HIDDEN FEES</text>
        </g>
        <defs>
          <filter id="shadow3">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
function DilemmaCard({
  title, desc, delay, children,
}: { title: string; desc: string; delay: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="gd-card card-theme shape-premium-card group flex h-full flex-col gap-3.5 overflow-hidden p-4 pb-5 transition-transform duration-500 hover:-translate-y-1.5">
        {children}
        <h3 className="font-display text-[17px] font-bold leading-snug text-theme-heading">{title}</h3>
        <p className="text-[12.5px] leading-relaxed text-theme-body">{desc}</p>
      </div>
    </Reveal>
  );
}

export function ProblemSection() {
  return (
    <section className="py-8 md:py-10 section-theme-a relative overflow-hidden">
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              The Gifting Dilemma
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold text-theme-heading">
              Care shouldn&apos;t feel like <span className="italic text-gold">work.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="w-10 h-px bg-gold/70 mx-auto mb-6 mt-4" />
            <p className="text-theme-body text-[15px] italic leading-relaxed">
              You want it to mean something. It shouldn&apos;t take all afternoon.
            </p>
          </Reveal>
        </div>

        <div className="gd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DilemmaCard
            delay={0}
            title="The Racing Clock"
            desc="Same-day delivery across Nairobi for the moments that cannot wait."
          >
            <ClockScene />
          </DilemmaCard>

          <DilemmaCard
            delay={100}
            title="Uninspired Choices"
            desc="A tightly curated edit so you are never scrolling through filler."
          >
            <PickScene />
          </DilemmaCard>

          <DilemmaCard
            delay={200}
            title="Logistical Headaches"
            desc="No address? We can coordinate discreetly with your recipient."
          >
            <LogisticsScene />
          </DilemmaCard>

          <DilemmaCard
            delay={300}
            title="Unexpected Costs"
            desc="Clear pricing and transparent delivery from the start."
          >
            <CostScene />
          </DilemmaCard>
        </div>
      </div>

      <style jsx global>{`
        /* ── 1 · clock ── */
        .gd-road-svg { stroke-dashoffset: 0; }
        .group:hover .gd-road-svg { animation: gd-road-anim 2s linear infinite; }
        @keyframes gd-road-anim { to { stroke-dashoffset: -24; } }

        .gd-hand1-svg { transform-origin: 90px 60px; transform: rotate(0deg); }
        .group:hover .gd-hand1-svg { animation: gd-spin 3s linear infinite; }

        .gd-hand2-svg { transform-origin: 90px 60px; transform: rotate(0deg); }
        .group:hover .gd-hand2-svg { animation: gd-spin 12s linear infinite; }

        @keyframes gd-spin { to { transform: rotate(360deg); } }

        .gd-scooter-svg { opacity: 1; transform: translateX(65px); }
        .group:hover .gd-scooter-svg { animation: gd-scooter-anim 4s ease-in-out infinite; }
        @keyframes gd-scooter-anim {
          0% { opacity: 0; transform: translateX(-40px); }
          20%, 80% { opacity: 1; transform: translateX(65px); }
          100% { opacity: 0; transform: translateX(180px); }
        }

        /* ── 2 · conveyor ── */
        .gd-boxes-svg { transform: translateX(-40px); }
        .group:hover .gd-boxes-svg { animation: gd-belt-anim 4s ease-in-out infinite; }
        @keyframes gd-belt-anim {
          0% { transform: translateX(0); }
          30%, 70% { transform: translateX(-40px); }
          100% { transform: translateX(-80px); opacity: 0; }
        }

        .gd-perfect-svg { transform-origin: 118px 83px; transform: scale(1.1); }
        .group:hover .gd-perfect-svg { animation: gd-perfect-anim 4s ease-in-out infinite; }
        @keyframes gd-perfect-anim {
          0% { transform: scale(1); }
          30%, 70% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .gd-sparkle-svg { opacity: 1; transform: scale(1); transform-origin: 143px 52px; }
        .group:hover .gd-sparkle-svg { animation: gd-sparkle-anim 4s ease-in-out infinite; }
        @keyframes gd-sparkle-anim {
          0%, 25% { opacity: 0; transform: scale(0); }
          35%, 65% { opacity: 1; transform: scale(1.3); }
          75%, 100% { opacity: 0; transform: scale(0); }
        }

        /* ── 3 · route ── */
        .gd-chaos-svg { opacity: 0; }
        .group:hover .gd-chaos-svg { animation: gd-chaos-anim 4s infinite; }
        @keyframes gd-chaos-anim { 0%, 30% { opacity: 1; } 40%, 100% { opacity: 0; } }

        .gd-smooth-svg { stroke-dashoffset: 0; }
        .group:hover .gd-smooth-svg { animation: gd-smooth-anim 4s infinite; }
        @keyframes gd-smooth-anim { 0%, 35% { stroke-dashoffset: 140; } 55%, 100% { stroke-dashoffset: 0; } }

        .gd-mappin-svg { opacity: 1; transform: translateY(0); }
        .group:hover .gd-mappin-svg { animation: gd-mappin-anim 4s infinite; }
        @keyframes gd-mappin-anim {
          0%, 55% { opacity: 0; transform: translateY(-20px); }
          65% { opacity: 1; transform: translateY(0); }
          75% { transform: translateY(-5px); }
          85%, 100% { opacity: 1; transform: translateY(0); }
        }

        /* ── 4 · receipt ── */
        .gd-receipt-svg { transform: translateY(0); }
        .group:hover .gd-receipt-svg { animation: gd-receipt-anim 4s ease-out infinite; }
        @keyframes gd-receipt-anim {
          0% { transform: translateY(60px); opacity: 0; }
          15%, 85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }

        .gd-total-svg { fill: #22c55e; }
        .group:hover .gd-total-svg { animation: gd-total-anim 4s infinite; }
        @keyframes gd-total-anim { 0%, 30% { fill: #221512; } 35%, 100% { fill: #22c55e; } }

        .gd-stamp-svg { transform-origin: 90px 70px; opacity: 1; transform: scale(1); }
        .group:hover .gd-stamp-svg { animation: gd-stamp-anim 4s infinite; }
        @keyframes gd-stamp-anim {
          0%, 40% { opacity: 0; transform: scale(2); }
          50% { opacity: 1; transform: scale(0.9); }
          55%, 90% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .gd * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3: THE SOLUTION — Brand reveal
   ══════════════════════════════════════════════════════════ */
export function SolutionSection({ shots }: { shots: CorporateShot[] }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Real in-stock catalogue photography rather than hotlinked stock: the
  // Unsplash set was returning 16/16 broken, and a failed <img> renders its alt
  // text at the tile origin, which spilled outside the rounded frame.
  // Alternate tall/short within the same column for a masonry effect (rectangle, square, rectangle)
  const A = shots.filter((_, i) => i % 2 === 0).map((g, idx) => ({ ...g, tall: idx % 2 === 0 }));
  const B = shots.filter((_, i) => i % 2 === 1).map((g, idx) => ({ ...g, tall: idx % 2 === 1 }));

  const N: Record<string, string> = { corporate: "Corporate gifting", bulk: "Bulk order", solo: "Solo branding" };

  // Pixel heights drive the alternation — aspect-ratio doesn't work inside a fixed-height scroll column
  const renderCard = (g: typeof A[0], i: number) => (
    <div
      key={`${g.label}-${i}`}
      // Highlight the matching route instead of dimming everything else to
      // 20%. A greyscale + opacity-20 wall of photos strobed as the columns
      // scrolled, and stayed washed out for as long as the cursor rested on the
      // list. Now the match is marked and the rest only softens.
      className={`rounded-2xl overflow-hidden mb-3 transition-[opacity,box-shadow] duration-300 ${
        !activeTab
          ? "opacity-100"
          : activeTab === g.t
            ? "opacity-100 ring-2 ring-brand/50 ring-offset-1 ring-offset-transparent"
            : "opacity-60"
      }`}
    >
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-brand/10 to-brand/20"
        style={{ height: g.tall ? "260px" : "150px" }}
      >
        <Image
          src={g.image}
          alt={g.label}
          fill
          sizes="(max-width: 1024px) 45vw, 320px"
          className="object-cover"
          // These sit inside a CSS-transform marquee. A lazily-loaded image in
          // a transformed container is judged against the wrong position, so
          // most of them never loaded at all and the tiles flashed empty as the
          // column scrolled. There are only six, so load them outright.
          loading="eager"
        />
      </div>
      <div className="bg-white dark:bg-[#1A1A22] px-2.5 py-2 border border-t-0 border-brand/10 dark:border-white/10 rounded-b-2xl">
        <p className="font-display font-semibold text-xs text-theme-heading leading-tight line-clamp-1">{g.label}</p>
        <span className="text-[11px] text-brand font-medium">{N[g.t]} · {formatKsh(g.price)}</span>
      </div>
    </div>
  );

  return (
    <section className="section-theme-c relative overflow-hidden py-10 md:py-12 flex flex-col justify-center" id="corporate">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/3 via-transparent to-gold/3 pointer-events-none" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">


        <div className="grid grid-cols-1 lg:grid-cols-[45%_50%] justify-between gap-10 lg:gap-14 items-start">


          {/* LEFT — headline + routes + CTAs (full left column) */}
          <div className="flex flex-col">
            <Reveal delay={100}>
              <div className="mb-8 lg:mb-10">
                <p className="text-brand font-bold text-[11px] uppercase tracking-[0.25em] mb-4">Corporate gifting</p>
                <h2
                  className="font-display font-bold text-theme-heading leading-[1.08] mb-4"
                  style={{ fontSize: "clamp(1.9rem, 3.4vw, 3rem)" }}
                >
                  Your brand, in their hands.
                </h2>
                <p className="text-base md:text-lg text-theme-body leading-relaxed mb-6 max-w-xl">
                  Every gift your business sends says something about you. We make it say the right thing — your name on it, wrapped and delivered.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-brand font-semibold text-xs uppercase tracking-widest mb-2">Which sounds like you?</p>
              <ul className="border-t border-brand/10 dark:border-white/10 mb-7">
                {[
                  { id: "corporate", title: "Gifting a team or clients", desc: "Hampers and gift sets, wrapped and delivered to each person." },
                  { id: "bulk", title: "Sending the same gift to many", desc: "From 10 units, one M-Pesa payment." },
                  { id: "solo", title: "Need it to carry your name", desc: "Your logo or name on a single piece." },
                ].map((way) => (
                  <li
                    key={way.id}
                    onMouseEnter={() => setActiveTab(way.id)}
                    onMouseLeave={() => setActiveTab(null)}
                    onFocus={() => setActiveTab(way.id)}
                    onBlur={() => setActiveTab(null)}
                    tabIndex={0}
                    className={`group relative pl-5 py-4 border-b border-brand/10 dark:border-white/10 cursor-pointer transition-all rounded-lg outline-none ${
                      activeTab === way.id ? "bg-white/70 dark:bg-white/5 shadow-sm" : "hover:bg-white/50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`absolute left-0 top-[20px] w-2 h-2 rounded-full transition-all ${
                      activeTab === way.id ? "bg-brand scale-125" : "bg-gold/70"
                    }`} />
                    <b className="block font-display font-bold text-base text-theme-heading group-hover:text-brand transition-colors">{way.title}</b>
                    <em className="not-italic text-xs text-theme-body block mt-0.5 leading-relaxed">{way.desc}</em>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={280}>
              <p className="text-xs text-theme-body opacity-60 mb-5">
                Gifts for people you love are on the rest of this page. Gifts your business depends on have their own home.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/corporate" className="px-6 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:brightness-110 hover:shadow-lg transition-all">
                  Enter the corporate platform
                </Link>
                <a href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I'd%20like%20to%20talk%20about%20corporate%20gifting."
                  className="px-6 py-3 rounded-xl border-2 border-brand/20 text-theme-heading font-semibold text-sm hover:border-brand hover:text-brand transition-all">
                  Talk to us first
                </a>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — marquee, NO Reveal wrapper (Reveal's opacity animation fights CSS transform and causes the glitch)
              Exactly 2× content matches the translateY(-50%) keyframe loop point perfectly */}
          <div className="hidden lg:grid grid-cols-2 gap-2 overflow-hidden rounded-2xl" style={{ height: "min(60vh, 600px)" }}>
            {/* Col 1 scrolls down */}
            <div className="overflow-hidden h-full">
              <div className="animate-marquee-vertical-reverse" style={{ willChange: "transform" }}>
                {[...A, ...A].map((g, i) => renderCard(g, i))}
              </div>
            </div>
            {/* Col 2 scrolls up, offset slightly so columns feel naturally staggered */}
            <div className="overflow-hidden h-full" style={{ paddingTop: "60px" }}>
              <div className="animate-marquee-vertical" style={{ willChange: "transform" }}>
                {[...B, ...B].map((g, i) => renderCard(g, i))}
              </div>
            </div>
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
  const displayReviews = [
    { name: "Grace W.", initials: "GW", text: "The hamper looked even better than the photos. It felt premium from the wrapping to the delivery update.", occasion: "Birthday", stars: 5 },
    { name: "James K.", initials: "JK", text: "We sent client appreciation gifts across our team list and everything was handled without the usual back-and-forth.", occasion: "Corporate", stars: 5 },
    { name: "Anonymous", initials: "AN", text: "The anonymous delivery made the surprise. Beautiful presentation and brilliant communication.", occasion: "Anniversary", stars: 5 },
    { name: "Mary N.", initials: "MN", text: "The self-care set was incredibly polished. It looked like a proper luxury gift, not a generic basket.", occasion: "Mother's Day", stars: 5 },
  ];

  const stats = [
    { target: 10000, suffix: "+", label: "Gifts delivered", icon: "🎁" },
    { target: 99, suffix: "%", label: "On-time delivery", icon: "🚚" },
    { target: 500, suffix: "+", label: "Curated products", icon: "📦" },
    { target: 4, suffix: ".8/5", label: "Average rating", icon: "⭐" },
  ];

  const StarRow = ({ count }: { count: number }) => (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, j) => (
        <svg key={j} className="w-3.5 h-3.5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section className="py-8 md:py-12 bg-white dark:bg-[#121216] border-y border-surface-border">
      <div className="page-container-capped">
        
        {/* Top Split: Headings & Stats */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-8 items-start justify-between mb-10">
          
          {/* Left: Heading block */}
          <div className="max-w-md">
            <Reveal>
              <p className="text-brand font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                Real people • Real moments
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display text-2xl md:text-3xl font-medium mb-6 text-theme-heading leading-[1.15]">
                Loved by gift givers across Kenya.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-theme-body text-base lg:text-lg">
                Same-day delivery across Nairobi. Next-day, anywhere in Kenya. The details are always handled.
              </p>
            </Reveal>
          </div>

          {/* Right: Stats Grid */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Reveal key={i} delay={300 + (i * 80)} direction="up">
                <div className="bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[140px] shadow-sm">
                  <div className="text-xl mb-3 opacity-80">{stat.icon}</div>
                  <p className="font-display text-xl lg:text-2xl font-semibold text-theme-heading mb-1">
                    <Counter target={stat.target} suffix={stat.suffix} />
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-theme-body/60 mt-1">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom: Review Cards Marquee */}
        <Reveal>
          <div className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -ml-4 md:-ml-8 py-4">
            <div
              className="relative flex overflow-x-hidden group w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] -ml-6 md:-ml-8 px-6 md:px-8 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
            >
              <div className="animate-marquee flex gap-5 w-max items-stretch group-hover:[animation-play-state:paused]">
                {[...displayReviews, ...displayReviews, ...displayReviews].map((t, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-[300px] md:w-[360px] bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-3xl p-8 flex flex-col gap-6 h-full shadow-sm hover:shadow-md transition-shadow whitespace-normal"
                  >
                    {/* Author & Stars */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-warm dark:bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-brand dark:text-white/80 text-[11px] font-bold tracking-wider">{t.initials}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-sm tracking-wide text-theme-heading mb-1">{t.name}</span>
                        <StarRow count={t.stars} />
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="text-sm leading-relaxed text-theme-body flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Google reviews CTA */}
        <Reveal delay={600}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 pt-6 border-t border-surface-border/50">
            <p className="text-sm text-theme-body">
              Gifted with us? Your review helps others give better.
            </p>
            <a
              href="https://www.google.com/search?q=TouchGift+Shop+Nairobi+reviews"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-border bg-white dark:bg-white/5 text-sm font-semibold text-theme-heading hover:border-[#4285F4]/50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Review us on Google
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
