"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Building2, Loader2, X, CheckCircle, Send,
  ChevronDown, ChevronRight, Package, Star, Tag,
  Palette, ArrowLeft, Filter, SlidersHorizontal,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";
import CorporateHeader from "@/components/corporate/dashboard/CorporateHeader";


// ─── Types ────────────────────────────────────────────────────────────────────
export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  tags?: string[];
  sku?: string;
  is_personalizable?: boolean;
}

// ─── Corporate category definitions ──────────────────────────────────────────
const CATEGORIES = [
  {
    key: "all",
    label: "All Corporate",
    emoji: "🏢",
    slug: "all",
    moq: null,
    desc: "All brandable corporate gifts",
  },
  {
    key: "apparel",
    label: "Polos & Apparel",
    emoji: "👕",
    slug: "apparel",
    moq: 20,
    desc: "Premium corporate polos, tees & jackets",
  },
  {
    key: "stationery-office",
    label: "Stationery & Office",
    emoji: "✏️",
    slug: "stationery-office",
    moq: 20,
    desc: "Notebooks, pens, desk sets",
  },
  {
    key: "drinkware",
    label: "Drinkware",
    emoji: "☕",
    slug: "drinkware",
    moq: 12,
    desc: "Mugs, tumblers, flasks",
  },
  {
    key: "gift-sets",
    label: "Gift Sets & Hampers",
    emoji: "🎁",
    slug: "gift-sets",
    moq: 10,
    desc: "Curated sets for onboarding & milestones",
  },
  {
    key: "bags",
    label: "Bags & Totes",
    emoji: "👜",
    slug: "bags",
    moq: 25,
    desc: "Laptop bags, conference totes",
  },
  {
    key: "tech-gadgets",
    label: "Tech & Gadgets",
    emoji: "💻",
    slug: "tech-gadgets",
    moq: 10,
    desc: "USB drives, wireless chargers, earphones",
  },
  {
    key: "awards-trophies",
    label: "Awards & Trophies",
    emoji: "🏆",
    slug: "awards-trophies",
    moq: 10,
    desc: "Crystal awards, plaques, recognition gifts",
  },
  {
    key: "accessories",
    label: "Accessories",
    emoji: "🔑",
    slug: "accessories",
    moq: 25,
    desc: "Keyrings, lanyards, desk accessories",
  },
  {
    key: "clocks",
    label: "Clocks & Timepieces",
    emoji: "🕐",
    slug: "clocks",
    moq: 5,
    desc: "Desk clocks, executive timepieces",
  },
] as const;

type CategoryKey = typeof CATEGORIES[number]["key"];

const BULK_TIERS = [
  { min: 10,  max: 49,  label: "10–49 units",  pct: 10 },
  { min: 50,  max: 99,  label: "50–99 units",  pct: 15 },
  { min: 100, max: 499, label: "100–499 units", pct: 20 },
  { min: 500, max: null,label: "500+ units",    pct: 25 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMOQ(name: string): number {
  const t = name.toLowerCase();
  if (t.match(/clock|watch|timepiece/))    return 5;
  if (t.match(/award|trophy|plaque|crystal/)) return 10;
  if (t.match(/mug|tumbler|bottle|flask/)) return 12;
  if (t.match(/notebook|journal|planner/)) return 20;
  return 25;
}

function getBrandingMethods(name: string): string[] {
  const t = name.toLowerCase();
  const m: string[] = [];
  if (t.match(/polo|cap|hat|jacket|vest|apron|embroid/)) m.push("Embroidery");
  if (t.match(/bag|tote|hoodie|fleece|screen/))          m.push("Screen Print");
  if (t.match(/mug|bottle|tumbler|thermos|sublim/))      m.push("Sublimation");
  if (t.match(/metal|flask|pen|usb|key|steel|laser|engrav/)) m.push("Laser Engraving");
  if (t.match(/notebook|journal|leather|planner/))       m.push("Debossing");
  if (m.length === 0) m.push("Screen Print");
  return m.slice(0, 2);
}

const PAGE_SIZE = 24;

// ─── Quote Modal ──────────────────────────────────────────────────────────────
function QuoteModal({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  const [qty, setQty]         = useState(50);
  const [company, setCompany] = useState("");
  const [email, setEmail]     = useState("");
  const [notes, setNotes]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const moq      = getMOQ(product.name);
  const base     = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const tier     = BULK_TIERS.find(t => qty >= t.min && (t.max === null || qty <= t.max));
  const unit     = tier ? Math.round(base * (1 - tier.pct / 100)) : base;
  const total    = unit * qty;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/corporate/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, productName: product.name, qty, company, email, notes, unitPrice: unit, total }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  }

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request Corporate Quote"
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Get a Corporate Quote</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 truncate max-w-xs">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-300 transition-all shrink-0"
            aria-label="Close quote modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Quote Request Sent!</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">
              We&apos;ll get back to you within 2 business hours with official pricing, digital proof, and LPO confirmation.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-4 flex-1 pb-10">
            {/* Price calculator */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Live Price Calculator</span>
                {tier && <span className="text-xs font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">{tier.pct}% OFF</span>}
              </div>
              <div>
                <div className="flex justify-between text-xs text-amber-700 dark:text-amber-300 mb-2 font-medium">
                  <span>Quantity: <strong>{qty} units</strong></span>
                  <span>MOQ: {moq} units</span>
                </div>
                <input
                  type="range"
                  min={moq}
                  max={500}
                  step={moq}
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-amber-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200 dark:border-amber-900/40">
                {[
                  { label: "Unit Price",  val: formatKsh(unit), color: "text-gray-900 dark:text-white" },
                  { label: "Total Est.",  val: formatKsh(total), color: "text-amber-700 dark:text-amber-400 font-bold" },
                  { label: "You Save",    val: formatKsh((base - unit) * qty), color: "text-green-700 dark:text-green-400" },
                ].map(c => (
                  <div key={c.label} className="text-center">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">{c.label}</p>
                    <p className={`text-sm font-semibold ${c.color}`}>{c.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3 pt-1">
              <input
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Company / Organization name *"
                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Work email address *"
                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Branding details (logo engraving, colors, desired delivery date…)"
                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 py-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                Response within 2 hrs · Official LPO accepted · Digital proofs included
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 min-h-[48px]"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Submitting Request…" : `Request Official Quote — ${qty} Units`}
              </button>
            </form>

            {/* Instant Buy / Direct Gift Alternative */}
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 text-center">
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-xs font-semibold text-brand dark:text-brand-light hover:underline inline-flex items-center gap-1.5 p-2"
              >
                <span>Want to order a sample or buy directly?</span>
                <span className="font-bold underline">Order Now →</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
import CorporateProductCard from "@/components/corporate/catalog/CorporateProductCard";
// ─── Main catalog inner ───────────────────────────────────────────────────────
function CatalogInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const initCat = (searchParams.get("category") ?? "all") as CategoryKey;
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initCat);
  const [search, setSearch]       = useState(searchParams.get("q") ?? "");
  const [products, setProducts]   = useState<CatalogProduct[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [quoteProduct, setQuoteProduct] = useState<CatalogProduct | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const activeCat = CATEGORIES.find(c => c.key === selectedCategory) ?? CATEGORIES[0];

  const fetchPage = useCallback(async (
    pageNum: number, append: boolean,
    overrideSearch?: string, overrideCat?: string
  ) => {
    setLoading(true);
    const cat    = overrideCat ?? selectedCategory;
    const q      = overrideSearch ?? search;
    const params = new URLSearchParams({
      category: cat,
      page: String(pageNum),
      limit: String(PAGE_SIZE),
    });
    if (q) params.set("q", q);

    try {
      const res = await fetch(`/api/corporate/catalog?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setProducts(prev => append ? [...prev, ...data.products] : data.products);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch {}
    setLoading(false);
  }, [selectedCategory, search]);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  function handleCategory(key: CategoryKey) {
    setSelectedCategory(key);
    router.replace(`/corporate/catalog?category=${key}`, { scroll: false });
    fetchPage(1, false, search, key);
  }

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchPage(1, false, val), 400);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1620] text-gray-900 dark:text-zinc-100 pb-36">
      {/* ── Top bar matching main platform ── */}
      <CorporateHeader activeTabLabel="Catalog" />

      {/* ── Body ── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex gap-6">

        {/* Sidebar */}
        <aside className="hidden xl:flex flex-col w-56 shrink-0 gap-1 sticky top-[148px] self-start max-h-[calc(100vh-160px)] overflow-y-auto">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 mb-2">Categories</p>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => handleCategory(cat.key)}
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                selectedCategory === cat.key
                  ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200"
                  : "text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <span className="text-base w-5 text-center shrink-0 mt-0.5">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-tight">{cat.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 leading-tight">{cat.desc}</p>
                {cat.moq && <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">MOQ {cat.moq} units</p>}
              </div>
            </button>
          ))}

          {/* Live studio promo — the whole card is the link so there is no
              dead card body that looks clickable but goes nowhere. */}
          <Link
            href="/corporate/build"
            className="block mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 hover:border-amber-300/80 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">🎁 Pack Configurator</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-400/90 mb-0 leading-relaxed">
                  Bulk hampers with instant proforma quotes.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
          </Link>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Category Horizontal Rail (xl:hidden) */}
          <div className="xl:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] ${
                  selectedCategory === cat.key
                    ? "bg-brand text-white shadow-sm"
                    : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-brand/40"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search + count bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                placeholder={`Search in ${activeCat.label}…`}
                className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px]" />
              {search && (
                <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-600 dark:text-zinc-300 whitespace-nowrap min-h-[44px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <span className="font-bold text-gray-900 dark:text-white">{total}</span>}
              <span>products</span>
            </div>
          </div>

          {/* Active category badge */}
          {selectedCategory !== "all" && (
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                {activeCat.emoji} {activeCat.label}
                <button onClick={() => handleCategory("all")} className="ml-1 hover:text-amber-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
              {activeCat.moq && (
                <span className="text-sm text-gray-500">Minimum order: {activeCat.moq} units</span>
              )}
            </div>
          )}

          {/* Product grid */}
          {!loading && products.length === 0 ? (
            <div className="flex flex-col items-center py-20 bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl">
              <Package className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
              <p className="font-bold text-gray-700 dark:text-zinc-200 text-lg mb-1">No products found</p>
              <p className="text-gray-400 dark:text-zinc-400 text-sm mb-5">Try a different category or search term.</p>
              <button onClick={() => { handleCategory("all"); handleSearch(""); }}
                className="px-5 py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-semibold rounded-lg transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {(loading && products.length === 0
            ? Array.from({ length: 12 })
            : products
          ).map((product, i) => {
            if (!product || !(product as CatalogProduct).id) {
              return <div key={`sk-${i}`} className="bg-white dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 rounded-xl animate-pulse aspect-[3/4]" />;
            }
            return <CorporateProductCard key={(product as CatalogProduct).id} product={product as CatalogProduct} onQuote={setQuoteProduct} />;
          })}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-10">
              <button onClick={() => fetchPage(page + 1, true)} disabled={loading}
                className="px-8 py-3 bg-white border border-gray-200 hover:border-amber-300 hover:text-amber-700 text-gray-700 text-sm font-semibold rounded-lg flex items-center gap-2 mx-auto transition-all disabled:opacity-50 hover:shadow-sm">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Load More Products
              </button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-14 bg-white border border-gray-200 rounded-xl p-7 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-xl mb-2">Can&apos;t find what you need?</h3>
              <p className="text-gray-500 text-sm">We source and brand custom items on request. Tell us what you need and we&apos;ll handle everything.</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/corporate/build"
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg flex items-center gap-2 transition-colors">
                <Palette className="w-4 h-4" /> Custom Request
              </Link>
              <a href="https://wa.me/254183172111?text=Hi!%20I%20need%20branded%20merchandise."
                target="_blank" rel="noopener noreferrer"
                className="px-5 py-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold text-sm rounded-lg flex items-center gap-2 transition-colors">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <CatalogInner />
    </Suspense>
  );
}
