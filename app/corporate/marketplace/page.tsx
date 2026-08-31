"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store, Search, Star, MapPin, Truck, Package, ArrowRight,
  Grid, List, RefreshCw, ExternalLink, Shield
} from "lucide-react";
import { formatKsh } from "@/lib/utils";

type Vendor = {
  id: string;
  business_name: string;
  description: string;
  location: string;
  specialty: string;
  rating: number;
  product_count: number;
  delivery_time: string;
  min_order: number;
  free_delivery_threshold: number;
  status: string;
};

type MarketProduct = {
  id: string;
  name: string;
  price: number;
  bulk_price?: number;
  bulk_min?: number;
  category: string;
  image_url: string;
  vendor_id: string;
  vendor_name: string;
  rating: number;
  delivery_time: string;
  free_delivery: boolean;
};

export default function B2B2CMarketplace() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showVendors, setShowVendors] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "price" | "rating" | "newest">("popular");

  useEffect(() => {
    Promise.all([
      fetch("/api/corporate/marketplace/vendors").then(r => r.json()),
      fetch("/api/corporate/marketplace/products").then(r => r.json()),
    ]).then(([v, p]) => {
      setVendors(v.vendors || []);
      setProducts(p.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.vendor_name || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Corporate Gift Marketplace</h1>
              <p className="text-theme-muted text-sm">Discover curated gifts from verified vendors across Kenya.</p>
            </div>
            <button
              onClick={() => setShowVendors(!showVendors)}
              className={`px-4 py-2 shape-premium-card text-sm font-medium transition-all flex items-center gap-2 ${
                showVendors ? "bg-brand text-white" : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
              }`}
            >
              <Store className="w-4 h-4" /> Vendors ({vendors.length})
            </button>
          </div>

          {/* Search & filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search gifts, vendors, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-surface-border shape-premium-card text-sm text-theme-heading placeholder:text-theme-muted/50 focus:outline-none focus:border-brand/30"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 bg-white/80 border border-surface-border shape-premium-card text-sm text-theme-heading"
            >
              <option value="popular">Most Popular</option>
              <option value="price">Price: Low to High</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 shape-premium-button text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-brand text-white"
                    : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        {/* Vendors section */}
        {showVendors && (
          <div className="mb-8">
            <h2 className="text-lg font-display font-bold italic text-theme-heading mb-4">Verified Vendors</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/80 shape-premium-card p-5 border border-surface-border animate-pulse h-40" />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="bg-white/80 shape-premium-card p-8 border border-surface-border text-center">
                <Store className="w-10 h-10 text-brand/30 mx-auto mb-3" />
                <p className="text-theme-muted text-sm">No vendors yet. Vendors can apply to join the marketplace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm hover:shadow-card transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-theme-heading group-hover:text-gold transition-colors">{vendor.business_name}</h3>
                        <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {vendor.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-gold">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-semibold">{vendor.rating?.toFixed(1) || "New"}</span>
                      </div>
                    </div>
                    <p className="text-xs text-theme-muted mb-3 line-clamp-2">{vendor.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-theme-muted">
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {vendor.product_count} products</span>
                      <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {vendor.delivery_time}</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-success" /> Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products */}
        <h2 className="text-lg font-display font-bold italic text-theme-heading mb-4">
          {showVendors ? "All Products" : "Marketplace Products"}
          <span className="text-sm font-normal text-theme-muted ml-2">({filteredProducts.length})</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/80 shape-premium-card border border-surface-border animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/80 shape-premium-card p-12 border border-surface-border text-center">
            <Package className="w-12 h-12 text-brand/20 mx-auto mb-4" />
            <p className="text-theme-heading font-semibold mb-1">No products found</p>
            <p className="text-sm text-theme-muted">Try a different search or category.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white/80 backdrop-blur-sm shape-premium-card border border-surface-border shadow-sm hover:shadow-card transition-all group overflow-hidden">
                <div className="relative aspect-square bg-gray-50 dark:bg-white/5 overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/5">
                      <Package className="w-10 h-10 text-brand/20" />
                    </div>
                  )}
                  {product.free_delivery && (
                    <div className="absolute top-2 left-2 bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Free Delivery
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-theme-muted mb-1">{product.vendor_name}</p>
                  <h3 className="text-sm font-semibold text-theme-heading line-clamp-1 group-hover:text-gold transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 text-gold mt-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-semibold">{product.rating?.toFixed(1) || "New"}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-sm font-bold text-brand">{formatKsh(product.price)}</p>
                      {product.bulk_price && (
                        <p className="text-[10px] text-success">Bulk: {formatKsh(product.bulk_price)} ({product.bulk_min}+)</p>
                      )}
                    </div>
                    <Link href="/corporate/build" className="p-2 bg-brand/10 shape-premium-button hover:bg-brand hover:text-white text-brand transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm flex gap-4 hover:shadow-card transition-all">
                <div className="w-20 h-20 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-50">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/5">
                      <Package className="w-6 h-6 text-brand/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-theme-muted">{product.vendor_name}</p>
                  <h3 className="text-sm font-semibold text-theme-heading">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-theme-muted">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-current" /> {product.rating?.toFixed(1)}</span>
                    <span>{product.category}</span>
                    {product.free_delivery && <span className="flex items-center gap-1 text-success"><Truck className="w-3 h-3" /> Free</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-brand">{formatKsh(product.price)}</p>
                  {product.bulk_price && <p className="text-[10px] text-success">Bulk: {formatKsh(product.bulk_price)}</p>}
                  <Link href="/corporate/build" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-gold transition-colors">
                    Order <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
