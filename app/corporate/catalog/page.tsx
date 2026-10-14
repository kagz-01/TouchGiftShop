"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { MERCH_CATEGORIES, MERCH_TOTAL_SKUS } from "@/lib/corporate-merch";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Building2, ArrowRight, Loader2, Sparkles,
  X, CheckCircle, Send, Palette, Package, ChevronDown,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";
import BackToHome from "@/components/ui/BackToHome";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  tags?: string[];
  category?: string;
  product_specs?: { spec_key: string; spec_value: string; icon: string | null }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 24;

const BULK_TIERS = [
  { min: 10,  max: 49,  label: "10–49 units",  pct: 10 },
  { min: 50,  max: 99,  label: "50–99 units",  pct: 15 },
  { min: 100, max: 499, label: "100–499 units", pct: 20 },
  { min: 500, max: null, label: "500+ units",   pct: 25 },
];

/* Mirrors lib/corporate-merch.ts so the sidebar can't drift from the hero hub.
   The old list used slugs (`workwear`, `caps`, `banners`, `umbrellas`,
   `fabric`, `stationery`) that are absent from the TAXONOMY set in
   lib/category-map.ts. getDbSlugs() returns [] for an unknown slug, which
   callers read as "no filter" — so six of nine categories silently displayed
   the entire shop under a heading like "Banners & Displays". */
const CATEGORIES = [
  { key: "all", label: `All ${MERCH_TOTAL_SKUS} Styles`, emoji: "🗂️", moq: null as number | null },
  ...MERCH_CATEGORIES.map((c) => ({
    key: c.slug,
    label: c.label,
    emoji: c.emoji,
    moq: c.moq as number | null,
  })),
];

function getBrandingMethods(name: string, tags?: string[]): string[] {
  const t = [name, ...(tags ?? [])].join(" ").toLowerCase();
  const methods: string[] = [];
  if (t.match(/polo|cap|hat|overall|jacket|vest|apron|embroid/)) methods.push("🧵 Embroidery");
  if (t.match(/t-shirt|tshirt|bag|tote|hoodie|fleece|blanket|screen/)) methods.push("🖨️ Screen Print");
  if (t.match(/umbrella|mug|bottle|tumbler|thermos|sublim/)) methods.push("🌈 Sublimation");
  if (t.match(/metal|flask|pen|usb|keychain|steel|laser|engrav/)) methods.push("⚡ Laser");
  if (t.match(/notebook|journal|leather|planner|deboss/)) methods.push("🟤 Deboss");
  if (t.match(/banner|roll.up|flag|display|tent|gazebo/)) methods.push("🎯 Full Print");
  if (methods.length === 0) methods.push("🖨️ Screen Print");
  return methods.slice(0, 2);
}

function getMOQ(name: string, tags?: string[], category?: string): number {
  const t = [name, ...(tags ?? []), category ?? ""].join(" ").toLowerCase();
  if (t.match(/banner|roll.up|flag|display|a-frame|lectern|tent|gazebo/)) return 1;
  if (t.match(/jacket|parka|overall|coverall|workwear/)) return 10;
  if (t.match(/umbrella/)) return 10;
  if (t.match(/mug|tumbler|bottle|drinkware/)) return 12;
  if (t.match(/blanket|towel|throw|picnic/)) return 15;
  if (t.match(/notebook|journal|pen|planner/)) return 20;
  return 25;
}

// ─── Quote Modal ──────────────────────────────────────────────────────────────
function QuoteModal({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  const [qty, setQty] = useState(50);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const moq = getMOQ(product.name, product.tags, product.category);
  const basePrice = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const tier = BULK_TIERS.find(t => qty >= t.min && (t.max === null || qty <= t.max));
  const unitPrice = tier ? Math.round(basePrice * (1 - tier.pct / 100)) : basePrice;
  const total = unitPrice * qty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/corporate/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, productName: product.name, qty, company, email, notes, unitPrice, total }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#0D0D14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-bold text-white text-lg">Get a Quote</h2>
            <p className="text-white/50 text-xs mt-0.5 truncate max-w-[280px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Quote Request Sent!</h3>
            <p className="text-white/50 text-sm">We&apos;ll get back to you within 2 business hours.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl hover:bg-emerald-500/20 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Live Price Calculator</span>
                {tier && <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">{tier.pct}% OFF</span>}
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span>Quantity: <span className="font-bold text-white">{qty} units</span></span>
                  <span>MOQ: {moq}</span>
                </div>
                <input type="range" min={moq} max={500} step={moq} value={qty} onChange={e => setQty(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                <div className="text-center">
                  <p className="text-[10px] text-white/40">Unit Price</p>
                  <p className="font-bold text-white text-sm">{formatKsh(unitPrice)}</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-[10px] text-white/40">Total Est.</p>
                  <p className="font-bold text-amber-400 text-sm">{formatKsh(total)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40">You Save</p>
                  <p className="font-bold text-emerald-400 text-sm">{formatKsh((basePrice - unitPrice) * qty)}</p>
                </div>
              </div>
            </div>

            <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name *"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-all" />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-all" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Special requirements (colours, sizes, delivery date, logo format…)"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-all resize-none" />

            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Response in 2 hrs · Invoice / LPO accepted · Free digital proof
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Sending…" : `Request Quote — ${qty} Units`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onQuote }: { product: CatalogProduct; onQuote: (p: CatalogProduct) => void }) {
  const basePrice = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const bulkPrice = Math.round(basePrice * 0.85);
  const moq = getMOQ(product.name, product.tags, product.category);
  const methods = getBrandingMethods(product.name, product.tags);

  return (
    <div className="group flex flex-col bg-white/[0.03] rounded-2xl border border-white/8 overflow-hidden hover:border-amber-500/30 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.12)]">
      <Link href={`/product/${product.slug}`} className="relative aspect-square bg-white/5 overflow-hidden block">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">🎁</div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-bold px-2 py-1 bg-black/70 backdrop-blur-sm text-amber-400 rounded-lg border border-amber-500/20">
            MOQ: {moq}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pb-3 px-3">
          <span className="w-full text-center text-[10px] font-bold py-2 bg-amber-500/90 text-black rounded-xl flex items-center justify-center gap-1.5">
            <Palette className="w-3 h-3" /> Preview in Studio
          </span>
        </div>
      </Link>

      <div className="p-3.5 flex flex-col flex-grow gap-2.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs font-semibold text-white/90 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1">
          {methods.map(m => (
            <span key={m} className="text-[9px] font-medium px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/40 rounded-md whitespace-nowrap">
              {m}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-white/8 mt-auto">
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">1 unit</p>
            <p className="text-xs font-bold text-white/60">{formatKsh(basePrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-amber-400 uppercase tracking-wider">50+ units</p>
            <p className="text-sm font-bold text-amber-400">{formatKsh(bulkPrice)}</p>
          </div>
        </div>

        <button onClick={() => onQuote(product)}
          className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
          <Package className="w-3.5 h-3.5" /> Get Quote
        </button>
      </div>
    </div>
  );
}

// ─── Inner (needs useSearchParams) ───────────────────────────────────────────
function CatalogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "all");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quoteProduct, setQuoteProduct] = useState<CatalogProduct | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchPage = useCallback(async (pageNum: number, append: boolean, overrideSearch?: string, overrideCat?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    const cat = overrideCat ?? selectedCategory;
    const q = overrideSearch ?? search;
    if (cat && cat !== "all") params.set("category", cat);
    if (q) params.set("search", q);
    params.set("page", String(pageNum));
    params.set("limit", String(PAGE_SIZE));
    try {
      const res = await fetch(`/api/catalog?${params}`);
      const data = await res.json();
      setHasMore(data.hasMore ?? false);
      setPage(pageNum);
      setProducts(prev => append ? [...prev, ...(data.products ?? [])] : (data.products ?? []));
    } catch {
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchPage(1, false, val), 400);
  }

  function handleCategorySelect(key: string) {
    setSelectedCategory(key);
    const url = key !== "all" ? `/corporate/catalog?category=${key}${search ? `&search=${encodeURIComponent(search)}` : ""}` : "/corporate/catalog";
    router.replace(url, { scroll: false });
    fetchPage(1, false, search, key);
  }

  const activeCat = CATEGORIES.find(c => c.key === selectedCategory) ?? CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#050610] text-white font-sans">

      {/* Header */}
      <header className="relative pt-6 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.07)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="mb-6"><BackToHome className="text-white/40 hover:text-white" /></div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Corporate Branding Catalog</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                Brand <span className="italic font-light bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">anything</span>
                <br className="hidden md:block" /> with your logo.
              </h1>
              <p className="text-white/50 mt-3 text-sm max-w-lg leading-relaxed">
                170+ brandable items. Preview your logo live before ordering. Bulk pricing from 10 units. Invoice &amp; LPO accepted.
              </p>
            </div>
            <div className="flex-shrink-0 bg-white/[0.03] border border-white/10 rounded-2xl p-5 min-w-[280px]">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400" /> Volume Discounts
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {BULK_TIERS.map(t => (
                  <div key={t.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-amber-400 font-bold text-base leading-none">{t.pct}% OFF</p>
                    <p className="text-white/40 text-[10px] mt-1">{t.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/corporate/build" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                Start Bulk Order <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-8 flex gap-8">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 gap-1 sticky top-8 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Categories</p>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => handleCategorySelect(cat.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                selectedCategory === cat.key
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-base w-5 text-center">{cat.emoji}</span>
              <span className="flex-1 truncate text-xs">{cat.label}</span>
              {cat.moq && <span className="text-[9px] text-white/20 font-bold shrink-0">MOQ {cat.moq}</span>}
            </button>
          ))}
          <div className="mt-5 bg-gradient-to-br from-amber-950/60 to-amber-900/30 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-400 mb-2">🎨 Live Studio</p>
            <p className="text-[11px] text-white/50 mb-3 leading-relaxed">Preview your logo on any product in real time.</p>
            <Link href="/corporate/build" className="block w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/20 text-amber-400 text-[11px] font-bold rounded-xl text-center transition-colors">
              Open Studio →
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="lg:hidden relative">
              <select value={selectedCategory} onChange={e => handleCategorySelect(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50">
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
                placeholder={`Search in ${activeCat.label}…`}
                className="w-full pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-all" />
              {search && (
                <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30 px-4 py-3 bg-white/5 border border-white/10 rounded-xl whitespace-nowrap">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="font-bold text-white">{products.length}</span>}
              <span>items</span>
            </div>
          </div>

          {selectedCategory !== "all" && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center gap-1.5">
                {activeCat.emoji} {activeCat.label}
                <button onClick={() => handleCategorySelect("all")}><X className="w-3 h-3 ml-1" /></button>
              </span>
              {activeCat.moq && <span className="text-[11px] text-white/40">Minimum order: {activeCat.moq} units</span>}
            </div>
          )}

          {/* Grid */}
          {!loading && products.length === 0 ? (
            <div className="flex flex-col items-center py-20 bg-white/[0.02] border border-white/8 rounded-2xl">
              <span className="text-5xl mb-4">🔍</span>
              <p className="font-bold text-white text-xl mb-2">No products found</p>
              <p className="text-white/40 text-sm mb-6">Try a different category or search term.</p>
              <button onClick={() => { handleCategorySelect("all"); handleSearchChange(""); }}
                className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {(loading && products.length === 0 ? Array.from({ length: 12 }) : products).map((product, i) => {
                if (!product || !(product as CatalogProduct).id) {
                  return <div key={`sk-${i}`} className="bg-white/5 rounded-2xl animate-pulse aspect-[3/4] border border-white/5" />;
                }
                return <ProductCard key={(product as CatalogProduct).id} product={product as CatalogProduct} onQuote={setQuoteProduct} />;
              })}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-10">
              <button onClick={() => fetchPage(page + 1, true)} disabled={loading}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl flex items-center gap-2 mx-auto transition-all disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Load More Products
              </button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-14 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 border border-amber-500/20 rounded-2xl p-7 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-white text-xl mb-2">Can&apos;t find what you need?</h3>
              <p className="text-white/50 text-sm">We source and brand custom items on request. Tell us what you need.</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/corporate/build" className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl flex items-center gap-2 transition-all">
                <Palette className="w-4 h-4" /> Custom Request
              </Link>
              <a href="https://wa.me/254700000000?text=Hi!%20I%20need%20branded%20merchandise."
                target="_blank" rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold text-sm rounded-xl flex items-center gap-2 transition-all">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {quoteProduct && <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />}
    </div>
  );
}

export default function CorporateCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050610] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <CatalogInner />
    </Suspense>
  );
}
