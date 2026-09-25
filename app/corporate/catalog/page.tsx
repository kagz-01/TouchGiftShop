"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Building2, ArrowRight, Gift, Loader2, Sparkles, Filter, ChevronRight } from "lucide-react";
import { formatKsh } from "@/lib/utils";
import BackToHome from "@/components/ui/BackToHome";
import { useMood } from "@/context/MoodContext";

interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  sku: string | null;
  in_stock: boolean;
  product_specs?: { spec_key: string; spec_value: string; icon: string | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CorpTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_range_min: number | null;
  price_range_max: number | null;
  item_count: number;
}

const BULK_TIERS = [
  { qty: "10–49 units", discount: "10% OFF" },
  { qty: "50–99 units", discount: "15% OFF" },
  { qty: "100+ units", discount: "20% OFF" },
];

const PAGE_SIZE = 24;

export default function CorporateCatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<CorpTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const { moodMeta } = useMood();

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);
    params.set("page", String(pageNum));
    params.set("limit", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/catalog?${params}`);
      const data = await res.json();
      setHasMore(data.hasMore ?? false);
      setPage(pageNum);
      setProducts((prev) => {
        const next = data.products ?? [];
        return append ? [...prev, ...next] : next;
      });
    } catch {
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  useEffect(() => {
    (async () => {
      try {
        const [catsRes, tplRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/corporate/templates"),
        ]);
        const cats = await catsRes.json();
        const tpls = await tplRes.json();
        setCategories(cats.categories ?? []);
        setTemplates((tpls.templates ?? []).slice(0, 6));
      } catch {}
    })();
  }, []);

  return (
    <div className="min-h-screen bg-brand-deep text-white font-sans selection:bg-gold/30">
      {/* Premium Header / Hero */}
      <header 
        className="dark relative pt-8 pb-16 overflow-hidden transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at top, var(--mood-glow, rgba(212,175,55,0.25)) 0%, #1A1A2E 60%, #14080D 100%)`
        }}
      >
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-30" 
            style={{ background: "var(--mood-gradient, linear-gradient(135deg, rgba(212,175,55,0.4), rgba(180,60,100,0.3)))" }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" 
            style={{ background: "var(--mood-glow, rgba(212,175,55,0.25))" }}
          />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="mb-8">
            <BackToHome className="text-white/50 hover:text-white" />
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/10 pb-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-6">
                <Building2 className="w-3.5 h-3.5" />
                <span>Corporate Collection</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 text-white">
                Elevated Gifting,
                <br />
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent italic">
                  Scaled for Business.
                </span>
              </h1>
              <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
                Discover our premium curation of corporate gifts. Enjoy volume discounts, bespoke branding, and frictionless multi-address delivery.
              </p>
            </div>

            {/* Bulk Discounts Card */}
            <div className="w-full lg:w-auto flex-shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" /> Volume Benefits
              </p>
              <div className="flex flex-wrap lg:flex-nowrap gap-3 mb-5">
                {BULK_TIERS.map((t) => (
                  <div key={t.qty} className="bg-white/5 rounded-2xl px-4 py-3 border border-white/5 hover:border-gold/30 transition-colors">
                    <p className="text-gold font-display text-lg font-bold italic leading-none mb-1">{t.discount}</p>
                    <p className="text-xs text-white/60 font-medium">{t.qty}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/corporate/build"
                className="group flex items-center justify-between w-full bg-gradient-to-r from-gold to-gold-light text-brand-deep px-5 py-3.5 rounded-2xl text-sm font-bold hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all"
              >
                <span>Start a Bulk Order</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Templates Strip (if any) */}
      {templates.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" /> Pre-curated Hampers
            </h2>
            <Link href="/corporate/build" className="text-xs font-bold text-gold hover:text-gold-light uppercase tracking-wider flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {templates.map((t) => (
              <Link
                key={t.id}
                href="/corporate/build"
                className="group min-w-[280px] w-[280px] snap-start bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 hover:bg-white/10 hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep bg-gold px-2.5 py-1 rounded-full">
                    {t.category.replace(/-/g, " ")}
                  </p>
                  <span className="text-xs font-medium text-white/40">{t.item_count} items</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-1 group-hover:text-gold transition-colors">{t.name}</h3>
                <p className="text-sm text-white/50 line-clamp-2 min-h-[2.5rem] mb-4">{t.description}</p>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Est. per person</p>
                    <p className="font-bold text-white">
                      {t.price_range_min != null ? `${formatKsh(t.price_range_min)}+` : "Custom"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-brand-deep transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 pb-24 pt-8">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-4 z-40 bg-brand-deep/80 backdrop-blur-xl p-4 -mx-4 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar flex-1">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <Filter className="w-4 h-4 text-white/40" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Filter</span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                !selectedCategory 
                  ? "bg-gold text-brand-deep shadow-[0_0_15px_rgba(212,168,83,0.3)]" 
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.slug 
                    ? "bg-gold text-brand-deep shadow-[0_0_15px_rgba(212,168,83,0.3)]" 
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {!loading && products.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
            <span className="text-5xl block mb-4 opacity-50">🔍</span>
            <p className="text-white/80 font-display text-2xl font-bold mb-2">No products found</p>
            <p className="text-white/50">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {(loading && products.length === 0 ? Array.from({ length: 15 }) : products).map((product, i) => {
              const p = product as CatalogProduct;
              if (!p?.id) return <div key={`skel-${i}`} className="bg-white/5 rounded-3xl animate-pulse aspect-[3/4] border border-white/5" />;
              
              const hasSale = p.sale_price && p.sale_price < p.price;
              const currentPrice = hasSale ? p.sale_price! : p.price;
              const bulkPrice = Math.round(currentPrice * 0.9);

              return (
                <div key={p.id} className="group flex flex-col bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden hover:border-gold/40 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(212,168,83,0.15)]">
                  <Link href={`/product/${p.slug}`} className="block relative aspect-square overflow-hidden bg-[#0A0E17]">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/10">
                        <Gift className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20">
                        View Details
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/product/${p.slug}`} className="flex-grow">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-white/90 group-hover:text-gold transition-colors mb-4 min-h-[2.5rem]">
                        {p.name}
                      </h3>
                    </Link>
                    
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Single Unit</p>
                          <p className="text-sm font-bold text-white">{formatKsh(currentPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gold uppercase tracking-wider mb-0.5">Bulk (10+)</p>
                          <p className="text-sm font-bold text-gold">{formatKsh(bulkPrice)}</p>
                        </div>
                      </div>
                      
                      {p.product_specs && p.product_specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                          {p.product_specs.slice(0, 2).map((spec) => (
                            <span key={spec.spec_key} className="text-[9px] font-medium uppercase tracking-wider bg-white/5 border border-white/10 text-white/60 rounded-full px-2 py-1 flex items-center gap-1">
                              {spec.icon && <span>{spec.icon}</span>}
                              {spec.spec_value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={() => fetchPage(page + 1, true)}
              disabled={loading}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 text-white rounded-full text-sm font-bold border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all disabled:opacity-50 overflow-hidden"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span className="relative z-10">Load More Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
