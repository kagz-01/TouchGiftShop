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
                    style={{ backgroundImage: "var(--mood-gradient, linear-gradient(to right, #D4A853, #FFFFFF))" }}
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
              className="group relative px-10 py-4 font-bold rounded-full text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center text-brand-deep min-w-[200px]"
              style={{ background: "var(--mood-gradient, linear-gradient(to right, #D4A853, #E8C97A))", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
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
              <div className={`h-full p-6 md:p-8 shape-premium-card border border-brand/5 shadow-soft hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 group card-theme relative overflow-hidden`}>
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

