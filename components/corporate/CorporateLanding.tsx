"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Candy, Coffee, Flame, Cake as CakeIcon, Package, Gift, Zap, Banknote,
  Palette, FileSpreadsheet, Trophy, HeartHandshake, Tent, TreePine, Hand,
  Heart, ClipboardList, CreditCard, Building2, Users, Clock, PartyPopper,
  Briefcase, Star, MapPin, EyeOff, Camera, Target, Rocket, ShoppingBag,
  Upload, CheckCircle2, MessageSquare, ArrowRight, Sparkles,
} from "lucide-react";
import BackToHome from "@/components/ui/BackToHome";

/* ─── Scroll reveal hook ─── */
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

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════════════════════
   SECTION 1: HERO — Cinematic corporate intro
   ══════════════════════════════════════════════════════════ */
function CorporateHero() {
  const [loaded, setLoaded] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "500+ companies trust us with their gifting.",
    "Same-day delivery across Nairobi.",
    "Upload a CSV. We handle the rest.",
  ];

  useEffect(() => { setLoaded(true); }, []);
  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((p) => (p + 1) % messages.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand via-brand-deep to-[#14080D]">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-light/20 rounded-full blur-[140px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/15 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-coral/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 md:py-12 relative z-40">
        <div className="mb-6">
          <BackToHome className="text-white/60" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 xl:gap-16 items-center max-w-[1800px] mx-auto">

          {/* Left: Copy & CTA */}
          <div className="w-full text-left">
            {/* Typewriter promise badge */}
            <div className={`inline-flex flex-col items-start bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 mb-6 border border-white/10 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-gold/80 mb-1 font-bold">
                Corporate Gifting
              </span>
              <div className="flex items-center gap-2 text-sm md:text-[15px] text-white/90 font-medium tracking-tight min-h-[1.5rem] leading-snug">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
                <span className="whitespace-normal tracking-tight">
                  {messages[msgIdx]}
                  <span className="inline-block w-[1px] h-4 align-middle bg-white/70 ml-0.5 animate-pulse" />
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className={`font-display font-bold text-white leading-[0.95] mb-6 transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontSize: "clamp(2.5rem, 5vw + 1rem, 5rem)" }}
            >
              <span className="relative inline-block py-1">
                Impress your team.
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent tracking-tight">
                    Delight your clients.
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 C50 2, 150 2, 198 8" stroke="url(#corp-gold-gradient)" strokeWidth="3" strokeLinecap="round" className={loaded ? "animate-[draw-line_1s_ease-out_0.8s_forwards]" : ""} style={{ strokeDasharray: 200, strokeDashoffset: 200 }} />
                    <defs>
                      <linearGradient id="corp-gold-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop offset="0%" stopColor="#D4A853" />
                        <stop offset="100%" stopColor="#E8C97A" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-white/75 max-w-xl mb-8 leading-relaxed transition-all duration-1000 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontSize: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)" }}
            >
              Curated gift hampers for employee appreciation, client thank-yous,
              and event giveaways. Bulk orders with same-day Nairobi delivery.
            </p>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Link
                href="/corporate/build"
                className="group relative px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl text-lg overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Build a Corporate Hamper
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <a
                href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27m%20interested%20in%20corporate%20gifting"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Talk to Us
                  <MessageSquare className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                </span>
              </a>
            </div>

            {/* Quick pills */}
            <div className={`mt-8 flex flex-wrap items-center gap-3 transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Link href="/corporate/build" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-all">
                <Building2 className="w-3.5 h-3.5 text-gold" />
                Welcome Kits
              </Link>
              <Link href="/corporate/build" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-all">
                <PartyPopper className="w-3.5 h-3.5 text-coral" />
                Event Gifts
              </Link>
              <Link href="/corporate/build" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-all">
                <Upload className="w-3.5 h-3.5 text-success" />
                CSV Upload
              </Link>
              <Link href="/corporate/build" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-all">
                <Palette className="w-3.5 h-3.5 text-brand-light" />
                Custom Branding
              </Link>
            </div>
          </div>

          {/* Right: Stats showcase */}
          <div className={`hidden lg:block transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 500, suffix: "+", label: "Corporate orders", icon: <Building2 className="w-5 h-5" /> },
                { value: 24, suffix: "hrs", label: "Turnaround time", icon: <Clock className="w-5 h-5" /> },
                { value: 98, suffix: "%", label: "Client satisfaction", icon: <Star className="w-5 h-5" /> },
                { value: 10, suffix: "+", label: "Cities served", icon: <MapPin className="w-5 h-5" /> },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-500 group">
                  <div className="flex items-center justify-center gap-2 text-gold mb-2 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <p className="font-display text-3xl md:text-4xl font-black text-white mb-1">
                    <Counter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 2: THE PROBLEM — Corporate gifting pain points
   ══════════════════════════════════════════════════════════ */
function CorporateProblem() {
  const problems = [
    {
      icon: <Clock className="w-6 h-6 text-coral" />,
      title: "The Last-Minute Panic",
      desc: "Events sneak up. Deadlines shift. You need 50 gifts delivered tomorrow and you haven't even started looking.",
    },
    {
      icon: <Package className="w-6 h-6 text-gold" />,
      title: "Generic, Forgettable Gifts",
      desc: "Branded mugs and generic gift baskets don't reflect your company's standards. Your team deserves better.",
    },
    {
      icon: <Upload className="w-6 h-6 text-brand-light" />,
      title: "Logistical Nightmares",
      desc: "Coordinating delivery addresses for 100+ recipients across Nairobi. One wrong number and the whole batch fails.",
    },
    {
      icon: <Banknote className="w-6 h-6 text-success" />,
      title: "Hidden Costs & Surprises",
      desc: "Quotes that change at checkout. Delivery fees that appear at the last step. Budgets that spiral out of control.",
    },
  ];

  return (
    <section className="py-20 md:py-28 section-theme-a relative overflow-hidden">
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              The Corporate Gifting Problem
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold mb-6 text-theme-heading">
              Gifting at scale
              <br />
              <span className="text-theme-muted font-normal italic">shouldn&apos;t feel this hard.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-theme-body text-lg leading-relaxed">
              You want to strengthen relationships and celebrate your team — but the process
              is overwhelming, expensive, and rarely reflects the gesture you intended.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <Reveal key={i} delay={300 + i * 120} direction="up">
              <div className="h-full p-6 shape-premium-card card-theme border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-brand/10 dark:bg-white/10 shape-premium-button flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    {p.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-theme-heading group-hover:text-gold transition-colors duration-300">{p.title}</h3>
                  <p className="text-theme-body leading-relaxed text-sm">{p.desc}</p>
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
   SECTION 3: THE SOLUTION — Why TouchGift for corporate
   ══════════════════════════════════════════════════════════ */
function CorporateSolution() {
  const solutions = [
    {
      icon: <Target className="w-6 h-6 text-gold" />,
      title: "Bespoke Curation",
      desc: "Every hamper is hand-picked to match your brand, budget, and occasion. No generic bundles.",
      span: "md:col-span-2",
    },
    {
      icon: <Zap className="w-6 h-6 text-coral" />,
      title: "Same-Day Delivery",
      desc: "Order by noon, delivered by evening across Nairobi. Perfect for last-minute events.",
      span: "md:col-span-1",
    },
    {
      icon: <Upload className="w-6 h-6 text-brand-light" />,
      title: "CSV Upload",
      desc: "Upload a spreadsheet of recipients — names, phones, notes. We handle the rest.",
      span: "md:col-span-1",
    },
    {
      icon: <Palette className="w-6 h-6 text-success" />,
      title: "Custom Branding",
      desc: "Your logo on cards, branded packaging, personalized messages. Every detail reflects you.",
      span: "md:col-span-1",
    },
    {
      icon: <EyeOff className="w-6 h-6 text-brand-light" />,
      title: "Absolute Discretion",
      desc: "Anonymous gifting options. No branding unless you want it. Respect for every recipient.",
      span: "md:col-span-1",
    },
  ];

  return (
    <section className="py-20 md:py-28 section-theme-c relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      {/* Gold gradient rules */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal direction="scale">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-light shape-premium-card flex items-center justify-center mx-auto mb-6 shadow-gold animate-float">
              <Building2 className="w-8 h-8 text-brand-deep" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold italic tracking-wide mb-6 text-theme-heading">
              The Art of{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                Corporate Gifting
              </span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-theme-body text-lg leading-relaxed">
              We don&apos;t just deliver gifts. We architect professional gestures that strengthen
              relationships, celebrate milestones, and represent your brand beautifully.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((s, i) => (
            <Reveal key={i} delay={300 + i * 100} direction="up">
              <div className={`h-full p-6 shape-premium-card card-theme border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden ${s.span}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-brand/10 dark:bg-white/10 shape-premium-button flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    {s.icon}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold italic mb-2 text-theme-heading group-hover:text-gold transition-colors duration-300">{s.title}</h3>
                  <p className="text-theme-body leading-relaxed text-sm">{s.desc}</p>
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
   SECTION 4: USE CASES — Corporate gifting occasions
   ══════════════════════════════════════════════════════════ */
function CorporateUseCases() {
  const cases = [
    { icon: <Trophy className="w-6 h-6 text-white" />, title: "Employee Appreciation", desc: "Reward hard work with curated gifts for milestones, anniversaries, and top performers.", color: "from-brand to-brand-light" },
    { icon: <HeartHandshake className="w-6 h-6 text-white" />, title: "Client Thank-Yous", desc: "Strengthen relationships after closing a deal, onboarding a client, or during holidays.", color: "from-gold to-gold-light" },
    { icon: <Tent className="w-6 h-6 text-white" />, title: "Event Giveaways", desc: "Branded gift bags for conferences, launches, and corporate events.", color: "from-coral to-coral-light" },
    { icon: <TreePine className="w-6 h-6 text-white" />, title: "Holiday & Seasonal", desc: "Christmas, New Year, Ramadan, Easter — seasonal gifts for your entire team.", color: "from-emerald-500 to-teal-500" },
    { icon: <Hand className="w-6 h-6 text-white" />, title: "Welcome Kits", desc: "Make new hires feel valued from day one with a branded onboarding hamper.", color: "from-violet-500 to-purple-500" },
    { icon: <Heart className="w-6 h-6 text-white" />, title: "Milestone Celebrations", desc: "Company anniversaries, product launches, partnerships — mark every milestone.", color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <section className="py-20 md:py-28 section-theme-b relative overflow-hidden">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Use Cases
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold mb-4 text-theme-heading">
              Gifting for{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                every occasion
              </span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-theme-body text-lg leading-relaxed max-w-xl mx-auto">
              Whether it&apos;s 5 gifts or 500, we handle curation, packaging,
              and delivery — so you can focus on your business.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <Reveal key={i} delay={300 + i * 80}>
              <div className="h-full card-theme shape-premium-card p-6 border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${c.color} shape-premium-card flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                    {c.icon}
                  </div>
                  <h3 className="font-display italic text-lg font-bold mb-2 text-theme-heading group-hover:text-gold transition-colors duration-300">{c.title}</h3>
                  <p className="text-theme-muted text-sm leading-relaxed">{c.desc}</p>
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
   SECTION 5: HOW IT WORKS — 4-step corporate flow
   ══════════════════════════════════════════════════════════ */
function CorporateHowItWorks() {
  const steps = [
    { num: "01", icon: <Gift className="w-8 h-8" />, title: "Pick your gift", desc: "Choose from curated hampers or build a custom one. Browse our catalog or let us suggest based on your budget.", accent: "from-gold/20 to-gold/5" },
    { num: "02", icon: <Upload className="w-8 h-8" />, title: "Add recipients", desc: "Upload a CSV spreadsheet or add recipients manually. Include names, phone numbers, and personal notes.", accent: "from-brand-light/20 to-brand-light/5" },
    { num: "03", icon: <Palette className="w-8 h-8" />, title: "Customize", desc: "Add your company logo to cards, choose branded packaging, or include a custom message for all recipients.", accent: "from-coral/20 to-coral/5" },
    { num: "04", icon: <Rocket className="w-8 h-8" />, title: "Deliver & track", desc: "One M-Pesa payment for all gifts. We handle individual delivery with photo proof for each recipient.", accent: "from-success/20 to-success/5" },
  ];

  return (
    <section className="py-20 md:py-28 section-theme-d relative overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand/5 rounded-full blur-[120px]" />

      {/* Gold gradient rules */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Effortless Corporate Gifting
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold italic tracking-wide mb-4 text-theme-heading">
              The Journey of a{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                Corporate Gift
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/30 via-brand-light/30 to-success/30 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, i) => (
              <Reveal key={i} delay={200 + i * 150}>
                <div className={`relative card-theme shape-premium-card p-6 border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-2 bg-gradient-to-br ${step.accent}`}>
                  <div className="absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br from-brand to-brand-light shape-premium-card flex items-center justify-center text-white font-display italic font-bold text-lg shadow-ribbon group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <div className="absolute top-2 right-3 text-[5rem] font-black opacity-[0.04] font-display leading-none pointer-events-none select-none">
                    {step.num}
                  </div>
                  <div className="pt-4 relative z-10">
                    <span className="text-4xl mb-3 block group-hover:animate-wiggle">{step.icon}</span>
                    <h3 className="font-display italic text-lg font-bold mb-2 text-theme-heading group-hover:text-gold transition-colors duration-300">{step.title}</h3>
                    <p className="text-theme-muted text-sm leading-relaxed">{step.desc}</p>
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
   SECTION 6: SOCIAL PROOF — Stats + Testimonials marquee
   ══════════════════════════════════════════════════════════ */
function CorporateSocialProof() {
  const stats = [
    { target: 2400, suffix: "+", label: "Gifts delivered", emoji: "🎁" },
    { target: 98, suffix: "%", label: "On-time delivery", emoji: "⚡" },
    { target: 500, suffix: "+", label: "Corporate clients", emoji: "🏢" },
    { target: 4, suffix: ".9★", label: "Average rating", emoji: "⭐" },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "HR Director, Tech Co.", text: "We sent 45 welcome kits to new hires across Nairobi. TouchGift handled everything — the branded packaging was beautiful and every kit arrived on time.", occasion: "Onboarding", initials: "SM" },
    { name: "James K.", role: "Sales Manager, Consultancy", text: "End-of-year client gifts used to be a nightmare. Now we just upload a CSV and TouchGift delivers. Our clients love the hampers.", occasion: "Client Gifts", initials: "JK" },
    { name: "Grace W.", role: "Events Coordinator, Bank", text: "Conference gift bags for 200 attendees, customized with our logo. Flawless execution. Will use again for our next event.", occasion: "Events", initials: "GW" },
    { name: "David N.", role: "CEO, Startup", text: "We wanted something personal for our team of 30. The hampers were beautifully curated and arrived with handwritten notes. Exceptional.", occasion: "Team Gift", initials: "DN" },
    { name: "Amina H.", role: "Marketing Lead, Agency", text: "Client appreciation gifts that actually impressed. Multiple recipients called to say it was the best corporate gift they'd received.", occasion: "Thank You", initials: "AH" },
  ];

  return (
    <section className="py-20 md:py-28 section-theme-e relative overflow-hidden">
      {/* Warm gradient top */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-brand/5 to-transparent" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="text-center mb-12">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Trusted by Companies
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold mb-4 text-theme-heading">
              Loved by{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                corporate teams
              </span>{" "}
              across Nairobi
            </h2>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <Reveal key={i} delay={200 + i * 80} direction="up">
              <div className="card-theme shape-premium-card p-6 text-center overflow-hidden">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <p className="font-display text-4xl md:text-5xl font-black text-theme-heading mb-1">
                  <Counter target={s.target} suffix={s.suffix} />
                </p>
                <p className="text-theme-body text-sm font-medium italic">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials marquee */}
        <Reveal>
          <div className="relative flex overflow-x-hidden group w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -ml-4 md:-ml-8 px-4 md:px-8 py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex gap-5 animate-marquee group-hover:[animation-play-state:paused]">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="w-[300px] md:w-[360px] flex-shrink-0 card-theme rounded-[1.5rem] p-6 border border-surface-border">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-theme-heading mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-gold flex items-center justify-center text-white text-xs font-bold">{t.initials}</div>
                    <div>
                      <p className="text-sm font-semibold text-theme-heading">{t.name}</p>
                      <p className="text-[11px] text-theme-muted">{t.role}</p>
                    </div>
                    <span className="ml-auto text-[10px] uppercase tracking-wider font-bold bg-brand/8 text-gold px-2.5 py-1 rounded-full">{t.occasion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 7: PRICING — Volume discounts
   ══════════════════════════════════════════════════════════ */
function CorporatePricing() {
  const tiers = [
    { range: "1–9 gifts", discount: "Standard", price: "From KSh 1,500/each", features: ["Free delivery in Nairobi", "Photo proof for each", "Digital gift card"], popular: false },
    { range: "10–49 gifts", discount: "10% OFF", price: "From KSh 1,350/each", features: ["Everything in Standard", "Dedicated account rep", "Custom branded cards", "Priority delivery"], popular: true },
    { range: "50+ gifts", discount: "15% OFF", price: "Custom quote", features: ["Everything in Premium", "Custom packaging with logo", "CSV upload support", "Invoice payment terms", "Dedicated coordinator"], popular: false },
  ];

  return (
    <section className="py-20 md:py-28 section-theme-f relative overflow-hidden">
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Volume Pricing
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold italic tracking-wide mb-4 text-theme-heading">
              The more you send, the{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                more you save
              </span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-theme-body text-lg leading-relaxed max-w-xl mx-auto">
              Transparent pricing with built-in volume discounts. No hidden fees, no surprises.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <Reveal key={i} delay={300 + i * 150}>
              <div className={`relative shape-premium-card p-6 border transition-all duration-500 group hover:-translate-y-2 ${
                tier.popular
                  ? "bg-brand-deep text-white border-brand shadow-glow scale-105"
                  : "card-theme border-surface-border hover:shadow-card-hover"
              }`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-brand-deep text-xs font-bold px-3 py-1 shape-premium-button">
                    MOST POPULAR
                  </div>
                )}
                <p className={`text-sm font-semibold mb-1 ${tier.popular ? "text-gold" : "text-theme-heading"}`}>{tier.range}</p>
                <p className={`text-3xl font-display italic font-bold mb-1 ${tier.popular ? "text-white" : "text-theme-heading"}`}>{tier.discount}</p>
                <p className={`text-sm mb-6 ${tier.popular ? "text-white/60" : "text-theme-muted"}`}>{tier.price}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.popular ? "text-gold" : "text-success"}`} />
                      <span className={tier.popular ? "text-white/80" : "text-theme-body"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/corporate/build"
                  className={`block text-center py-3 shape-premium-card font-semibold transition-all duration-300 ${
                    tier.popular
                      ? "bg-gold text-brand-deep hover:bg-gold-light"
                      : "bg-brand/10 text-theme-heading hover:bg-brand hover:text-white"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 8: FINAL CTA — Conversion close
   ══════════════════════════════════════════════════════════ */
function CorporateCTA() {
  return (
    <section className="py-20 md:py-28 section-theme-g relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[20%] w-72 h-72 bg-brand/30 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-10 right-[20%] w-64 h-64 bg-gold/20 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 text-center relative z-10 max-w-4xl mx-auto">
        <Reveal direction="scale">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8 border border-white/10">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-theme-heading">Now delivering across Nairobi</span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display display-heading font-bold mb-6 text-theme-heading leading-tight">
            Ready to create
            <br />
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              an unforgettable moment?
            </span>
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-lg md:text-xl text-theme-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Skip the stress. We curate, wrap beautifully, and deliver with care.
            Start with as few as 1 gift. Scale to 500+.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/corporate/build"
              className="group relative px-10 py-5 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-2xl text-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(212,168,83,0.5)] hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Build a Corporate Hamper
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <a
              href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27d%20like%20a%20custom%20corporate%20quote"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-10 py-5 bg-white/10 backdrop-blur-sm text-theme-heading font-semibold rounded-2xl text-xl border border-surface-border hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Get a Custom Quote
                <Sparkles className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPORT — Full corporate landing page
   ══════════════════════════════════════════════════════════ */
export default function CorporateLanding() {
  return (
    <div>
      <CorporateHero />
      <CorporateProblem />
      <CorporateSolution />
      <CorporateUseCases />
      <CorporateHowItWorks />
      <CorporateSocialProof />
      <CorporatePricing />
      <CorporateCTA />
    </div>
  );
}
