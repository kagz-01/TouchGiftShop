"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Building2, ArrowRight, Gift, Loader2 } from "lucide-react";
import { formatKsh } from "@/lib/utils";

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
  { qty: "10 – 49 units", discount: "10% off" },
  { qty: "50 – 99 units", discount: "15% off" },
  { qty: "100+ units", discount: "20% off" },
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-brand-dark via-brand to-brand-light text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
            <Building2 className="w-4 h-4" /> Corporate
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Corporate Gift Catalog</h1>
          <p className="text-white/70 text-sm max-w-xl mb-6">
            Bulk gifting with volume discounts, branded packaging and per-recipient notes. Same-day Nairobi delivery.
          </p>

          {/* Bulk tiers */}
          <div className="flex flex-wrap gap-3">
            {BULK_TIERS.map((t) => (
              <div key={t.qty} className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/10">
                <p className="text-sm font-bold">{t.discount}</p>
                <p className="text-[11px] text-white/60">{t.qty}</p>
              </div>
            ))}
            <Link
              href="/corporate/build"
              className="flex items-center gap-2 bg-gold text-brand-deep px-5 py-2.5 rounded-2xl text-sm font-bold hover:-translate-y-0.5 transition-transform"
            >
              Start Bulk Order <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Templates strip */}
      {templates.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-8">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-brand" /> Ready-Made Templates
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
            {templates.map((t) => (
              <Link
                key={t.id}
                href="/corporate/build"
                className="min-w-[240px] w-[240px] snap-start bg-white rounded-2xl border border-gray-200 p-4 hover:border-brand hover:shadow-md transition-all"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-full inline-block mb-2">
                  {t.category.replace(/-/g, " ")}
                </p>
                <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1 min-h-[2rem]">{t.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="font-bold text-brand-deep">
                    {t.price_range_min != null ? `${formatKsh(t.price_range_min)}+` : "Custom"}
                    <span className="text-gray-400 font-normal"> /person</span>
                  </span>
                  <span className="text-gray-400">{t.item_count} items</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search + categories */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the catalog…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              !selectedCategory ? "bg-brand text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat.slug ? "bg-brand text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {!loading && products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-gray-500 font-medium">Nothing matches</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(loading && products.length === 0 ? Array.from({ length: 10 }) : products).map((product, i) => {
              const p = product as CatalogProduct;
              if (!p?.id) return <div key={`skel-${i}`} className="bg-white rounded-2xl animate-pulse aspect-[3/4]" />;
              const hasSale = p.sale_price && p.sale_price < p.price;
              const bulkPrice = Math.round((hasSale ? p.sale_price! : p.price) * 0.9);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="aspect-square bg-gray-100 relative">
                      <Image
                        src={p.image_url || "/placeholder.svg"}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="font-medium text-sm leading-snug line-clamp-2 text-gray-900 min-h-[2.5rem] hover:text-brand transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="mt-1.5">
                      <p className="text-sm font-bold text-brand-deep">{formatKsh(hasSale ? p.sale_price! : p.price)}</p>
                      <p className="text-[11px] text-green-600 font-medium">10+ units: {formatKsh(bulkPrice)}</p>
                    </div>
                    {p.product_specs && p.product_specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.product_specs.slice(0, 2).map((spec) => (
                          <span key={spec.spec_key} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                            {spec.icon} {spec.spec_value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="text-center py-8">
            <button
              onClick={() => fetchPage(page + 1, true)}
              disabled={loading}
              className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Load More
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
