"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Package, X, Loader2, Send, CheckCircle, Tag, Palette, ShoppingBag } from "lucide-react";
import { formatKsh } from "@/lib/utils";

interface Product {
  id: string; name: string; slug: string;
  price: number; sale_price: number | null;
  image_url: string | null; in_stock: boolean;
  tags?: string[]; is_personalizable?: boolean;
}

const SHOP_CATEGORIES = [
  { key: "all",              label: "All Items",           emoji: "🗂️" },
  { key: "stationery-office",label: "Stationery & Office", emoji: "✏️" },
  { key: "awards-trophies",  label: "Awards & Trophies",   emoji: "🏆" },
  { key: "gift-sets",        label: "Gift Sets",           emoji: "🎁" },
  { key: "drinkware",        label: "Drinkware",           emoji: "☕" },
  { key: "bags",             label: "Bags & Totes",        emoji: "👜" },
  { key: "accessories",      label: "Accessories",         emoji: "🔑" },
  { key: "tech-gadgets",     label: "Tech & Gadgets",      emoji: "💻" },
  { key: "clocks",           label: "Clocks",              emoji: "🕐" },
] as const;
type ShopCat = typeof SHOP_CATEGORIES[number]["key"];

const BULK_TIERS = [
  { min: 10, max: 49,  label: "10–49", pct: 10 },
  { min: 50, max: 99,  label: "50–99", pct: 15 },
  { min: 100, max: 499,label: "100–499", pct: 20 },
  { min: 500, max: null,label: "500+", pct: 25 },
];

function getMOQ(name: string) {
  const t = name.toLowerCase();
  if (t.match(/award|trophy|plaque/)) return 10;
  if (t.match(/mug|tumbler|bottle|flask/)) return 12;
  if (t.match(/notebook|journal|pen/)) return 20;
  return 25;
}

function QuoteModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [qty, setQty] = useState(50);
  const [company, setCompany] = useState(""); const [email, setEmail] = useState("");
  const [notes, setNotes] = useState(""); const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const moq  = getMOQ(product.name);
  const base = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const tier = BULK_TIERS.find(t => qty >= t.min && (t.max === null || qty <= t.max));
  const unit = tier ? Math.round(base * (1 - tier.pct / 100)) : base;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSending(true);
    try {
      await fetch("/api/corporate/quote-request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, productName: product.name, qty, company, email, notes, unitPrice: unit, total: unit * qty }),
      });
    } catch {}
    setSending(false); setDone(true);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Get Quote · <span className="font-normal text-gray-500 text-sm truncate">{product.name}</span></h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        {done ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <p className="font-bold text-gray-900">Quote Sent!</p>
            <p className="text-sm text-gray-500">We&apos;ll respond within 2 business hours with pricing + proof.</p>
            <button onClick={onClose} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-amber-800 font-semibold">Qty: <strong>{qty} units</strong></span>
                {tier && <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold text-[10px]">{tier.pct}% OFF</span>}
              </div>
              <input type="range" min={moq} max={500} step={moq} value={qty} onChange={e => setQty(Number(e.target.value))} className="w-full accent-amber-500" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unit: <strong className="text-gray-900">{formatKsh(unit)}</strong></span>
                <span className="text-amber-700 font-bold">Total: {formatKsh(unit * qty)}</span>
              </div>
            </div>
            <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Company *" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Logo format, sizes, deadline…" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <button type="submit" disabled={sending} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Sending…" : `Request Quote — ${qty} units`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p, onQuote }: { p: Product; onQuote: (p: Product) => void }) {
  const base = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
  const bulk = Math.round(base * 0.85);
  const moq  = getMOQ(p.name);
  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-amber-300 transition-all">
      <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {p.image_url
          ? <Image src={p.image_url} alt={p.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="absolute inset-0 flex items-center justify-center"><Package className="w-10 h-10 text-gray-300" /></div>
        }
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">MOQ {moq}</div>
        {p.is_personalizable && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white border border-gray-200 text-[10px] font-semibold rounded shadow-sm flex items-center gap-1">
            <Palette className="w-2.5 h-2.5" /> Custom
          </div>
        )}
      </Link>
      <div className="p-3">
        <Link href={`/product/${p.slug}`}>
          <h3 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-amber-700 transition-colors mb-2">{p.name}</h3>
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-gray-900">{formatKsh(base)}</p>
            <p className="text-[10px] text-green-600 font-medium">50+ units: {formatKsh(bulk)}/u</p>
          </div>
          <button onClick={() => onQuote(p)} className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors">
            Get Quote
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopTab() {
  const [cat, setCat]       = useState<ShopCat>("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]   = useState(0); const [hasMore, setHasMore] = useState(false);
  const [page, setPage]     = useState(1); const [loading, setLoading] = useState(true);
  const [quoteP, setQuoteP] = useState<Product | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async (p: number, append: boolean, q?: string, c?: ShopCat) => {
    setLoading(true);
    const params = new URLSearchParams({ category: c ?? cat, page: String(p), limit: "24" });
    if (q ?? search) params.set("q", q ?? search);
    const res = await fetch(`/api/corporate/catalog?${params}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(prev => append ? [...prev, ...data.products] : data.products);
      setTotal(data.total); setHasMore(data.hasMore); setPage(p);
    }
    setLoading(false);
  }, [cat, search]);

  useEffect(() => { load(1, false); }, [load]);

  function onCat(key: ShopCat) { setCat(key); load(1, false, search, key); }
  function onSearch(val: string) {
    setSearch(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(1, false, val), 350);
  }

  return (
    <div className="space-y-5">

      {/* ── Discovery Banner (visible when no filter active) ── */}
      {cat === "all" && !search && !loading && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Left copy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎁</span>
                <h2 className="text-base font-bold text-gray-900">How corporate ordering works</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { num: "1", icon: "🛍️", text: "Browse & pick items below" },
                  { num: "2", icon: "📋", text: "Request a quote — we confirm within 2 hrs" },
                  { num: "3", icon: "🚚", text: "We brand, pack & deliver across Kenya" },
                ].map(s => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{s.num}</div>
                    <span className="text-xs text-gray-600">{s.icon} {s.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right CTA */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="text-xs text-gray-500 text-center">Minimum order: <strong className="text-gray-900">10 units</strong></div>
              <div className="text-xs text-gray-400 text-center">Need help? <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">Chat on WhatsApp</a></div>
            </div>
          </div>
          {/* Quick jump chips */}
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 font-semibold mr-1 self-center">Popular:</span>
            {[
              { emoji: "🏆", label: "Awards & Trophies", key: "awards-trophies" },
              { emoji: "☕", label: "Branded Drinkware", key: "drinkware" },
              { emoji: "🎁", label: "Gift Sets", key: "gift-sets" },
              { emoji: "💻", label: "Tech & Gadgets", key: "tech-gadgets" },
              { emoji: "✏️", label: "Stationery", key: "stationery-office" },
            ].map(c => (
              <button key={c.key} onClick={() => onCat(c.key as typeof cat)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-xs font-semibold text-amber-700 rounded-lg transition-all">
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">

        {SHOP_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => onCat(c.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              cat === c.key
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700"
            }`}>
            <span>{c.emoji}</span><span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Search + count */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          {search && <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <span className="font-bold text-gray-900">{total}</span>}
          <span>items</span>
        </div>
        <Link href="/corporate/catalog" className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-amber-300 hover:text-amber-700 transition-all whitespace-nowrap">
          <ShoppingBag className="w-4 h-4" /> Full Catalog
        </Link>
      </div>

      {/* Grid */}
      {!loading && products.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-white border border-gray-200 rounded-xl">
          <Package className="w-10 h-10 text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different category or clear search.</p>
          <button onClick={() => { onCat("all"); onSearch(""); }} className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {(loading && products.length === 0 ? Array.from({ length: 10 }) : products).map((p, i) => {
            if (!p || !(p as Product).id) return <div key={i} className="bg-white border border-gray-100 rounded-xl animate-pulse aspect-[3/4]" />;
            return <ProductCard key={(p as Product).id} p={p as Product} onQuote={setQuoteP} />;
          })}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <button onClick={() => load(page + 1, true)} disabled={loading}
            className="px-6 py-2.5 bg-white border border-gray-200 hover:border-amber-300 text-sm font-semibold text-gray-700 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Load more
          </button>
        </div>
      )}
      {quoteP && <QuoteModal product={quoteP} onClose={() => setQuoteP(null)} />}
    </div>
  );
}
