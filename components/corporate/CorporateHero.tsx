"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, Sparkles, ArrowRight, ShieldCheck, Zap,
  Gift, BarChart3, MessageSquare, X, ChevronRight, Check, Package, Palette, Clock,
  Globe, Award, TrendingUp, Layers, ShoppingBag, Star,
} from "lucide-react";
import { MERCH_CATEGORIES, TOUCHLINE_BRIDGE } from "@/lib/corporate-merch";
import { CAPABILITIES, CAPABILITY_STATE_LABEL } from "@/lib/corporate-capabilities";
import CorporateSectionTabs from "@/components/corporate/CorporateSectionTabs";
import CorporateRangeSection from "@/components/corporate/CorporateRangeSection";
import CorporateProof from "@/components/corporate/CorporateProof";
import PackCalculator from "@/components/corporate/PackCalculator";


/* Category cards now come from lib/corporate-merch.ts, which mirrors
   catalog/brandables.csv. The previous nine cards were invented — style counts
   that matched no data, and three of them (workwear, banners, tents) are
   explicitly TouchLine territory per `coporate side.txt`. */


export default function CorporateHero({
  vatRegistered = false,
  vatRate = 0,
}: {
  vatRegistered?: boolean;
  vatRate?: number;
}) {
  return (
    /* Transparent on purpose: AmbientBackground is mounted in the root layout
       at z-[-1] and paints BEHIND this component. The opaque ground that used
       to live here covered the falling-gifts layer completely, which is why
       corporate looked flat while every other page animated. The palette
       still comes through — AmbientBackground renders the corporate
       steel-navy + gold variant on /corporate. */
    <div className="corporate-shell relative min-h-screen text-[var(--corp-hero-text)] selection:bg-[color:var(--corp-hero-accent)]/30 font-sans">

      {/* Fixed ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-30%] left-[10%] w-[80%] h-[60%] bg-[var(--corp-hero-accent)]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--corp-hero-gold)]/10 rounded-full blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b" style={{ background: "var(--corp-header-bg)", backdropFilter: "blur(20px)", borderColor: "var(--corp-hero-border)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* The real TouchGift mark, not a generic Building2 glyph — the
                corporate page is still the same brand as the storefront and
                should be recognisable as such at a glance. */}
            <Image
              src="/logo/logo.webp"
              alt="TouchGift"
              width={40}
              height={40}
              priority
              className="w-10 h-10 rounded-full object-cover ring-2" style={{ "--tw-ring-color": "var(--corp-border-str)" } as React.CSSProperties}
            />
            <div>
              <p className="font-display font-bold text-base leading-tight">TouchGift</p>
              <p className="text-[10px] text-[color:var(--corp-hero-accent)] font-semibold uppercase tracking-wider">Corporate</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Packs", href: "#packs" },
              { label: "How it works", href: "#how" },
              { label: "Proof", href: "#proof" },
              { label: "Catalog", href: "/corporate/catalog" },
            ].map(n => (
              <a key={n.label} href={n.href} className="text-sm font-semibold transition-colors text-[color:var(--corp-text-muted)] hover:text-[color:var(--corp-hero-text)]">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* /corporate renders no Header, so the platform toggle was simply
                absent here. Same component the storefront uses, so the two
                stay in sync. */}
            <ThemeToggle />
            <Link
              href="/corporate/portal"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[color:var(--corp-hero-accent)] hover:bg-[color:var(--corp-hero-accent-hover)] text-[color:var(--corp-hero-accent-text)] font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_var(--corp-hero-glow)] hover:shadow-[0_0_40px_var(--corp-hero-glow)] whitespace-nowrap"
            >
              Client Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──
          `relative` + its own overflow-hidden scopes the backdrop to this
          section only. It previously sat on the page root, which put the
          photo behind every section below.

          Stack order matters: opaque ground FIRST so nothing from the page
          behind can bleed through, then the photo, then the scrim. Putting
          the ground last (as an earlier attempt did) hid the photo entirely. */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--corp-hero-bg)" }} />
          <Image
            src="/hero/hero-corporate.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
          <div className="absolute inset-0" style={{ background: "var(--corp-hero-scrim)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-8" style={{ background: "var(--corp-hero-card)", borderColor: "var(--corp-hero-border)" }}>
            <Sparkles className="w-4 h-4 text-[color:var(--corp-hero-accent)]" />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--corp-hero-gold)" }}>B2B Gifting, Reinvented</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto text-[color:var(--corp-hero-text)]">
            Reward your team<br />
            <span className="italic font-light text-[color:var(--corp-hero-accent)]">at scale.</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--corp-hero-muted)" }}>
            Curated gifts for clients, teams, and milestones — branded when it matters,
            delivered when it counts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#packs"
              className="px-8 py-4 bg-[color:var(--corp-hero-accent)] hover:bg-[color:var(--corp-hero-accent-hover)] text-[color:var(--corp-hero-accent-text)] font-bold text-base rounded-2xl transition-all shadow-[0_0_40px_var(--corp-hero-glow)] hover:shadow-[0_0_60px_var(--corp-hero-glow)] flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" /> Browse Gift Packs
            </a>
            <Link
              href="/corporate/portal"
              className="px-8 py-4 bg-[color:var(--corp-hero-card)] hover:bg-[color:var(--corp-hero-accent)]/20 border border-[color:var(--corp-hero-border)] hover:border-[color:var(--corp-hero-accent)]/30 text-[color:var(--corp-hero-text)] font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-[color:var(--corp-hero-accent)]" /> Client Portal
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        {/* Truthful alternatives to the old stat row. The previous one read
            "2,400+ Companies Served · 98% On-time · KES 50M+ · 4.9 stars" and
            nothing in the database could produce any of those numbers. Three
            claims we can actually stand behind today. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-20 max-w-3xl mx-auto"
        >
          {[
            { icon: Palette, title: "Design in the browser", note: "Logo, artwork and placement — before you order" },
            { icon: Package, title: "Quotes, not guesswork", note: "Structured request with a real quote desk behind it" },
            { icon: Clock, title: "Same-day in Nairobi", note: "Next-day nationwide" },
          ].map((s, i) => (
            <div
              key={s.title}
              className="border rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-colors hover:border-[color:var(--corp-hero-accent)]/40"
              style={{ background: "var(--corp-hero-card)", borderColor: "var(--corp-hero-border)" }}
            >
              <s.icon className="w-5 h-5" style={{ color: "var(--corp-hero-gold)" }} />
              <span className="font-bold text-sm" style={{ color: "var(--corp-hero-text)" }}>{s.title}</span>
              <span className="text-[11px] leading-snug" style={{ color: "var(--corp-hero-muted)" }}>{s.note}</span>
            </div>
          ))}
        </motion.div>
      </div>
      </section>

      {/* ── Packs: tangible contents, published volume pricing, proforma ── */}
      <PackCalculator vatRegistered={vatRegistered} vatRate={vatRate} />

      {/* ── Section tabs (scroll-spy + TouchLine exit) ── */}
      <CorporateSectionTabs />

      {/* ── The range: our own product presentation ──
          moment → what fits it → quote. Deliberately not a copy of the
          storefront's category browsing; see CorporateRangeSection. ── */}
      <CorporateRangeSection />

      {/* ── How it works ──
          Was a six-card list where "Magic Link Delivery", "CSV Employee Roster"
          and the (now removed) Milestones section all promised the same thing,
          and which claimed capabilities that don't exist — "Send 500 gift links
          in one click", "track who's opened their gift in real time". Now: five
          cards in the order a buyer asks them, each labelled Live or In build. */}
      <section id="how" className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-28 scroll-mt-20">
      {/* anchor retained: #features was linked from elsewhere in the app */}
      <span id="features" className="sr-only" aria-hidden="true" />
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How it actually works</h2>
          <p className="text-[color:var(--corp-text-muted)] text-sm max-w-lg mx-auto">
            Five questions buyers ask, answered plainly — including the two we&apos;re still building.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 }}
              className="rounded-3xl border p-6 transition-all"
              style={{
                background: "var(--corp-surface)",
                borderColor: "var(--corp-border)",
                opacity: c.state === "building" ? 0.82 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-display text-xl font-bold text-[color:var(--corp-text)]">{c.title}</h3>
                <span
                  className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border"
                  style={
                    c.state === "live"
                      ? {
                          color: "var(--corp-accent-soft)",
                          borderColor: "var(--corp-accent)",
                          background: "var(--corp-surface-2)",
                        }
                      : {
                          color: "var(--corp-text-muted)",
                          borderColor: "var(--corp-border)",
                          background: "transparent",
                        }
                  }
                >
                  {CAPABILITY_STATE_LABEL[c.state]}
                </span>
              </div>
              <p className="text-[color:var(--corp-text)] text-sm font-semibold mb-2">{c.question}</p>
              <p className="text-[color:var(--corp-text-muted)] text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Proof: real numbers or an honest empty state ── */}
      <CorporateProof />

      {/* ── Branded Merchandise Hub ── */}
      <section id="merch" className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-28 scroll-mt-20">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end gap-6 mb-12"
        >
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">New · Live Branding Studio</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Brand{" "}
              <span className="italic font-light text-amber-400">anything</span>{" "}
              with your logo.
            </h2>
            <p className="text-[color:var(--corp-text-muted)] mt-3 text-sm max-w-xl leading-relaxed">
              Upload your logo once. Our Live Customization Studio lets you preview exactly how it looks on every product — embroidered on caps, screen-printed on polos, sublimated on umbrellas — before placing a single order.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-xs text-[color:var(--corp-text-muted)]">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Live design preview before ordering
            </div>
            <div className="flex items-center gap-3 text-xs text-[color:var(--corp-text-muted)]">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Bulk names for uniforms (1 design → 500 names)
            </div>
            <div className="flex items-center gap-3 text-xs text-[color:var(--corp-text-muted)]">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Digital proof before production
            </div>
            <div className="flex items-center gap-3 text-xs text-[color:var(--corp-text-muted)]">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Invoice / LPO / M-Pesa payment
            </div>
          </div>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {MERCH_CATEGORIES.map((cat, i) => (
            <motion.a
              key={cat.key}
              href={`/corporate/catalog?category=${cat.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group relative bg-[color:var(--corp-surface)] border border-[color:var(--corp-border)] rounded-2xl p-4 sm:p-5 hover:border-[color:var(--corp-accent)]/50 transition-all cursor-pointer flex gap-3 sm:gap-4 items-start"
            >
              <span className="text-2xl sm:text-3xl shrink-0 mt-0.5" aria-hidden>{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[color:var(--corp-text)] text-sm truncate">{cat.label}</p>
                <p className="text-[color:var(--corp-text-muted)] text-[11px] mt-0.5 leading-snug">{cat.blurb}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--corp-accent)]/12 text-[color:var(--corp-accent-soft)]">
                    Personalisable
                  </span>
                  <span className="text-[10px] text-[color:var(--corp-text-muted)] whitespace-nowrap">
                    MOQ {cat.moq}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[color:var(--corp-text-muted)] group-hover:translate-x-1 group-hover:text-[color:var(--corp-text)] transition-all shrink-0 mt-1" />
            </motion.a>
          ))}

          {/* View all */}
          <motion.a
            href="/corporate/catalog"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="group border border-[color:var(--corp-border)] border-dashed rounded-2xl p-5 hover:border-[color:var(--corp-border)] transition-all flex flex-col items-center justify-center gap-3 text-center"
          >
            <Layers className="w-8 h-8 text-[color:var(--corp-text-muted)] group-hover:text-[color:var(--corp-text-muted)] transition-colors" />
            <div>
              <p className="font-bold text-[color:var(--corp-text-muted)] group-hover:text-[color:var(--corp-text)] text-sm transition-colors">View All Products</p>
              <p className="text-[color:var(--corp-text-muted)] text-[11px] mt-1">170+ brandable items</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[color:var(--corp-text-muted)] group-hover:text-[color:var(--corp-text-muted)] group-hover:translate-x-1 transition-all" />
          </motion.a>
        </div>

        {/* Studio CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-amber-950/60 border border-amber-500/20 rounded-3xl p-8 flex flex-col md:flex-row md:items-center gap-6"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Live Customization Studio</span>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-[color:var(--corp-text)]">
              See your logo on the product <span className="italic text-amber-400">before</span> you order.
            </h3>
            <p className="text-[color:var(--corp-text-muted)] text-sm mt-2 leading-relaxed">
              Choose embroidery, screen print, DTG, sublimation or laser engrave. Position your artwork. Add names for each team member. Export a proof — all in real time.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <a
              href="/corporate/catalog"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)]"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Catalog
            </a>
            <a
              href="/corporate/build"
              className="px-6 py-3 bg-[color:var(--corp-surface)] hover:bg-[color:var(--corp-surface)] border border-[color:var(--corp-border)] text-[color:var(--corp-text)] font-bold text-sm rounded-xl flex items-center gap-2 transition-all"
            >
              <Palette className="w-4 h-4 text-amber-400" /> Open Studio
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/40 to-indigo-950/30 border border-[color:var(--corp-accent)]/20 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[color:var(--corp-accent)]/10 rounded-full blur-[80px]" />

          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Ready to transform employee recognition?
          </h2>
          <p className="text-[color:var(--corp-text-muted)] mb-8 relative z-10">
            Tell us who's being rewarded and we'll come back with a real quote — usually same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <a href="#how" className="px-8 py-4 bg-[color:var(--corp-accent)] hover:bg-[color:var(--corp-accent-soft)] text-[color:var(--corp-accent-text)] font-bold rounded-2xl transition-all shadow-[0_0_30px_var(--corp-glow)] flex items-center justify-center gap-2">
              Get Started <ChevronRight className="w-5 h-5" />
            </a>
            <a href="mailto:hello@touchgiftshop.co.ke" className="px-8 py-4 bg-[color:var(--corp-surface)] hover:bg-[color:var(--corp-surface)] border border-[color:var(--corp-border)] text-[color:var(--corp-text)] font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── TouchLine bridge ──
          Required by `coporate side.txt` §"Soft bridge": a clear but SECONDARY
          exit, on the corporate page only. The homepage and main catalog stay
          gift-led; this is where heavy brandable work gets handed off so the
          two brands stop competing for the same jobs. */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-28">
        <div className="rounded-3xl border border-dashed border-[color:var(--corp-border-str)] bg-[color:var(--corp-surface)] p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--corp-text-muted)] mb-2">
                {TOUCHLINE_BRIDGE.eyebrow}
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--corp-text)] mb-2">
                {TOUCHLINE_BRIDGE.heading}
              </h3>
              <p className="text-sm text-[color:var(--corp-text-muted)] leading-relaxed max-w-2xl">
                {TOUCHLINE_BRIDGE.body}
              </p>
            </div>
            <div className="flex flex-col sm:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={TOUCHLINE_BRIDGE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[color:var(--corp-accent)] hover:bg-[color:var(--corp-accent-soft)] text-[color:var(--corp-accent-text)] font-bold text-sm rounded-xl transition-all"
              >
                {TOUCHLINE_BRIDGE.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#packs"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-[color:var(--corp-border-str)] text-[color:var(--corp-text)] font-bold text-sm rounded-xl hover:bg-[color:var(--corp-surface-2)] transition-all"
              >
                {TOUCHLINE_BRIDGE.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
