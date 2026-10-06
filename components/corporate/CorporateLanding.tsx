"use client";

import Link from "next/link";
import {
  Upload, Users, Trophy, MessageSquare, Briefcase, ArrowRight, Star, Package, ChevronRight
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

function useInView(threshold = 0.1) {
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

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const CORPORATE_CATEGORIES = [
  { label: "Executive Hampers", desc: "For clients & VIPs", emoji: "🎁", href: "/shop?category=hampers", accent: "from-gold/30 to-amber-600/20", border: "border-gold/20 hover:border-gold/50" },
  { label: "Client Welcome Kits", desc: "Branded onboarding gifts", emoji: "📦", href: "/shop?category=welcome-kits", accent: "from-cyan-400/20 to-blue-500/10", border: "border-cyan-400/20 hover:border-cyan-400/50" },
  { label: "Team Treats", desc: "Celebrate your people", emoji: "🎉", href: "/shop?category=team-gifts", accent: "from-fuchsia-400/20 to-purple-500/10", border: "border-fuchsia-400/20 hover:border-fuchsia-400/50" },
  { label: "Work Anniversary", desc: "Milestone recognition", emoji: "🏆", href: "/shop?category=anniversary", accent: "from-violet-400/20 to-indigo-500/10", border: "border-violet-400/20 hover:border-violet-400/50" },
  { label: "Holiday Collections", desc: "Festive corporate gifting", emoji: "🎄", href: "/shop?category=holiday", accent: "from-rose-400/20 to-pink-500/10", border: "border-rose-400/20 hover:border-rose-400/50" },
  { label: "Branded Swag", desc: "Custom logo merchandise", emoji: "✨", href: "/shop?category=branded", accent: "from-emerald-400/20 to-teal-500/10", border: "border-emerald-400/20 hover:border-emerald-400/50" },
  { label: "Thank You Boxes", desc: "Show appreciation", emoji: "💝", href: "/shop?category=thank-you", accent: "from-orange-400/20 to-amber-500/10", border: "border-orange-400/20 hover:border-orange-400/50" },
  { label: "Wellness & Self-Care", desc: "Thoughtful employee gifts", emoji: "🧘", href: "/shop?category=wellness", accent: "from-sky-400/20 to-blue-400/10", border: "border-sky-400/20 hover:border-sky-400/50" },
];

export default function CorporateLanding() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  const features = [
    { title: "Bulk CSV Upload", desc: "Upload a spreadsheet of recipients. We handle the rest.", icon: <Upload className="w-6 h-6 text-gold" />, href: "/corporate/bulk-upload", bg: "bg-gold/10", border: "border-gold/20 hover:border-gold/40" },
    { title: "WhatsApp Delivery Bot", desc: "Recipients confirm their own delivery addresses via WhatsApp.", icon: <MessageSquare className="w-6 h-6 text-emerald-400" />, href: "/corporate/whatsapp", bg: "bg-emerald-500/10", border: "border-emerald-500/20 hover:border-emerald-500/40" },
    { title: "Automated Milestones", desc: "Set and forget birthdays, work anniversaries, and promotions.", icon: <Trophy className="w-6 h-6 text-amber-400" />, href: "/corporate/milestones", bg: "bg-amber-400/10", border: "border-amber-400/20 hover:border-amber-400/40" },
    { title: "White-Label Portal", desc: "Your company logo, colors, and domain for a branded experience.", icon: <Briefcase className="w-6 h-6 text-cyan-400" />, href: "/corporate/whitelabel", bg: "bg-cyan-400/10", border: "border-cyan-400/20 hover:border-cyan-400/40" },
    { title: "Team Pool Gifting", desc: "Easily organize group collections for farewells, maternity, or boss's day.", icon: <Users className="w-6 h-6 text-fuchsia-400" />, href: "/corporate/pool/create", bg: "bg-fuchsia-400/10", border: "border-fuchsia-400/20 hover:border-fuchsia-400/40" },
    { title: "Bespoke Swag & Branding", desc: "Custom engraved gifts, branded ribbons, and tailored corporate hampers.", icon: <Star className="w-6 h-6 text-rose-400" />, href: "/shop?category=corporate", bg: "bg-rose-400/10", border: "border-rose-400/20 hover:border-rose-400/40" },
  ];

  const loop = [...CORPORATE_CATEGORIES, ...CORPORATE_CATEGORIES, ...CORPORATE_CATEGORIES];

  return (
    <div className="bg-[#14080D] min-h-screen">
      {/* ── CINEMATIC HERO ── */}
      <section className="relative min-h-[70vh] -mt-[130px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero/hero-corporate.webp" alt="Corporate Gifting" className={`w-full h-full object-cover object-center transition-all duration-[5000ms] ease-out ${loaded ? "scale-105 blur-0" : "scale-100 blur-sm"}`} />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14080D] via-transparent to-[#14080D]/40 opacity-100" />
        </div>
        <div className="w-full px-6 md:px-12 pt-[150px] pb-10 relative z-30 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className={`transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-gold font-bold bg-gold/10 px-4 py-2 rounded-full border border-gold/20">Corporate &amp; Team Gifting</span>
          </div>
          <h1 className={`mt-8 font-display font-bold text-white leading-tight transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}>
            Make business feel<br /><span className="text-gold italic font-light">personal.</span>
          </h1>
          <p className={`mt-6 text-white/70 max-w-2xl leading-relaxed md:text-lg transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Beautifully curated hampers for clients and teams. Discover our catalog, automate your milestones, or upload a CSV for seamless bulk delivery across Nairobi.
          </p>
        </div>
      </section>

      {/* ── POWERFUL FEATURES ── */}
      <section className="relative z-40 -mt-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <Link href={f.href} className={`group flex flex-col h-full p-6 rounded-3xl bg-[#1F1118]/80 backdrop-blur-xl border ${f.border} hover:bg-[#2A1721] transition-all duration-500 hover:-translate-y-2`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.bg} group-hover:scale-110 transition-transform duration-500`}>{f.icon}</div>
                <h3 className="text-white font-display font-bold text-lg mb-2 group-hover:text-gold transition-colors">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1">{f.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-white/80 transition-colors">
                  Try Feature <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CORPORATE GIFT CATEGORIES ── */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <Reveal>
          <div className="px-6 md:px-12 max-w-7xl mx-auto mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-gold font-bold text-xs uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Shop by Category
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                Every occasion,<br /><span className="text-gold italic font-light">perfectly wrapped.</span>
              </h2>
              <p className="text-white/50 text-sm mt-3 max-w-md">From executive boardrooms to remote teams — we have a curated category for every corporate moment.</p>
            </div>
            <Link href="/shop?category=corporate" className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-gold transition-colors bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:border-gold/30 flex-shrink-0">
              Browse all gifts <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="relative overflow-x-hidden group w-[calc(100%+3rem)] -ml-6 px-6 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
          <div className="flex gap-4 pb-4 w-max whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
            {loop.map((cat, i) => (
              <Link
                key={`${cat.label}-${i}`}
                href={cat.href}
                className={`group/card relative w-[220px] sm:w-[250px] shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br ${cat.accent} bg-[#1A0D14] border ${cat.border} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]`}
              >
                <div className="p-6 flex flex-col justify-between h-full min-h-[180px]">
                  <div className="text-4xl mb-4 group-hover/card:scale-110 transition-transform duration-500 inline-block">{cat.emoji}</div>
                  <div>
                    <p className="font-display font-bold text-white text-base leading-tight">{cat.label}</p>
                    <p className="text-white/50 text-xs mt-1">{cat.desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-white/30 group-hover/card:text-white/60 transition-colors">
                      Explore <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATALOG REDIRECT CTA ── */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <Reveal>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-12 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/20 rounded-full blur-[80px] pointer-events-none" />
            <h2 className="relative font-display text-4xl font-bold text-white mb-4">
              Curated for <span className="italic text-gold font-light">Corporate</span>
            </h2>
            <p className="relative text-white/70 max-w-lg mx-auto text-lg mb-8 leading-relaxed">
              Explore our premium corporate catalog. Browse our full range of gifts ready to be branded, customized, and delivered across Kenya.
            </p>
            <Link href="/shop?category=corporate" className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(252,211,77,0.3)] transition-all duration-300">
              Browse Corporate Catalog <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
