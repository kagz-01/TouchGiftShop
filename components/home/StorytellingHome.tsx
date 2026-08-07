"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
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
function HeroCinematic() {
  const [loaded, setLoaded] = useState(false);
  const deliveryMessage = useTypewriter([
    "TouchGift makes gifting feel thoughtful.",
    "Order before 3 PM for same-day gift delivery in Nairobi.",
    "After 3 PM? We deliver tomorrow.",
    "Wrapped beautifully. Delivered with care.",
  ]);

  useEffect(() => { setLoaded(true); }, []);

  return (
    <section className="relative h-[75vh] min-h-[560px] flex items-center justify-center overflow-hidden bg-brand-deep">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/30 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-coral/15 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      {/* Floating gift elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] text-6xl opacity-20 animate-float" style={{ animationDelay: "0s" }}>🎁</div>
        <div className="absolute top-40 right-[15%] text-4xl opacity-15 animate-float" style={{ animationDelay: "1s" }}>🎀</div>
        <div className="absolute bottom-32 left-[20%] text-5xl opacity-15 animate-float" style={{ animationDelay: "2s" }}>✨</div>
        <div className="absolute bottom-20 right-[10%] text-4xl opacity-20 animate-float" style={{ animationDelay: "3s" }}>💌</div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Typewriter delivery note */}
        <div className={`inline-flex flex-col items-center bg-white/10 backdrop-blur-md rounded-full px-5 py-3 mb-8 border border-white/10 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-gold/80 mb-1">
            TouchGift promise
          </span>
          <div className="flex items-center justify-center gap-2 text-sm md:text-[15px] text-white/90 font-medium tracking-tight min-h-[1.5rem] text-center leading-snug">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
            <span className="whitespace-normal tracking-tight">
              {highlightDeliveryCopy(deliveryMessage)}
              <span className="inline-block w-[1px] h-4 align-middle bg-white/70 ml-0.5 animate-pulse" />
            </span>
          </div>
        </div>

        {/* Main headline */}
        <h1 className={`font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95] mb-6 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          Send something
          <br />
          <span className="relative inline-block">
            <span className="text-gradient bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent tracking-tight">
              they&apos;ll remember
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
        </h1>

        {/* Subheadline */}
        <p className={`text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          Thoughtful gifts for birthdays, milestones, apologies, and just-because
          moments, wrapped beautifully and delivered with care.
        </p>

        {/* CTA */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link
            href="/?category=birthdays"
            className="group relative px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl text-lg overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center gap-2">
              Browse Gifts
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          <Link
            href="/gift-lab"
            className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="flex items-center gap-2">
              Build a Hamper
              <span className="text-xl">✨</span>
            </span>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className={`mt-12 transition-all duration-1000 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
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
function ProblemSection() {
  const problems = [
    { emoji: "😰", text: "Last-minute panic — what do I even get them?" },
    { emoji: "🤷", text: "Generic gifts that miss the mark completely" },
    { emoji: "📍", text: "Don't know their exact address" },
    { emoji: "💸", text: "Hidden delivery fees at checkout" },
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            We get it
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-6 leading-tight">
            Finding the perfect gift
            <br />
            <span className="text-brand-muted">shouldn&apos;t feel like this</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-brand-muted text-center max-w-xl mx-auto mb-16">
            We&apos;ve all been there — scrolling through generic catalogs, settling for
            something &ldquo;good enough,&rdquo; hoping they like it.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <Reveal key={i} delay={300 + i * 150} direction="left">
              <div className="flex items-start gap-4 p-6 bg-blush/50 rounded-2xl border border-surface-border hover:border-brand/20 transition-all duration-300 hover:shadow-soft group">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {p.emoji}
                </span>
                <p className="text-lg font-medium pt-1">{p.text}</p>
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
function SolutionSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-dark relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
        <Reveal direction="scale">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-brand rounded-3xl mb-8 shadow-glow animate-float">
            <span className="text-4xl">🎁</span>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Meet <span className="text-gradient">TouchGift</span>
          </h2>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-16 leading-relaxed">
            We curate the perfect gift, wrap it beautifully, and deliver it
            same-day — so you can focus on the moment, not the logistics.
          </p>
        </Reveal>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🎯",
              title: "Curated, not generic",
              desc: "Every gift is handpicked for the occasion — no filler, no misses.",
            },
            {
              icon: "⚡",
              title: "Same-day delivery",
              desc: "Order before 2pm, delivered by evening. Nairobi-wide.",
            },
            {
              icon: "🤫",
              title: "Surprise-safe",
              desc: "Anonymous mode + no-contact delivery. The surprise stays intact.",
            },
          ].map((f, i) => (
            <Reveal key={i} delay={400 + i * 150}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-gold/30 transition-all duration-300 group">
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </span>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
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
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "🛍️",
      title: "Pick a gift",
      desc: "Browse by occasion or let our Gift Finder suggest the perfect match.",
      color: "from-brand to-brand-light",
    },
    {
      num: "02",
      icon: "💳",
      title: "Pay with M-Pesa",
      desc: "Quick checkout with M-Pesa, card, or Airtel Money. No account needed.",
      color: "from-gold to-gold-light",
    },
    {
      num: "03",
      icon: "🚀",
      title: "We deliver it",
      desc: "Same-day in Nairobi, next-day nationwide. Photo proof before dispatch.",
      color: "from-success to-emerald-400",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-blush/30 relative">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Simple as 1-2-3
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-16">
            How it works
          </h2>
        </Reveal>

        <div className="relative">
          {/* Connecting ribbon line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand via-gold to-success -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <Reveal key={i} delay={200 + i * 200}>
                <div className="relative bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-2">
                  {/* Step number */}
                  <div className={`absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg shadow-ribbon group-hover:scale-110 transition-transform`}>
                    {step.num}
                  </div>

                  <div className="pt-6">
                    <span className="text-5xl mb-4 block group-hover:animate-wiggle">{step.icon}</span>
                    <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed">{step.desc}</p>
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
function SocialProof() {
  const [reviews, setReviews] = useState<ReviewWithMedia[]>([]);

  useEffect(() => {
    fetch("/api/reviews?limit=3&sort=helpful")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  // Fallback data if no reviews yet
  const displayReviews = reviews.length > 0
    ? reviews.map((r) => ({
        name: r.reviewer_name || r.reviewerName || "Anonymous",
        text: r.body || r.title || "",
        occasion: "Gift",
        stars: r.rating,
      }))
    : [
        { name: "Wanjiku M.", text: "Saved me from a last-minute birthday disaster. Ordered at 1pm, delivered by 5pm. The flowers were gorgeous!", occasion: "Birthday", stars: 5 },
        { name: "Brian K.", text: "The group gifting feature is genius. We pooled KSh 15,000 for our colleague's send-off. Everyone paid separately — no awkward cash collection.", occasion: "Corporate", stars: 5 },
        { name: "Amina H.", text: "Anonymous mode is everything. Sent my ex a 'just because' gift without them knowing it was me. No drama, just vibes.", occasion: "Just Because", stars: 5 },
      ];
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {[
            { target: 2400, suffix: "+", label: "Gifts sent" },
            { target: 98, suffix: "%", label: "On-time delivery" },
            { target: 749, suffix: "+", label: "Products" },
            { target: 4, suffix: ".9★", label: "Average rating" },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl font-bold text-gradient">
                  <Counter target={stat.target} suffix={stat.suffix} />
                </p>
                <p className="text-brand-muted text-sm mt-2">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            What people say
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Loved by gift-givers
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((t, i) => (
            <Reveal key={i} delay={200 + i * 150}>
              <div className="bg-gradient-warm rounded-2xl p-6 border border-surface-border hover:shadow-card transition-all duration-300">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{t.name}</span>
                  <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full">{t.occasion}</span>
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
   SECTION 6: OCCASIONS — Browse by who you're gifting
   ══════════════════════════════════════════════════════════ */
function OccasionsGrid() {
  const occasions = [
    { icon: "🎂", label: "Birthdays", slug: "birthdays", color: "from-pink-400 to-rose-500" },
    { icon: "💍", label: "Anniversaries", slug: "anniversaries", color: "from-red-400 to-pink-500" },
    { icon: "💒", label: "Weddings", slug: "weddings", color: "from-purple-400 to-indigo-500" },
    { icon: "🏢", label: "Corporate", slug: "corporate", color: "from-blue-400 to-cyan-500" },
    { icon: "👶", label: "New Baby", slug: "baby", color: "from-blue-300 to-cyan-400" },
    { icon: "💐", label: "Apology", slug: "apology", color: "from-amber-400 to-orange-500" },
    { icon: "🏆", label: "Milestone", slug: "milestone", color: "from-emerald-400 to-teal-500" },
    { icon: "💝", label: "Just Because", slug: "just-because", color: "from-violet-400 to-purple-500" },
    { icon: "🕊️", label: "Condolences", slug: "condolences", color: "from-slate-400 to-gray-500" },
    { icon: "💪", label: "Fitness", slug: "fitness", color: "from-orange-400 to-red-500" },
    { icon: "🎮", label: "Gaming", slug: "gaming", color: "from-violet-400 to-purple-500" },
    { icon: "🎵", label: "Music", slug: "music", color: "from-pink-400 to-fuchsia-500" },
    { icon: "⛺", label: "Outdoor", slug: "outdoor", color: "from-green-400 to-emerald-500" },
    { icon: "🏠", label: "Home Decor", slug: "home-decor", color: "from-amber-400 to-orange-500" },
    { icon: "🍳", label: "Kitchen", slug: "kitchen", color: "from-red-400 to-rose-500" },
    { icon: "🍷", label: "Beverages", slug: "beverages", color: "from-amber-500 to-red-500" },
  ];

  return (
    <section className="py-24 md:py-32 bg-gradient-warm">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <Reveal>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Find by occasion
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-4">
            Who are you gifting?
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-brand-muted text-center max-w-xl mx-auto mb-12">
            Every occasion deserves something special. Pick a category and
            we&apos;ll show you curated gifts that fit.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {occasions.map((occ, i) => (
            <Reveal key={occ.slug} delay={300 + i * 80}>
              <Link
                href={`/?category=${occ.slug}`}
                className="group relative bg-white rounded-2xl p-6 text-center hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 border border-surface-border overflow-hidden"
              >
                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${occ.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block group-hover:scale-125 group-hover:animate-wiggle transition-transform duration-500">
                    {occ.icon}
                  </span>
                  <p className="font-semibold text-sm group-hover:text-white transition-colors duration-300">
                    {occ.label}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 7: FINAL CTA — Convert
   ══════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-24 md:py-32 bg-brand-deep relative overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[20%] w-72 h-72 bg-brand/30 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-10 right-[20%] w-64 h-64 bg-gold/20 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
        <Reveal direction="scale">
          <span className="text-6xl mb-6 block animate-float">🎁</span>
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to send
            <br />
            <span className="text-gradient">some joy?</span>
          </h2>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-xl text-white/50 max-w-lg mx-auto mb-10">
            No accounts needed. No stress. Just pick, pay, and
            we&apos;ll handle the rest.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/?category=birthdays"
              className="group px-10 py-5 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl text-lg transition-all duration-300 hover:shadow-gold hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Send a Gift Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/gift-lab"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Build a Custom Hamper
            </Link>
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div className="mt-12 flex items-center justify-center gap-8 text-white/30 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Same-day delivery
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              M-Pesa accepted
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free over KSh 5,000
            </span>
          </div>
        </Reveal>

        <Reveal delay={600}>
          <div className="mt-10 flex items-center justify-center gap-5">
            {[
              { href: "https://www.facebook.com/share/185SzXR7nv/", label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
              { href: "https://www.instagram.com/touchgiftshop?igsh=MXR2MWV5NGp3dnoxcg==", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
              { href: "https://www.tiktok.com/@touchgiftshop001?_r=1&_t=ZS-98d5B03EZMr", label: "TikTok", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.27 8.27 0 004.77 1.52V11.3a4.83 4.83 0 01-.81-.61z" },
              { href: "https://wa.me/254142677898", label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-gold/20 border border-white/10 hover:border-gold/30 rounded-full flex items-center justify-center text-white/40 hover:text-gold transition-all duration-300"
                aria-label={s.label}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPORT — Full storytelling homepage
   ══════════════════════════════════════════════════════════ */
export default function StorytellingHome() {
  return (
    <div>
      <HeroCinematic />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <SocialProof />
      <OccasionsGrid />
      <FinalCTA />
    </div>
  );
}
