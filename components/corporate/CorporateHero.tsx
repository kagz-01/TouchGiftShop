"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, Sparkles, ArrowRight, ShieldCheck, Zap,
  Gift, BarChart3, MessageSquare, X, ChevronRight, Check,
  Globe, Clock, Award, TrendingUp, Palette, Layers, ShoppingBag, Star,
} from "lucide-react";

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

// Branded merchandise catalog categories for awareness
const MERCH_CATEGORIES = [
  {
    emoji: "👕",
    label: "T-shirts & Polos",
    desc: "DTG, screen print, embroidery",
    count: "20 styles",
    moq: "25 units",
    href: "/corporate/catalog?category=apparel",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-400",
  },
  {
    emoji: "🧥",
    label: "Jackets & Workwear",
    desc: "Softshell, parka, overalls, hi-vis",
    count: "32 styles",
    moq: "10 units",
    href: "/corporate/catalog?category=workwear",
    color: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400",
  },
  {
    emoji: "🧢",
    label: "Caps & Headwear",
    desc: "Baseball, trucker, snapback, bucket",
    count: "9 styles",
    moq: "25 units",
    href: "/corporate/catalog?category=caps",
    color: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/20",
    badge: "bg-orange-500/10 text-orange-400",
  },
  {
    emoji: "🎒",
    label: "Bags & Totes",
    desc: "Cotton, jute, duffel, laptop bags",
    count: "15 styles",
    moq: "25 units",
    href: "/corporate/catalog?category=bags",
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
    badge: "bg-rose-500/10 text-rose-400",
  },
  {
    emoji: "🪧",
    label: "Banners & Displays",
    desc: "Roll-up, X-banner, media wall, pop-up",
    count: "11 formats",
    moq: "1 unit",
    href: "/corporate/catalog?category=banners",
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
    badge: "bg-violet-500/10 text-violet-400",
  },
  {
    emoji: "☂️",
    label: "Umbrellas & Tents",
    desc: "Golf, compact, 3×3 branded gazebos",
    count: "6 styles",
    moq: "10 units",
    href: "/corporate/catalog?category=umbrellas",
    color: "from-sky-500/20 to-indigo-500/10",
    border: "border-sky-500/20",
    badge: "bg-sky-500/10 text-sky-400",
  },
  {
    emoji: "🏆",
    label: "Drinkware & Awards",
    desc: "Mugs, tumblers, bottles, laser engrave",
    count: "18 styles",
    moq: "12 units",
    href: "/corporate/catalog?category=drinkware",
    color: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/20",
    badge: "bg-yellow-500/10 text-yellow-400",
  },
  {
    emoji: "📓",
    label: "Notebooks & Pens",
    desc: "Leather journals, deboss, gold foil",
    count: "12 styles",
    moq: "20 units",
    href: "/corporate/catalog?category=stationery",
    color: "from-stone-500/20 to-neutral-500/10",
    border: "border-stone-500/20",
    badge: "bg-stone-500/10 text-stone-400",
  },
  {
    emoji: "🧣",
    label: "Blankets & Towels",
    desc: "Fleece throw, beach, golf, picnic",
    count: "5 styles",
    moq: "15 units",
    href: "/corporate/catalog?category=fabric",
    color: "from-teal-500/20 to-green-500/10",
    border: "border-teal-500/20",
    badge: "bg-teal-500/10 text-teal-400",
  },
];

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
    <div className="min-h-screen bg-[#050304] text-white selection:bg-emerald-500/30 font-sans">

      {/* Fixed ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-30%] left-[10%] w-[80%] h-[60%] bg-emerald-900/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-teal-900/10 rounded-full blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#050304]/70 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-display font-bold text-base leading-tight">TouchGift</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Corporate</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Packs", href: "#packs" },
              { label: "Features", href: "#features" },
              { label: "Milestones", href: "#milestones" },
              { label: "Pricing", href: "#packs" },
            ].map(n => (
              <a key={n.label} href={n.href} className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <Link
            href="/corporate/dashboard"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#050304] font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            Client Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">B2B Gifting, Reinvented</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto">
            Reward your team<br />
            <span className="italic font-light text-emerald-400">at scale.</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Forget spreadsheets and logistics. Send 50 or 5,000 gifts instantly via Magic Links or SMS.
            They unbox digitally — we handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#packs"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050304] font-bold text-base rounded-2xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.45)] flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" /> Browse Gift Packs
            </a>
            <Link
              href="/corporate/dashboard"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" /> View Dashboard
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
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-emerald-500/20 transition-colors">
              <s.icon className="w-5 h-5 text-emerald-400" />
              <span className="font-display text-2xl font-bold text-white">{s.value}</span>
              <span className="text-white/40 text-xs font-medium">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Corporate Packs ── */}
      <section id="packs" className="relative z-10 max-w-7xl mx-auto px-4 pb-28">
        <div className="flex items-center gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Curated Team Packs</h2>
            <p className="text-white/50 text-sm mt-1">Each pack is purpose-built for specific team moments.</p>
          </div>
          <div className="ml-auto hidden md:block">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2 text-xs text-emerald-400 font-bold">
              Volume discounts: 50+ (5%) · 100+ (10%) · 500+ (15%)
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <Gift className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Corporate packs coming soon. Tag products with "Corporate" to show them here.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 mt-4 text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors">
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
                className="bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 rounded-[2rem] overflow-hidden group flex flex-col"
              >
                <div className="h-52 relative overflow-hidden bg-gradient-to-br from-emerald-900/30 to-teal-900/20">
                  {product.media_urls?.[0] ? (
                    <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-16 h-16 text-emerald-400/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050304] via-transparent to-transparent" />
                </div>

                <div className="p-6 flex-1 flex flex-col -mt-8 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      KES {Number(product.price).toLocaleString("en-US")} / head
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold italic mb-2 text-white group-hover:text-emerald-300 transition-colors">{product.name}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{product.description}</p>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-4 bg-white/5 hover:bg-emerald-500 hover:text-[#050304] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 font-bold border border-white/10 hover:border-emerald-400 text-sm group/btn"
                  >
                    <Users className="w-4 h-4 text-emerald-400 group-hover/btn:text-[#050304] transition-colors" />
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
          <p className="text-white/50 text-sm max-w-lg mx-auto">Everything your HR and executive team needs to reward at scale, beautifully.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 rounded-3xl p-6 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
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
            <p className="text-white/50 mt-3 text-sm max-w-xl leading-relaxed">
              Upload your logo once. Our Live Customization Studio lets you preview exactly how it looks on every product — embroidered on caps, screen-printed on polos, sublimated on umbrellas — before placing a single order.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-xs text-white/50">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Live design preview before ordering
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Bulk names for uniforms (1 design → 500 names)
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Digital proof before production
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <Check className="w-4 h-4 text-amber-400 shrink-0" /> Invoice / LPO / M-Pesa payment
            </div>
          </div>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {MERCH_CATEGORIES.map((cat, i) => (
            <motion.a
              key={cat.label}
              href={cat.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group relative bg-gradient-to-br ${cat.color} border ${cat.border} rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-pointer flex gap-4 items-start`}
            >
              <span className="text-3xl shrink-0 mt-0.5">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{cat.label}</p>
                <p className="text-white/50 text-[11px] mt-0.5 leading-snug">{cat.desc}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badge}`}>
                    {cat.count}
                  </span>
                  <span className="text-[10px] text-white/40">
                    MOQ: {cat.moq}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </motion.a>
          ))}

          {/* View all */}
          <motion.a
            href="/corporate/catalog"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="group border border-white/10 border-dashed rounded-2xl p-5 hover:border-white/30 transition-all flex flex-col items-center justify-center gap-3 text-center"
          >
            <Layers className="w-8 h-8 text-white/20 group-hover:text-white/50 transition-colors" />
            <div>
              <p className="font-bold text-white/40 group-hover:text-white/70 text-sm transition-colors">View All Products</p>
              <p className="text-white/25 text-[11px] mt-1">170+ brandable items</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
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
            <h3 className="font-display text-xl md:text-2xl font-bold text-white">
              See your logo on the product <span className="italic text-amber-400">before</span> you order.
            </h3>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">
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
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all"
            >
              <Palette className="w-4 h-4 text-amber-400" /> Open Studio
            </a>
          </div>
        </motion.div>
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
            <p className="text-white/60 mb-8 leading-relaxed text-sm">
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
                className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-rose-500/20 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-0.5">Trigger</p>
                  <p className="text-sm font-semibold text-white">{m.trigger}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                <div className="flex-1 text-right">
                  <p className="text-xs text-white/40 mb-0.5">Gift</p>
                  <p className="text-sm font-semibold text-rose-300">{m.gift}</p>
                </div>
                {m.auto && (
                  <div className="shrink-0 w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-500/20 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px]" />

          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Ready to transform employee recognition?
          </h2>
          <p className="text-white/60 mb-8 relative z-10">
            Join 2,400+ companies using TouchGift to reward what matters most — their people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <a href="#packs" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050304] font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
              Get Started <ChevronRight className="w-5 h-5" />
            </a>
            <a href="mailto:corporate@touchgift.shop" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
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
              className="w-full max-w-lg bg-[#0A0508] border border-white/10 rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold italic">{selectedProduct.name}</h3>
                  <p className="text-white/50 text-sm mt-1">KES {Number(selectedProduct.price).toLocaleString("en-US")} / recipient</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* Team size slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Team Size</span>
                  <span className="font-display text-2xl font-bold text-emerald-400">{teamSize} people</span>
                </div>
                <input
                  type="range" min="10" max="1000" step="10"
                  value={teamSize}
                  onChange={e => setTeamSize(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-2 font-bold uppercase tracking-wider">
                  <span>10</span>
                  <span className={teamSize >= 50 && teamSize < 100 ? "text-emerald-400" : ""}>50+ (5% off)</span>
                  <span className={teamSize >= 100 && teamSize < 500 ? "text-emerald-400" : ""}>100+ (10% off)</span>
                  <span className={teamSize >= 500 ? "text-emerald-400" : ""}>500+ (15% off)</span>
                </div>
              </div>

              {/* Price summary */}
              {(() => {
                const base = selectedProduct.price * teamSize;
                const pct = teamSize >= 500 ? 0.15 : teamSize >= 100 ? 0.10 : teamSize >= 50 ? 0.05 : 0;
                const discount = base * pct;
                const final = base - discount;
                return (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Subtotal</span>
                      <span>KES {base.toLocaleString("en-US")}</span>
                    </div>
                    {pct > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Volume Discount ({pct * 100}%)</span>
                        <span>- KES {discount.toLocaleString("en-US")}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-emerald-400">KES {final.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                );
              })()}

              <Link
                href={`/corporate/checkout?product=${selectedProduct.id}&qty=${teamSize}`}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050304] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_50px_rgba(16,185,129,0.45)]"
              >
                Continue to Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-center text-[11px] text-white/30 mt-3">
                Supports M-Pesa, Bank Wire, and Proforma Invoicing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
