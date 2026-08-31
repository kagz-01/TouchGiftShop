"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw, Maximize2, Gift, ChevronLeft, ChevronRight,
  Star, Heart, ShoppingCart, Play, RefreshCw, Eye
} from "lucide-react";
import { formatKsh } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  image_url: string;
  description?: string;
  rating?: number;
  review_count?: number;
  product_specs?: { spec_key: string; spec_value: string; icon?: string }[];
  category?: string;
  in_stock: boolean;
};

export default function VirtualShowroom() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewAngle, setViewAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const rotateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/products?limit=12")
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const product = products[selectedIdx];

  const toggleRotate = () => {
    if (isRotating) {
      if (rotateRef.current) clearInterval(rotateRef.current);
      setIsRotating(false);
    } else {
      setIsRotating(true);
      rotateRef.current = setInterval(() => {
        setViewAngle((prev) => (prev + 2) % 360);
      }, 50);
    }
  };

  useEffect(() => {
    return () => { if (rotateRef.current) clearInterval(rotateRef.current); };
  }, []);

  const nextProduct = () => {
    setSelectedIdx((selectedIdx + 1) % products.length);
    setViewAngle(0);
  };

  const prevProduct = () => {
    setSelectedIdx((selectedIdx - 1 + products.length) % products.length);
    setViewAngle(0);
  };

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Virtual Showroom</h1>
              <p className="text-theme-muted text-sm">Explore our corporate gift collection in an interactive 3D experience.</p>
            </div>
            <Link
              href="/corporate/build"
              className="px-5 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Build Your Order
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white/80 shape-premium-card border border-surface-border aspect-square animate-pulse flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-brand animate-spin" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/80 shape-premium-card h-64 animate-pulse" />
              <div className="bg-white/80 shape-premium-card h-32 animate-pulse" />
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-12 h-12 text-brand/30 mx-auto mb-4" />
            <p className="text-theme-muted">No products available yet.</p>
            <Link href="/corporate/catalog" className="text-brand text-sm font-semibold mt-2 inline-block hover:underline">
              Browse Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Viewer */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card border border-surface-border shadow-sm overflow-hidden">
                {/* Viewer controls */}
                <div className="flex items-center justify-between p-4 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <button onClick={prevProduct} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors">
                      <ChevronLeft className="w-5 h-5 text-theme-muted" />
                    </button>
                    <span className="text-sm font-semibold text-theme-heading">{product.name}</span>
                    <button onClick={nextProduct} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors">
                      <ChevronRight className="w-5 h-5 text-theme-muted" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewAngle((prev) => (prev - 30 + 360) % 360)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors" title="Rotate left">
                      <RotateCcw className="w-4 h-4 text-theme-muted" />
                    </button>
                    <button onClick={toggleRotate} className={`p-2 shape-premium-card transition-colors ${isRotating ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-white/5"}`} title={isRotating ? "Stop" : "Auto-rotate"}>
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3D product view */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
                  <div className="relative transition-transform duration-100" style={{ transform: `perspective(800px) rotateY(${viewAngle}deg)` }}>
                    {product.image_url ? (
                      <div className="w-64 h-64 relative rounded-3xl overflow-hidden shadow-2xl">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="256px" />
                      </div>
                    ) : (
                      <div className="w-64 h-64 bg-gradient-to-br from-brand to-brand-light rounded-3xl shadow-2xl flex items-center justify-center">
                        <Gift className="w-20 h-20 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shape-premium-card px-3 py-1.5 text-xs font-mono text-theme-muted">
                    {viewAngle}°
                  </div>

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {[0, 90, 180, 270].map((angle) => (
                      <button key={angle} onClick={() => setViewAngle(angle)} className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shape-premium-card text-xs text-theme-muted hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        {angle === 0 ? "Front" : angle === 90 ? "Side" : angle === 180 ? "Back" : "Other"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product thumbnails */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {products.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedIdx(i); setViewAngle(0); }}
                    className={`flex-shrink-0 w-20 h-20 shape-premium-card border-2 transition-all overflow-hidden ${
                      selectedIdx === i ? "border-brand shadow-ribbon" : "border-surface-border hover:border-brand/30"
                    }`}
                  >
                    {p.image_url ? (
                      <div className="relative w-full h-full">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="80px" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-brand/10 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-brand" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Product details */}
            {product && (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {product.category && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold shape-premium-button bg-brand/10 text-brand">
                        {product.category}
                      </span>
                    )}
                    {product.rating && (
                      <div className="flex items-center gap-1 text-gold">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-semibold">{product.rating}</span>
                        {product.review_count && <span className="text-[10px] text-theme-muted">({product.review_count})</span>}
                      </div>
                    )}
                  </div>

                  <h2 className="font-display italic text-xl font-bold text-theme-heading mb-2">{product.name}</h2>
                  {product.description && <p className="text-sm text-theme-muted mb-4">{product.description}</p>}

                  <div className="text-2xl font-bold text-brand mb-4">
                    {formatKsh(product.sale_price || product.price)}
                    {product.sale_price && product.sale_price < product.price && (
                      <span className="text-sm text-theme-muted line-through ml-2">{formatKsh(product.price)}</span>
                    )}
                  </div>

                  {product.product_specs && product.product_specs.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {product.product_specs.slice(0, 5).map((spec) => (
                        <div key={spec.spec_key} className="flex items-center gap-2 text-sm text-theme-body">
                          <div className="w-5 h-5 bg-success/10 shape-premium-button flex items-center justify-center">
                            <span className="text-success text-xs">{spec.icon || "✓"}</span>
                          </div>
                          <span className="text-xs text-theme-muted">{spec.spec_key}:</span>
                          <span className="text-xs font-medium">{spec.spec_value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex-1 py-3 bg-brand text-white shape-premium-card font-semibold text-sm text-center hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View Product
                    </Link>
                    <Link href="/corporate/build" className="p-3 bg-gold/10 shape-premium-card hover:bg-gold/20 transition-colors">
                      <ShoppingCart className="w-5 h-5 text-gold" />
                    </Link>
                  </div>
                </div>

                {/* Bulk pricing */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                  <h3 className="text-sm font-semibold text-theme-heading mb-3">Bulk Pricing</h3>
                  <div className="space-y-2">
                    {[
                      { qty: "1-9", multiplier: 1 },
                      { qty: "10-24", multiplier: 0.9 },
                      { qty: "25-49", multiplier: 0.85 },
                      { qty: "50+", multiplier: 0.8 },
                    ].map((tier) => (
                      <div key={tier.qty} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                        <span className="text-xs text-theme-muted">{tier.qty} units</span>
                        <span className="text-sm font-semibold text-theme-heading">{formatKsh(Math.round(product.price * tier.multiplier))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share */}
                <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                  <h3 className="text-sm font-semibold text-theme-heading mb-3">Share this product</h3>
                  <div className="flex gap-2">
                    <a href={`https://wa.me/?text=Check out ${product.name} on TouchGift - ${formatKsh(product.price)}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-emerald-500 text-white shape-premium-button text-xs font-semibold hover:bg-emerald-600 transition-colors text-center">
                      WhatsApp
                    </a>
                    <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/product/${product.slug}`)} className="flex-1 py-2 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
