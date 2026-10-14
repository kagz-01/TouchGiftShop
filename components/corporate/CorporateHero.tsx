"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, Sparkles, ArrowRight, ShieldCheck, Zap,
  Gift, BarChart3, MessageSquare, X, ChevronRight, Check,
  Globe, Clock, Award, TrendingUp, Palette, Layers, ShoppingBag, Star,
} from "lucide-react";
import { MERCH_CATEGORIES, MERCH_TOTAL_SKUS, TOUCHLINE_BRIDGE } from "@/lib/corporate-merch";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  media_urls?: string[];
  vibe_tags?: string[];
};

const STATS = [
  { value: "2,400+", label: "Companies Served", icon: Building2 },
  { value: "98%", label: "On-time Delivery", icon: Clock },
  { value: "KES 50M+", label: "Gifts Deployed", icon: Gift },
  { value: "4.9★", label: "Client Rating", icon: Award },
];

/* Category cards now come from lib/corporate-merch.ts, which mirrors
   catalog/brandables.csv. The previous nine cards were invented — style counts
   that matched no data, and three of them (workwear, banners, tents) are
   explicitly TouchLine territory per `coporate side.txt`. */
const FEATURES = [
  {
    icon: Zap,
    title: "Magic Link Delivery",
    desc: "Send 500 gift links in one click. Each one opens a cinematic unboxing experience — no app required.",
    color: "emerald",
  },
  {
    icon: Users,
    title: "CSV Employee Roster",
    desc: "Upload your team spreadsheet. Our engine blasts personalized gift notifications via SMS & WhatsApp.",
    color: "teal",
  },
  {
    icon: BarChart3,
    title: "Live Redemption Analytics",
    desc: "Track who's opened their gift in real time. Get a beautiful dashboard with team-wide stats.",
    color: "cyan",
  },
  {
    icon: MessageSquare,
    title: "Branded Experience",
    desc: "White-label the unboxing with your company logo, brand colors, and a custom CEO message.",
    color: "rose",
  },
  {
    icon: Globe,
    title: "Multi-Region Delivery",
    desc: "Physical gifts dispatched across Kenya within 24–48 hours. Digital gifts instantly, worldwide.",
    color: "orange",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "Secure payment rails via PesaPal. Bank transfer invoicing for large procurement teams.",
    color: "emerald",
  },
];

const MILESTONES = [
  { trigger: "New Hire Onboarded", gift: "Welcome Kit 🎉", auto: true },
  { trigger: "Work Anniversary (1yr, 3yr, 5yr)", gift: "Milestone Trophy + Gift Card", auto: true },
  { trigger: "Quarter Targets Hit", gift: "Team Celebration Box", auto: true },
  { trigger: "Birthday", gift: "Surprise Luxury Box", auto: true },
];

export default function CorporateHero({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [teamSize, setTeamSize] = useState(50);

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
              { label: "Features", href: "#features" },
              { label: "Milestones", href: "#milestones" },
              { label: "Pricing", href: "#packs" },
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
              href="/corporate/dashboard"
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
              href="/corporate/dashboard"
              className="px-8 py-4 bg-[color:var(--corp-hero-card)] hover:bg-[color:var(--corp-hero-accent)]/20 border border-[color:var(--corp-hero-border)] hover:border-[color:var(--corp-hero-accent)]/30 text-[color:var(--corp-hero-text)] font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-[color:var(--corp-hero-accent)]" /> View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
        >
          {STATS.map((s, i) => (
            <div key={i} className="border rounded-2xl p-5 flex flex-col items-center gap-2 transition-colors hover:border-[color:var(--corp-hero-accent)]/40" style={{ background: "var(--corp-hero-card)", borderColor: "var(--corp-hero-border)" }}>
              <s.icon className="w-5 h-5" style={{ color: "var(--corp-hero-gold)" }} />
              <span className="font-display text-2xl font-bold" style={{ color: "var(--corp-hero-text)" }}>{s.value}</span>
              <span className="text-xs font-medium" style={{ color: "var(--corp-hero-muted)" }}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
      </section>

      {/* ── Corporate Packs ── */}
      <section id="packs" className="relative z-10 max-w-7xl mx-auto px-4 pb-28">
        <div className="flex items-center gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Curated Team Packs</h2>
            <p className="text-[color:var(--corp-text-muted)] text-sm mt-1">Each pack is purpose-built for specific team moments.</p>
          </div>
          <div className="ml-auto hidden md:block">
            <div className="bg-[color:var(--corp-accent)]/10 border border-[color:var(--corp-accent)]/20 rounded-2xl px-4 py-2 text-xs text-[color:var(--corp-accent-soft)] font-bold">
              Volume discounts: 50+ (5%) · 100+ (10%) · 500+ (15%)
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-[color:var(--corp-surface)] border border-[color:var(--corp-border)] rounded-3xl p-16 text-center">
            <Gift className="w-12 h-12 text-[color:var(--corp-text-muted)] mx-auto mb-4" />
            <p className="text-[color:var(--corp-text-muted)] text-sm">Corporate packs coming soon. Tag products with "Corporate" to show them here.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 mt-4 text-[color:var(--corp-accent-soft)] text-sm font-semibold hover:text-[color:var(--corp-accent-soft)] transition-colors">
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/[0.02] border border-[color:var(--corp-border)] hover:border-[color:var(--corp-accent)]/30 transition-all duration-500 rounded-[2rem] overflow-hidden group flex flex-col"
              >
                <div className="h-52 relative overflow-hidden bg-gradient-to-br from-blue-950/30 to-indigo-950/20">
                  {product.media_urls?.[0] ? (
                    <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-16 h-16 text-[color:var(--corp-accent-soft)]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--corp-bg)] via-transparent to-transparent" />
                </div>

                <div className="p-6 flex-1 flex flex-col -mt-8 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-[color:var(--corp-border)] text-[10px] font-bold text-[color:var(--corp-accent-soft)] uppercase tracking-wider">
                      KES {Number(product.price).toLocaleString("en-US")} / head
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold italic mb-2 text-[color:var(--corp-text)] group-hover:text-[color:var(--corp-accent-soft)] transition-colors">{product.name}</h3>
                  <p className="text-[color:var(--corp-text-muted)] text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{product.description}</p>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-4 bg-[color:var(--corp-surface)] hover:bg-[color:var(--corp-accent)] hover:text-[color:var(--corp-accent-text)] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 font-bold border border-[color:var(--corp-border)] hover:border-[color:var(--corp-accent-soft)] text-sm group/btn"
                  >
                    <Users className="w-4 h-4 text-[color:var(--corp-accent-soft)] group-hover/btn:text-[color:var(--corp-accent-text)] transition-colors" />
                    Order for Team
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 pb-28">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Enterprise-Grade Features</h2>
          <p className="text-[color:var(--corp-text-muted)] text-sm max-w-lg mx-auto">Everything your HR and executive team needs to reward at scale, beautifully.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-[color:var(--corp-border)] hover:border-[color:var(--corp-accent)]/20 rounded-3xl p-6 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-[color:var(--corp-accent)]/10 border border-[color:var(--corp-accent)]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-[color:var(--corp-accent-soft)]" />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-[color:var(--corp-text-muted)] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Branded Merchandise Hub ── */}
      <section id="merch" className="relative z-10 max-w-7xl mx-auto px-4 pb-28">
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

        {/* Category grid — counts are the real SKU counts from brandables.csv */}
        <p className="text-center text-[11px] text-[color:var(--corp-text-muted)] mb-6">
          {MERCH_TOTAL_SKUS} gift-ready branded styles, ready to personalise
        </p>
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
                    {cat.count} styles
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

      {/* ── Milestone Automation ── */}
      <section id="milestones" className="relative z-10 max-w-7xl mx-auto px-4 pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1.5 mb-6">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Set it & Forget it</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">
              Automate milestone<br />
              <span className="italic font-light text-rose-400">gifting forever.</span>
            </h2>
            <p className="text-[color:var(--corp-text-muted)] mb-8 leading-relaxed text-sm">
              Connect your HRIS or upload a roster once. TouchGift automatically sends gifts on work anniversaries, birthdays, and performance milestones — no manual intervention needed.
            </p>
            <Link href="/corporate/milestones" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-sm rounded-xl transition-all">
              Configure Automations <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {MILESTONES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/[0.02] border border-[color:var(--corp-border)] hover:border-rose-500/20 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[color:var(--corp-text-muted)] mb-0.5">Trigger</p>
                  <p className="text-sm font-semibold text-[color:var(--corp-text)]">{m.trigger}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[color:var(--corp-text-muted)] group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                <div className="flex-1 text-right">
                  <p className="text-xs text-[color:var(--corp-text-muted)] mb-0.5">Gift</p>
                  <p className="text-sm font-semibold text-rose-300">{m.gift}</p>
                </div>
                {m.auto && (
                  <div className="shrink-0 w-6 h-6 bg-[color:var(--corp-accent)]/10 border border-[color:var(--corp-accent)]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[color:var(--corp-accent-soft)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
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
            Join 2,400+ companies using TouchGift to reward what matters most — their people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <a href="#packs" className="px-8 py-4 bg-[color:var(--corp-accent)] hover:bg-[color:var(--corp-accent-soft)] text-[color:var(--corp-accent-text)] font-bold rounded-2xl transition-all shadow-[0_0_30px_var(--corp-glow)] flex items-center justify-center gap-2">
              Get Started <ChevronRight className="w-5 h-5" />
            </a>
            <a href="mailto:corporate@touchgift.shop" className="px-8 py-4 bg-[color:var(--corp-surface)] hover:bg-[color:var(--corp-surface)] border border-[color:var(--corp-border)] text-[color:var(--corp-text)] font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── "Order for Team" Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              key="modal-content"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg bg-[#0A0508] border border-[color:var(--corp-border)] rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold italic">{selectedProduct.name}</h3>
                  <p className="text-[color:var(--corp-text-muted)] text-sm mt-1">KES {Number(selectedProduct.price).toLocaleString("en-US")} / recipient</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-[color:var(--corp-surface)] rounded-xl transition-colors">
                  <X className="w-5 h-5 text-[color:var(--corp-text-muted)]" />
                </button>
              </div>

              {/* Team size slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-[color:var(--corp-text-muted)] uppercase tracking-wider">Team Size</span>
                  <span className="font-display text-2xl font-bold text-[color:var(--corp-accent-soft)]">{teamSize} people</span>
                </div>
                <input
                  type="range" min="10" max="1000" step="10"
                  value={teamSize}
                  onChange={e => setTeamSize(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-[color:var(--corp-text-muted)] mt-2 font-bold uppercase tracking-wider">
                  <span>10</span>
                  <span className={teamSize >= 50 && teamSize < 100 ? "text-[color:var(--corp-accent-soft)]" : ""}>50+ (5% off)</span>
                  <span className={teamSize >= 100 && teamSize < 500 ? "text-[color:var(--corp-accent-soft)]" : ""}>100+ (10% off)</span>
                  <span className={teamSize >= 500 ? "text-[color:var(--corp-accent-soft)]" : ""}>500+ (15% off)</span>
                </div>
              </div>

              {/* Price summary */}
              {(() => {
                const base = selectedProduct.price * teamSize;
                const pct = teamSize >= 500 ? 0.15 : teamSize >= 100 ? 0.10 : teamSize >= 50 ? 0.05 : 0;
                const discount = base * pct;
                const final = base - discount;
                return (
                  <div className="bg-[color:var(--corp-surface)] border border-[color:var(--corp-border)] rounded-2xl p-4 mb-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[color:var(--corp-text-muted)]">Subtotal</span>
                      <span>KES {base.toLocaleString("en-US")}</span>
                    </div>
                    {pct > 0 && (
                      <div className="flex justify-between text-[color:var(--corp-accent-soft)]">
                        <span>Volume Discount ({pct * 100}%)</span>
                        <span>- KES {discount.toLocaleString("en-US")}</span>
                      </div>
                    )}
                    <div className="border-t border-[color:var(--corp-border)] pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-[color:var(--corp-accent-soft)]">KES {final.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                );
              })()}

              <Link
                href={`/corporate/checkout?product=${selectedProduct.id}&qty=${teamSize}`}
                className="w-full py-4 bg-[color:var(--corp-accent)] hover:bg-[color:var(--corp-accent-soft)] text-[color:var(--corp-accent-text)] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_var(--corp-glow)] hover:shadow-[0_0_50px_var(--corp-glow)]"
              >
                Continue to Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-center text-[11px] text-[color:var(--corp-text-muted)] mt-3">
                Supports M-Pesa, Bank Wire, and Proforma Invoicing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
