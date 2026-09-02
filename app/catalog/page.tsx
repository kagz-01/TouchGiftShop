"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Gift } from "lucide-react";
import { formatKsh } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

interface Bundle {
  id: string;
is_coming_soon?: boolean;
  name: string;
  image_url: string | null;
  regular_price: number;
  bundle_price: number;
  item_count: number;
  hamper_bundle_items?: { product_name: string; quantity: number }[];
}

const PAGE_SIZE = 24;

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch one page of products (append=false replaces, true appends for Load More)
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

  // Reset to page 1 whenever filters change
  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  const loadMore = () => fetchPage(page + 1, true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {}
  }, []);

  const fetchBundles = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog/bundles?featured=true");
      const data = await res.json();
      setBundles(data.bundles ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  // Realtime: refresh instantly when admin changes specs/bundles/imports products
  useEffect(() => {
    if (typeof window === "undefined" || !("WebSocket" in window)) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("catalog-live")
        .on("broadcast", { event: "products-imported" }, () => fetchPage(1, false))
        .on("broadcast", { event: "specs-changed" }, () => fetchPage(1, false))
        .on("broadcast", { event: "bundles-changed" }, () => fetchBundles())
        .subscribe();
    } catch {
      // WebSocket or realtime not available — skip
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch { /* ignore */ }
      }
    };
  }, [fetchPage, fetchBundles]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/shop" className="text-sm text-gray-600 hover:text-brand transition-colors">← Shop</Link>
            <h1 className="font-display text-xl font-bold text-gray-900">Catalog</h1>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, description, SKU…"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>
      </header>

      {/* Featured bundles */}
      {bundles.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-6">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-brand" /> Featured Hampers
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
            {bundles.map((b) => {
              const pct = b.regular_price > b.bundle_price
                ? Math.round(((b.regular_price - b.bundle_price) / b.regular_price) * 100)
                : 0;
              const waText = encodeURIComponent(
                `Hi TouchGift! I'd like to order the *${b.name}* (${formatKsh(b.bundle_price)}${pct > 0 ? `, saving ${pct}%` : ""}).`
              );
              const notifyText = encodeURIComponent(`Hi TouchGift! Please notify me when the *${b.name}* hamper is available.`);
              return (
                <div key={b.id} className="min-w-[260px] w-[260px] snap-start bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="aspect-video bg-gray-100 relative">
                    {b.image_url ? (
                      <Image src={b.image_url} alt={b.name} fill className="object-cover" sizes="260px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Gift className="w-8 h-8 text-gray-300" /></div>
                    )}
                    {b.is_coming_soon && (
                      <span className="absolute inset-0 bg-brand-deep/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-brand-deep text-gold text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Coming Soon</span>
                      </span>
                    )}
                    {!b.is_coming_soon && pct > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">SAVE {pct}%</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{b.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-bold ${b.is_coming_soon ? "text-gray-500" : "text-red-500"}`}>{formatKsh(b.bundle_price)}</span>
                      {!b.is_coming_soon && pct > 0 && <span className="text-xs text-gray-400 line-through">{formatKsh(b.regular_price)}</span>}
                    </div>
                    <a
                      href={`https://wa.me/254142677898?text=${b.is_coming_soon ? notifyText : waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block mt-2 py-2 rounded-xl text-xs font-semibold text-center transition-colors ${
                        b.is_coming_soon
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-brand text-white hover:bg-brand-deep"
                      }`}
                    >
                      {b.is_coming_soon ? "Notify Me When Available" : "Order This Hamper"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Category pills */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
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

      {/* Products grid */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {!loading && products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(loading && products.length === 0 ? Array.from({ length: 10 }) : products).map((product, i) => {
              const p = product as CatalogProduct;
              if (!p?.id) return <div key={`skel-${i}`} className="bg-white rounded-2xl animate-pulse aspect-[3/4]" />;
              const hasSale = p.sale_price && p.sale_price < p.price;
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <Image
                      src={p.image_url || "/placeholder.svg"}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hasSale && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">SALE</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 text-gray-900 group-hover:text-brand transition-colors min-h-[2.5rem]">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      {hasSale ? (
                        <>
                          <span className="text-sm font-bold text-red-500">{formatKsh(p.sale_price!)}</span>
                          <span className="text-[11px] text-gray-400 line-through">{formatKsh(p.price)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-brand">{formatKsh(p.price)}</span>
                      )}
                    </div>

                    {/* Specs row — PDF-style */}
                    {p.product_specs && p.product_specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.product_specs.slice(0, 3).map((spec) => (
                          <span key={spec.spec_key} className="inline-flex items-center gap-0.5 text-[10px] bg-gray-50 border border-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                            {spec.icon && <span>{spec.icon}</span>}
                            {spec.spec_value}
                          </span>
                        ))}
                      </div>
                    )}

                    {p.sku && (
                      <p className="text-[10px] text-gray-300 mt-1.5 font-mono truncate">{p.sku}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center py-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load More Products"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
