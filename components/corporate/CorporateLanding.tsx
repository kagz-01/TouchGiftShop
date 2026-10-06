"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Candy, Coffee, Flame, Cake as CakeIcon, Package, Gift, Zap, Banknote,
  Palette, FileSpreadsheet, Trophy, HeartHandshake, Tent, TreePine, Hand,
  Heart, ClipboardList, CreditCard, Building2, Users, Clock, PartyPopper,
  Briefcase, Star, MapPin, EyeOff, Camera, Target, Rocket, ShoppingBag,
  Upload, CheckCircle2, MessageSquare, ArrowRight, Sparkles,
} from "lucide-react";
import BackToHome from "@/components/ui/BackToHome";
import { useMood } from "@/context/MoodContext";
import { optimizeImageUrl } from "@/lib/image-url";
import { formatKsh } from "@/lib/utils";

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

const ORBIT_FALLBACK_ITEMS = [
  { emoji: "🎁", label: "Birthday Box", color: "from-pink-500 to-rose-400" },
  { emoji: "🛍️", label: "Welcome Kit", color: "from-violet-500 to-purple-400" },
  { emoji: "🎀", label: "Event Hamper", color: "from-amber-500 to-orange-400" },
  { emoji: "🧧", label: "Client Gift", color: "from-emerald-500 to-teal-400" },
  { emoji: "🎄", label: "Holiday Bundle", color: "from-red-500 to-rose-400" },
  { emoji: "💐", label: "Appreciation Set", color: "from-fuchsia-500 to-pink-400" },
];

/* ══════════════════════════════════════════════════════════
   SECTION 1: HERO — Cinematic corporate intro
   ══════════════════════════════════════════════════════════ */
function CorporateHero() {
  const [loaded, setLoaded] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "500+ companies trust us.",
    "Same-day delivery across Nairobi.",
    "Upload a CSV. We handle the rest.",
  ];

  useEffect(() => { setLoaded(true); }, []);
  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((p) => (p + 1) % messages.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      className="relative min-h-[90vh] -mt-[130px] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero/hero-corporate.webp"
          alt="Corporate Gifting"
          decoding="async"
          fetchPriority="high"
          className={`w-full h-full object-cover object-center transition-all duration-[5000ms] ease-out ${loaded ? "scale-105" : "scale-100 blur-sm"}`}
        />
        <div className="absolute inset-0 bg-black/60 md:bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14080D]/90 via-transparent to-transparent opacity-90" />
      </div>

      {/* ── FOREGROUND CONTENT ── */}
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-[130px] md:pt-[140px] pb-10 relative z-30 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-start max-w-3xl text-left">
          
          {/* Eyebrow */}
          <div className={`flex items-center gap-3 mb-4 transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="h-[1px] w-8 md:w-12 bg-gold"></div>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-gold font-bold">
              Corporate Gifting
            </span>
          </div>

          {/* Main headline */}
          <h1 className={`font-display font-bold text-white leading-[1.05] md:leading-[1.1] mb-6 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            <span className="relative inline-block drop-shadow-xl">
              Make business feel<br />
              <span className="text-gold italic font-light pr-2">personal.</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className={`text-white/80 max-w-xl mb-8 leading-relaxed md:text-lg transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Effortlessly recognize your team and appreciate your clients with beautifully curated hampers. We handle the logistics—from single sends to bulk CSV uploads.
          </p>

          {/* Typewriter Trust Badge */}
          <div className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8 border border-white/10 transition-all duration-1000 delay-900 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
            <span className="text-sm text-white/90 font-medium tracking-tight whitespace-nowrap min-w-[220px]">
              {messages[msgIdx]}
              <span className="inline-block w-[1px] h-4 align-middle bg-white/70 ml-1 animate-pulse" />
            </span>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Link
              href="/corporate/build"
              className="group relative px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold rounded-full text-[15px] overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Build a Corporate Hamper
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <a
              href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27m%20interested%20in%20corporate%20gifting"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 bg-black/40 backdrop-blur-sm text-white font-semibold rounded-full text-[15px] border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              <span className="flex items-center justify-center gap-2">
                Talk to Us
                <MessageSquare className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
              </span>
            </a>
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
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
function WhatsAppMockup() {
  const [step, setStep] = useState(0);
  const messages = [
    { from: "bot", text: "👋 Hi Sarah! Your gift from Acme Corp is ready. Where should we deliver?" },
    { from: "user", text: "Please send to my office — Westlands, 2nd floor." },
    { from: "bot", text: "✅ Confirmed for today 2–5 PM. Track: touchgift.co/T1234" },
  ];
  useEffect(() => {
    if (step >= messages.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1600);
    return () => clearTimeout(t);
  }, [step]);
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">TG</div>
        <div>
          <p className="text-white text-[11px] font-semibold">TouchGift Bot</p>
          <p className="text-emerald-400 text-[9px]">● Online</p>
        </div>
      </div>
      {messages.slice(0, step).map((m, i) => (
        <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[82%] px-3 py-1.5 rounded-2xl text-[10px] leading-relaxed ${m.from === "user" ? "bg-emerald-500 text-white rounded-br-sm" : "bg-white/10 text-white/90 rounded-bl-sm"}`}>{m.text}</div>
        </div>
      ))}
      {step < messages.length && (
        <div className="flex gap-1 items-center bg-white/10 rounded-2xl rounded-bl-sm w-fit px-3 py-2">
          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
      )}
    </div>
  );
}

function CsvMockup() {
  const [phase, setPhase] = useState<"idle"|"uploading"|"done">("idle");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("uploading"), 1200);
    const t2 = setTimeout(() => setPhase("done"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const rows = ["Sarah K. · 0712 · Westlands", "James M. · 0723 · CBD", "Aisha O. · 0734 · Karen"];
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-500 ${phase === "idle" ? "border-white/20" : phase === "uploading" ? "border-gold/60 bg-gold/5" : "border-emerald-400/60 bg-emerald-400/5"}`}>
        {phase === "idle" && <p className="text-white/40 text-[10px]">📂 Drop recipients.csv here</p>}
        {phase === "uploading" && <div className="flex flex-col items-center gap-1"><div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" /><p className="text-gold text-[9px]">Parsing 3 recipients…</p></div>}
        {phase === "done" && <p className="text-emerald-400 text-[10px] font-semibold">✓ 3 recipients imported</p>}
      </div>
      {phase === "done" && (
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
              <span className="w-4 h-4 bg-emerald-400/20 text-emerald-400 text-[8px] font-bold rounded-full flex items-center justify-center">{i+1}</span>
              <span className="text-white/70 text-[9px] truncate">{r}</span>
            </div>
          ))}
          <div className="w-full mt-1 py-1.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep text-[10px] font-bold rounded-lg text-center">Send All Gifts →</div>
        </div>
      )}
    </div>
  );
}

function MilestoneMockup() {
  const events = [
    { label: "Work Anniversary", date: "Oct 12", emoji: "🎂", done: true },
    { label: "Birthday – James M.", date: "Oct 18", emoji: "🎉", done: true },
    { label: "Q4 Team Bonus", date: "Dec 1", emoji: "🏆", done: false },
    { label: "Holiday Hampers", date: "Dec 20", emoji: "🎄", done: false },
  ];
  return (
    <div className="p-4 space-y-2">
      {events.map((e, i) => (
        <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${!e.done ? "bg-white/5" : "opacity-40"}`}>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">{e.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-semibold truncate ${e.done ? "text-white/40 line-through" : "text-white"}`}>{e.label}</p>
            <p className="text-[9px] text-white/40">{e.date}</p>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${e.done ? "bg-emerald-400 border-emerald-400" : "border-white/20"}`}>
            {e.done && <span className="text-[7px] text-white font-bold">✓</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function WhitelabelMockup() {
  const brands = [
    { name: "ACME Corp", hex: "#D4AF37" },
    { name: "Nexus Ltd", hex: "#60A5FA" },
    { name: "ZaraCo.", hex: "#F472B6" },
    { name: "PearlBiz", hex: "#34D399" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(x => (x + 1) % brands.length), 1800);
    return () => clearInterval(t);
  }, []);
  const b = brands[idx];
  return (
    <div className="p-3">
      <div className="rounded-xl overflow-hidden border border-white/10">
        <div className="bg-white/5 px-2 py-1 flex items-center gap-1.5 border-b border-white/10">
          {["bg-red-400","bg-yellow-400","bg-green-400"].map(c => <span key={c} className={`w-1.5 h-1.5 ${c} rounded-full`} />)}
          <div className="flex-1 bg-white/5 rounded text-[8px] text-white/30 px-1.5 py-0.5 truncate">gifts.{b.name.toLowerCase().replace(/[^a-z]/g,"")}.com</div>
        </div>
        <div className="p-2" style={{ background: `color-mix(in srgb, ${b.hex} 8%, #111)` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 rounded transition-colors duration-500" style={{ background: b.hex }} />
            <span className="text-white text-[11px] font-bold">{b.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {["Birthday","Welcome","Client","Event"].map(n => (
              <div key={n} className="bg-white/5 rounded-lg p-1.5">
                <div className="w-full aspect-square rounded-md mb-1 transition-colors duration-500" style={{ background: `color-mix(in srgb, ${b.hex} 18%, transparent)` }} />
                <p className="text-white/50 text-[8px]">{n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CorporateSolution() {
  return (
    <section className="py-20 md:py-28 section-theme-c relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Reveal direction="scale">
            <p className="text-gold font-bold text-[11px] uppercase tracking-[0.2em] mb-4">How we do it</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display section-heading font-bold italic tracking-wide mb-4 text-theme-heading">
              The Art of{" "}
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">Corporate Gifting</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-theme-body text-lg leading-relaxed">
              We don&apos;t just deliver gifts. We architect professional gestures that strengthen relationships, celebrate milestones, and represent your brand beautifully.
            </p>
          </Reveal>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* 1. WhatsApp Bot — tall left (spans 1 col, 2 rows) */}
          <Reveal direction="left" delay={0}>
            <Link href="/corporate/whatsapp" className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] hover:border-emerald-400/30 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden relative md:row-span-2 h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="p-5 pb-2">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-3"><MessageSquare className="w-5 h-5 text-emerald-400" /></div>
                <h3 className="font-display text-[17px] font-bold text-white mb-1">WhatsApp Bot</h3>
                <p className="text-white/50 text-[11px] leading-relaxed">Recipients confirm delivery via WhatsApp. Zero app installs required.</p>
              </div>
              <div className="flex-1"><WhatsAppMockup /></div>
              <div className="px-5 pb-4"><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">See how it works <ArrowRight className="w-3 h-3" /></span></div>
            </Link>
          </Reveal>

          {/* 2. CSV Bulk Upload — top, spans 2 cols */}
          <Reveal direction="up" delay={100}>
            <Link href="/corporate/build" className="group block md:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex flex-col sm:flex-row">
                <div className="p-5 flex-1">
                  <div className="w-10 h-10 bg-gold/20 rounded-2xl flex items-center justify-center mb-3"><Upload className="w-5 h-5 text-gold" /></div>
                  <h3 className="font-display text-[17px] font-bold text-white mb-1">Bulk CSV Upload</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed">10 or 1,000 recipients — one file, one payment. We handle every delivery address.</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Try it now <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="sm:w-52 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-white/10"><CsvMockup /></div>
              </div>
            </Link>
          </Reveal>

          {/* 3. Bespoke Curation — top right */}
          <Reveal direction="right" delay={200}>
            <Link href="/corporate/build" className="group block rounded-3xl border border-white/10 bg-white/[0.03] hover:border-brand/30 hover:bg-white/[0.05] transition-all duration-500 p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-brand/20 rounded-2xl flex items-center justify-center mb-3"><Target className="w-5 h-5 text-brand-light" /></div>
                <h3 className="font-display text-[17px] font-bold text-white mb-2">Bespoke Curation</h3>
                <p className="text-white/50 text-[11px] leading-relaxed mb-4">Every hamper hand-picked to match your brand, budget, and occasion. No generic bundles.</p>
                <div className="flex flex-wrap gap-1.5">
                  {["🎁 Hampers","🍷 Spirits","💐 Florals","🧴 Wellness","🏆 Trophies"].map(tag => (
                    <span key={tag} className="text-[9px] font-semibold px-2 py-1 bg-white/5 border border-white/10 rounded-full text-white/60">{tag}</span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-light mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Build yours <ArrowRight className="w-3 h-3" /></span>
              </div>
            </Link>
          </Reveal>

          {/* 4. Automated Milestones — bottom, spans 2 cols */}
          <Reveal direction="up" delay={300}>
            <Link href="/corporate/milestones" className="group block md:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-amber-400/30 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex flex-col sm:flex-row-reverse">
                <div className="p-5 flex-1">
                  <div className="w-10 h-10 bg-amber-400/20 rounded-2xl flex items-center justify-center mb-3"><Trophy className="w-5 h-5 text-amber-400" /></div>
                  <h3 className="font-display text-[17px] font-bold text-white mb-1">Automated Milestones</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed">Set it and forget it. Auto-send gifts on work anniversaries, birthdays and promotions.</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Set up calendar <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="sm:w-52 flex-shrink-0 border-t sm:border-t-0 sm:border-r border-white/10"><MilestoneMockup /></div>
              </div>
            </Link>
          </Reveal>

          {/* 5. White-Label Portal — bottom right */}
          <Reveal direction="right" delay={400}>
            <Link href="/corporate/whitelabel" className="group block rounded-3xl border border-white/10 bg-white/[0.03] hover:border-cyan-400/30 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="p-5 pb-1">
                <div className="w-10 h-10 bg-cyan-400/20 rounded-2xl flex items-center justify-center mb-3"><Briefcase className="w-5 h-5 text-cyan-400" /></div>
                <h3 className="font-display text-[17px] font-bold text-white mb-1">White-Label Portal</h3>
                <p className="text-white/50 text-[11px] leading-relaxed">Your logo. Your colours. Your branded gift portal.</p>
              </div>
              <WhitelabelMockup />
            </Link>
          </Reveal>

          {/* 6. Utility strip — 4 small tiles across full width */}
          <Reveal direction="up" delay={500}>
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Zap className="w-5 h-5 text-coral" />, title: "Same-Day Delivery", desc: "Order by noon, delivered by evening across Nairobi.", href: "/corporate/build", bg: "bg-coral/10 group-hover:border-coral/30" },
                { icon: <EyeOff className="w-5 h-5 text-brand-light" />, title: "Absolute Discretion", desc: "Anonymous gifting, zero branding unless you want it.", href: "/corporate/build", bg: "bg-brand/10 group-hover:border-brand/30" },
                { icon: <HeartHandshake className="w-5 h-5 text-rose-400" />, title: "Client Appreciation", desc: "VIP tracking and personalised CRM follow-ups.", href: "/corporate/clients", bg: "bg-rose-400/10 group-hover:border-rose-400/30" },
                { icon: <Camera className="w-5 h-5 text-success" />, title: "Photo Proof", desc: "Every delivery photographed. Full accountability.", href: "/corporate/dashboard", bg: "bg-success/10 group-hover:border-success/30" },
              ].map((c, i) => (
                <Link key={i} href={c.href} className={`group flex items-start gap-3 p-4 rounded-2xl border border-white/10 ${c.bg} transition-all duration-300`}>
                  <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">{c.icon}</div>
                  <div>
                    <h4 className="text-white text-[12px] font-bold mb-0.5">{c.title}</h4>
                    <p className="text-white/40 text-[10px] leading-relaxed">{c.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>

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
    { icon: <Trophy className="w-6 h-6 text-white" />, title: "Employee Appreciation", desc: "Reward hard work with curated gifts for milestones, anniversaries, and top performers.", color: "from-brand to-brand-light", href: "/corporate/milestones" },
    { icon: <HeartHandshake className="w-6 h-6 text-white" />, title: "Client Thank-Yous", desc: "Strengthen relationships after closing a deal, onboarding a client, or during holidays.", color: "from-gold to-gold-light", href: "/corporate/build" },
    { icon: <Tent className="w-6 h-6 text-white" />, title: "Event Giveaways", desc: "Branded gift bags for conferences, launches, and corporate events.", color: "from-coral to-coral-light", href: "/corporate/build" },
    { icon: <TreePine className="w-6 h-6 text-white" />, title: "Holiday & Seasonal", desc: "Christmas, New Year, Ramadan, Easter — seasonal gifts for your entire team.", color: "from-emerald-500 to-teal-500", href: "/corporate/calendar" },
    { icon: <Hand className="w-6 h-6 text-white" />, title: "Welcome Kits", desc: "Make new hires feel valued from day one with a branded onboarding hamper.", color: "from-violet-500 to-purple-500", href: "/corporate/build" },
    { icon: <Heart className="w-6 h-6 text-white" />, title: "Milestone Celebrations", desc: "Company anniversaries, product launches, partnerships — mark every milestone.", color: "from-blue-500 to-cyan-500", href: "/corporate/milestones" },
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
              <Link href={c.href} className="h-full card-theme shape-premium-card p-6 border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden block">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${c.color} shape-premium-card flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                    {c.icon}
                  </div>
                  <h3 className="font-display italic text-lg font-bold mb-2 text-theme-heading group-hover:text-gold transition-colors duration-300">{c.title}</h3>
                  <p className="text-theme-muted text-sm leading-relaxed">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
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
   SECTION 5: HOW IT WORKS — 4-step corporate flow
   ══════════════════════════════════════════════════════════ */
function CorporateHowItWorks() {
  const steps = [
    { num: "01", icon: <Gift className="w-8 h-8" />, title: "Pick your gift", desc: "Choose from curated hampers or build a custom one. Browse our catalog or let us suggest based on your budget.", accent: "from-gold/20 to-gold/5", href: "/corporate/build" },
    { num: "02", icon: <Upload className="w-8 h-8" />, title: "Add recipients", desc: "Upload a CSV spreadsheet or add recipients manually. Include names, phone numbers, and personal notes.", accent: "from-brand-light/20 to-brand-light/5", href: "/corporate/build" },
    { num: "03", icon: <Palette className="w-8 h-8" />, title: "Customize", desc: "Add your company logo to cards, choose branded packaging, or include a custom message for all recipients.", accent: "from-coral/20 to-coral/5", href: "/corporate/build" },
    { num: "04", icon: <Rocket className="w-8 h-8" />, title: "Deliver & track", desc: "One M-Pesa payment for all gifts. We handle individual delivery with photo proof for each recipient.", accent: "from-success/20 to-success/5", href: "/corporate/dashboard" },
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
                <Link href={step.href} className={`relative block card-theme shape-premium-card p-6 border border-surface-border hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-2 bg-gradient-to-br ${step.accent}`}>
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
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Get started <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
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
    { target: 100, suffix: "+", label: "Gifts delivered", emoji: "🎁" },
    { target: 95, suffix: "%", label: "On-time delivery", emoji: "⚡" },
    { target: 500, suffix: "+", label: "Corporate clients", emoji: "🏢" },
    { target: 4, suffix: ".5★", label: "Average rating", emoji: "⭐" },
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
          <div className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -ml-4 md:-ml-8 py-4">
            {/* Left fade overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #FDF8F0 0%, transparent 100%)" }} />
            {/* Right fade overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #FDEEE0 0%, transparent 100%)" }} />

            <div className="relative flex overflow-x-hidden group px-4 md:px-8">
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
            <Link
              href="/corporate/pool/create"
              className="group px-10 py-5 bg-white/10 backdrop-blur-sm text-theme-heading font-semibold rounded-2xl text-xl border border-surface-border hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Start a Team Gift Pool
                <Users className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
              </span>
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
export default function CorporateLanding({ products }: { products?: React.ReactNode }) {
  return (
    <div>
      <CorporateHero />
      {products && (
        <section className="py-20 section-theme-a">
          <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 mb-8 md:mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-theme-heading text-center">
              Curated for Corporate
            </h2>
            <p className="text-theme-body text-center mt-4 max-w-2xl mx-auto">
              A selection of our most loved gifts, ready to be branded, wrapped, and delivered across Kenya.
            </p>
          </div>
          {products}
        </section>
      )}
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
