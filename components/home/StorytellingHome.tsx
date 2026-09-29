"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Gift, Sparkles,
  MapPin,
  Target, Zap, EyeOff, ShoppingBag, CreditCard, Rocket,
  Building2,
  Camera
} from "lucide-react";
import type { ReviewWithMedia } from "@/lib/types";
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
  default:      ["TouchGift makes gifting feel thoughtful.", "Order now for fast same-day gift delivery in Nairobi.", "Wrapped beautifully. Delivered with care."],
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
  const { moodMeta, setMood, mood } = useMood();
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

  // Auto-rotate logic — every 7 seconds, so each mood lands before we move on
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const currentIndex = HERO_MOODS.findIndex(m => m.id === moodMeta.id);
      const nextIndex = (currentIndex + 1) % HERO_MOODS.length;
      setMood(HERO_MOODS[nextIndex].id);
    }, 7000);
    return () => clearInterval(interval);
  }, [moodMeta.id, isPaused, setMood]);

  const deliveryMessage = useTypewriter(
    MOOD_TYPEWRITER_MESSAGES[moodMeta.id] ?? MOOD_TYPEWRITER_MESSAGES.default
  );

  useEffect(() => { setLoaded(true); }, []);

  return (
    <section 
      className="relative min-h-[70vh] md:min-h-[85vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── CINEMATIC BACKGROUND IMAGES ── */}
      {HERO_MOODS.map((m) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${moodMeta.id === m.id ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img 
            src={heroBackgrounds[m.id]} 
            alt={`${m.label} mood background`} 
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
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 md:py-20 relative z-30 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-start max-w-3xl text-left">
          
          {/* Typewriter delivery note */}
          <div className={`inline-flex flex-col items-start bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3 mb-8 border border-white/10 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-gold/90 mb-1 font-bold">
              TouchGift Promise
            </span>
            <div className="flex items-center gap-2 text-sm md:text-[15px] text-white/95 font-medium tracking-tight min-h-[1.5rem] leading-snug">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
              <span className="whitespace-normal tracking-tight drop-shadow-md">
                {highlightDeliveryCopy(deliveryMessage)}
                <span className="inline-block w-[1px] h-4 align-middle bg-white/70 ml-0.5 animate-pulse" />
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="min-h-[160px] md:min-h-[220px] flex items-center">
            <h1 className={`font-display font-bold text-white leading-[0.95] mb-5 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontSize: "clamp(2.5rem, 6vw + 1rem, 6.5rem)" }}
            >
              <span className="relative inline-block py-1 drop-shadow-xl">
                {moodMeta.id === "default" ? (
                  <>
                    Elevate the art
                    <br />
                    <span className="relative inline-block mt-2">
                      <span className="text-gradient bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent tracking-tight">
                        of gifting
                      </span>
                      <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 200 12" fill="none">
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
          <p key={`sub-${moodMeta.id}`} className={`text-white/90 max-w-xl mb-10 leading-relaxed transition-all duration-1000 delay-400 animate-fade-in drop-shadow-lg font-medium ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ fontSize: "clamp(1rem, 1.5vw + 0.25rem, 1.2rem)" }}
          >
            {moodMeta.id === "default"
              ? "Discover beautifully curated gifts for every occasion. We handle the presentation and same-day delivery across Nairobi, so you can focus on the moment."
              : moodMeta.heroSub
            }
          </p>

          {/* CTA */}
          <div className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Link
              href={moodMeta.id === "corporate" ? "/corporate" : "/shop"}
              className="group relative px-10 py-4 font-bold rounded-full text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center min-w-[200px]"
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
                    } else {
                      setMood(m.id);
                      setIsPinned(true); // pin: survives pointer leaving
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
function useActiveScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, on };
}

const SCENE =
  "relative h-[84px] rounded-xl overflow-hidden flex-none bg-brand/[0.07] dark:bg-white/[0.06]";

/* 1 — Racing clock: sweeping arc, spinning hands, courier on a filling road */
function ClockScene() {
  const etaRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = etaRef.current;
    if (!el) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = ((t - start) % 5000) / 5000;
      const left = Math.max(0, Math.round(92 * (1 - p)));
      el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="gd-clock relative h-[84px] rounded-xl overflow-hidden flex-none bg-brand-deep dark:bg-[#08080C]">
      <span
        ref={etaRef}
        className="gd-eta absolute right-2.5 top-2.5 text-[11px] font-semibold tracking-wide text-[#F3C9BD]"
      >
        1:32
      </span>
      <svg className="gd-clockface absolute left-2.5 top-2.5" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
        <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        <circle
          className="gd-arc text-brand"
          cx="18" cy="18" r="14"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
        <line className="gd-hand1" x1="18" y1="18" x2="18" y2="8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line className="gd-hand2 text-brand" x1="18" y1="18" x2="25" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <div className="gd-road">
        <i className="gd-dash" />
        <span className="gd-rider">🛵</span>
      </div>
    </div>
  );
}

/* 2 — Uninspired choices: a conveyor of filler, one star picked out of it */
function PickScene() {
  return (
    <div className={`${SCENE} gd-pick flex items-center`}>
      <div className="gd-beltwrap">
        <div className="gd-belt">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="gd-dot bg-brand/20 dark:bg-white/15" />
          ))}
        </div>
      </div>
      <div className="gd-star">
        <span className="text-white text-[15px] leading-none">✦</span>
      </div>
      <span className="gd-spark gd-sp1 text-brand">✦</span>
      <span className="gd-spark gd-sp2 text-brand">✦</span>
    </div>
  );
}

/* 3 — Logistical headaches: pin drop on a route that draws itself */
function LogisticsScene({ step }: { step: number }) {
  return (
    <div className={SCENE}>
      <span className={`gd-tick absolute left-2.5 top-2 items-center gap-1 text-[10px] font-semibold text-brand ${step >= 1 ? "is-on" : ""}`}>
        📍 Address received
      </span>
      <svg width="100%" height="100%" viewBox="0 0 220 84" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <circle cx="16" cy="60" r="4" className="text-brand" fill="currentColor" />
        <path
          d="M16 60C60 60 60 26 110 32S170 54 196 42"
          className={`gd-mline text-brand ${step >= 2 ? "is-on" : ""}`}
          stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5 6"
        />
        <circle className={`gd-rip text-brand ${step >= 3 ? "is-on" : ""}`} cx="196" cy="42" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <g className={`gd-pin text-brand ${step >= 1 ? "is-on" : ""}`}>
          <path d="M196 42c-7-9-9-13-9-18a9 9 0 0 1 18 0c0 5-2 9-9 18z" fill="currentColor" />
          <circle cx="196" cy="24" r="3" fill="#fff" />
        </g>
      </svg>
    </div>
  );
}

/* 4 — Unexpected costs: a receipt that adds up to exactly what you saw */
function CostScene({ step }: { step: number }) {
  return (
    <div className={`${SCENE} gd-cost flex flex-col justify-center gap-[5px] px-3.5`}>
      <div className="flex justify-between text-[10.5px] text-theme-muted tabular-nums">
        <span>Gift</span><span>KES 2,500</span>
      </div>
      <div className={`gd-fee flex justify-between text-[10.5px] text-theme-muted tabular-nums ${step >= 1 ? "is-on" : ""}`}>
        <span>Delivery</span><span>KES 300</span>
      </div>
      <div className={`gd-fee flex justify-between text-[10.5px] text-theme-muted tabular-nums gd-strike ${step >= 2 ? "is-on" : ""}`}>
        <span>Hidden fee</span><span>KES 0</span>
      </div>
      <div className="flex justify-between text-[10.5px] font-bold text-theme-heading tabular-nums border-t border-black/10 dark:border-white/10 pt-[5px] mt-px">
        <span>Total</span>
        <span>
          KES {(step >= 1 ? 2800 : 2500).toLocaleString("en-KE")}{" "}
          <b className={`gd-check text-[#1B8A4E] ${step >= 2 ? "is-on" : ""}`}>✓</b>
        </span>
      </div>
    </div>
  );
}

function DilemmaCard({
  title, desc, delay, children,
}: { title: string; desc: string; delay: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="gd-card card-theme shape-premium-card flex h-full flex-col gap-3.5 overflow-hidden p-4 pb-5 transition-transform duration-500 hover:-translate-y-1.5">
        {children}
        <h3 className="font-display text-lg font-bold leading-snug text-theme-heading">{title}</h3>
        <p className="text-[13px] leading-relaxed text-theme-body">{desc}</p>
      </div>
    </Reveal>
  );
}

export function ProblemSection() {
  const { ref, on } = useActiveScene();
  const [logiStep, setLogiStep] = useState(0);
  const [costStep, setCostStep] = useState(0);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setLogiStep((s) => (s + 1) % 4), 1200);
    return () => clearInterval(id);
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setCostStep((s) => (s + 1) % 4), 1000);
    return () => clearInterval(id);
  }, [on]);

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
            <h2 className="font-display section-heading font-bold text-theme-heading">
              Care shouldn&apos;t feel like <span className="italic text-gold">work.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="w-10 h-px bg-gold/70 mx-auto mb-6" />
            <p className="text-theme-body text-lg italic leading-relaxed">
              You want it to mean something. It shouldn&apos;t take all afternoon.
            </p>
          </Reveal>
        </div>

        <div
          ref={ref}
          data-on={on ? "1" : "0"}
          className="gd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
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
            <LogisticsScene step={logiStep} />
          </DilemmaCard>

          <DilemmaCard
            delay={300}
            title="Unexpected Costs"
            desc="Clear pricing and transparent delivery from the start."
          >
            <CostScene step={costStep} />
          </DilemmaCard>
        </div>
      </div>

      <style jsx global>{`
        /* idle the whole block when it scrolls out of view */
        .gd[data-on="0"] * { animation-play-state: paused !important; }

        .gd-card { min-height: 250px; }

        /* ── 1 · clock ── */
        .gd-arc {
          stroke-dasharray: 82;
          stroke-dashoffset: 82;
          animation: gd-arcfill 5s linear infinite;
        }
        .gd-hand1, .gd-hand2 {
          transform-box: view-box;
          transform-origin: 18px 18px;
        }
        .gd-hand1 { animation: gd-spin 5s linear infinite; }
        .gd-hand2 { animation: gd-spin 1.4s linear infinite; }
        .gd-road {
          position: absolute;
          left: 52px;
          right: 10px;
          bottom: 16px;
          height: 2px;
        }
        .gd-road::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.18);
          border-radius: 2px;
        }
        .gd-dash {
          position: absolute;
          left: 0;
          top: 0;
          height: 2px;
          width: 0;
          background: #9B1B5A;
          border-radius: 2px;
          animation: gd-fillw 5s ease-in-out infinite;
        }
        .gd-rider {
          position: absolute;
          bottom: -1px;
          left: 0;
          font-size: 15px;
          transform: scaleX(-1);
          animation: gd-ride 5s ease-in-out infinite;
        }
        @keyframes gd-arcfill { to { stroke-dashoffset: 0; } }
        @keyframes gd-spin { to { transform: rotate(360deg); } }
        @keyframes gd-fillw { 0% { width: 0; } 82%, 100% { width: 100%; } }
        @keyframes gd-ride { 0% { left: 0; } 82%, 100% { left: calc(100% - 15px); } }

        /* ── 2 · conveyor ── */
        .gd-beltwrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
        }
        .gd-belt {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 100%;
          width: max-content;
          animation: gd-belt 12s linear infinite;
        }
        .gd-dot { width: 16px; height: 16px; border-radius: 5px; flex: none; }
        .gd-star {
          position: absolute;
          left: 50%;
          top: 52%;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #9B1B5A;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px -6px rgba(155, 27, 90, 0.55);
          animation: gd-pop 3s ease-in-out infinite;
        }
        .gd-spark {
          position: absolute;
          font-size: 11px;
          animation: gd-tw 1.2s ease-in-out infinite alternate;
        }
        .gd-sp1 { top: 12px; left: calc(50% + 20px); }
        .gd-sp2 { bottom: 14px; left: calc(50% - 26px); animation-delay: 0.4s; }
        @keyframes gd-belt { to { transform: translateX(-50%); } }
        @keyframes gd-pop {
          0%, 15% { transform: translate(-50%, -50%) scale(0.8) rotate(-6deg); }
          35%, 80% { transform: translate(-50%, -50%) scale(1) rotate(0); }
          100% { transform: translate(-50%, -50%) scale(0.8) rotate(-6deg); }
        }
        @keyframes gd-tw { to { transform: scale(1.5); opacity: 0.35; } }

        /* ── 3 · route ── */
        .gd-mline { opacity: 0.3; transition: opacity 0.3s; }
        .gd-mline.is-on { opacity: 1; animation: gd-march 0.8s linear infinite; }
        .gd-pin {
          opacity: 0;
          transform: translateY(-14px) scale(0.7);
          transform-box: view-box;
          transform-origin: 196px 42px;
          transition: opacity 0.4s, transform 0.4s cubic-bezier(0.3, 1.6, 0.4, 1);
        }
        .gd-pin.is-on { opacity: 1; transform: none; }
        .gd-rip {
          opacity: 0;
          transform-box: view-box;
          transform-origin: 196px 42px;
        }
        .gd-rip.is-on { animation: gd-rip 1.2s ease-out infinite; }
        .gd-tick { display: flex; opacity: 0; transition: opacity 0.3s; }
        .gd-tick.is-on { opacity: 1; }
        @keyframes gd-march { to { stroke-dashoffset: -11; } }
        @keyframes gd-rip {
          0% { transform: scale(0.3); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }

        /* ── 4 · receipt ── */
        .gd-fee { opacity: 0; transform: translateY(3px); transition: opacity 0.3s, transform 0.3s; }
        .gd-fee.is-on { opacity: 1; transform: none; }
        .gd-strike span:first-child { text-decoration: line-through; text-decoration-color: #9B1B5A; }
        .gd-strike span:last-child { color: #9B1B5A; }
        .gd-check { opacity: 0; transition: opacity 0.3s; }
        .gd-check.is-on { opacity: 1; }

        /* dark surfaces need a lifted rose — #9B1B5A only reaches ~2.4:1 there */
        [data-theme="dark"] .gd-arc,
        [data-theme="dark"] .gd-hand2,
        [data-theme="dark"] .gd-pin,
        [data-theme="dark"] .gd-rip,
        [data-theme="dark"] .gd-mline,
        [data-theme="dark"] .gd-spark,
        [data-theme="dark"] .gd-tick,
        [data-theme="dark"] .gd-strike span:last-child { color: #F9A8C8; }
        [data-theme="dark"] .gd-dash,
        [data-theme="dark"] .gd-star { background: #E86FA8; }
        [data-theme="dark"] .gd-eta { color: #F9A8C8; }

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
        { name: "Anonymous", initials: "anon", text: "Sent my work crush a gift without leaving a name. They still talk about it months later. Worth every shilling.", occasion: "Just Because", stars: 5 },
        { name: "Brian K.", initials: "BK", text: "The group gifting feature is genius. We pooled KSh 15,000 for our colleague's send-off. Everyone paid separately — no awkward cash collection.", occasion: "Corporate", stars: 5 },
        { name: "Grace W.", initials: "GW", text: "Delivery made it on time but the gift box arrived with a small dent on the corner. Support called me the same day and made it right. Good people.", occasion: "Birthday", stars: 4 },
        { name: "Anonymous", initials: "anon", text: "Don't want my partner knowing I was shopping here 😅 but the surprise hamper was perfect. Delivery to Kilimani was smooth.", occasion: "Anniversary", stars: 5 },
        { name: "Stella N.", initials: "SN", text: "My mom actually cried when she got the wellness hamper. They didn't just deliver a box, they delivered a moment.", occasion: "Mother's Day", stars: 5 },
        { name: "Otieno D.", initials: "OD", text: "Used the gift pool for our team lead's farewell. 11 people contributed, zero confusion. The photo proof on delivery was a nice touch.", occasion: "Corporate", stars: 5 },
      ];

  const stats = [
    { target: 100, suffix: "+", label: "Gifts delivered", icon: "🎁" },
    { target: 95, suffix: "%", label: "On-time delivery", icon: "⚡" },
    { target: 749, suffix: "+", label: "Products", icon: "🛍️" },
    { target: 4, suffix: ".6★", label: "Average rating", icon: "⭐" },
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
          <div className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -ml-4 md:-ml-8 py-4">
            <div 
              className="relative flex overflow-x-hidden group px-4 md:px-8"
              style={{
                WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
              }}
            >
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
          </div>
        </Reveal>

        {/* Google reviews CTA */}
        <Reveal delay={120}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <p className="text-sm text-theme-body">
              Gifted with us? Your review helps others give better.
            </p>
            <a
              href="https://www.google.com/search?q=TouchGift+Shop+Nairobi+reviews"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-border card-theme text-sm font-semibold text-theme-heading hover:border-gold/50 hover:text-gold transition-colors"
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
