"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw, Gift, ChevronLeft, ChevronRight,
  Star, ShoppingBag, Play, RefreshCw, Eye, MessageSquare,
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";
import CorporateHeader from "@/components/corporate/dashboard/CorporateHeader";

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
    fetch("/api/products?limit=16")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setLoading(false);
      })
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
    return () => {
      if (rotateRef.current) clearInterval(rotateRef.current);
    };
  }, []);

  const nextProduct = () => {
    if (products.length === 0) return;
    setSelectedIdx((selectedIdx + 1) % products.length);
    setViewAngle(0);
  };

  const prevProduct = () => {
    if (products.length === 0) return;
    setSelectedIdx((selectedIdx - 1 + products.length) % products.length);
    setViewAngle(0);
  };

  const whatsAppProofUrl = product
    ? `https://wa.me/254183172111?text=${encodeURIComponent(
        `Hi TouchGift! I'm in the Corporate Showroom reviewing "${product.name}". Could your design team generate a free digital proof with our corporate logo?`
      )}`
    : "https://wa.me/254183172111";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1620] text-gray-900 dark:text-zinc-100 font-sans pb-36">
      <CorporateHeader activeTabLabel="Showroom" />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand/5 via-amber-500/5 to-transparent border-b border-gray-200 dark:border-white/10 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-brand text-white font-bold text-[10px] uppercase tracking-wider">
                Digital Proof Studio
              </span>
              <h1 className="font-display font-bold text-base text-gray-900 dark:text-white">
                360° Corporate Showroom
              </h1>
            </div>
            <p className="text-gray-600 dark:text-zinc-400 mt-0.5">
              Inspect build quality, materials, and request instant digital logo proofs before placing bulk orders.
            </p>
          </div>

          <Link
            href="/corporate/build"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-deep text-white font-bold text-xs shadow-sm transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Build Custom Hamper Pack
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-850 rounded-3xl border border-gray-200 dark:border-zinc-700 aspect-square animate-pulse flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-brand animate-spin" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-850 rounded-3xl border border-gray-200 dark:border-zinc-700 h-64 animate-pulse" />
              <div className="bg-white dark:bg-zinc-850 rounded-3xl border border-gray-200 dark:border-zinc-700 h-32 animate-pulse" />
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#121B26] rounded-3xl border border-gray-200 dark:border-white/10 p-8">
            <Gift className="w-12 h-12 text-brand mx-auto mb-4" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">No products found</h3>
            <p className="text-gray-500 text-sm mt-1">Visit our corporate catalog to explore 500+ brandables.</p>
            <Link
              href="/corporate/catalog"
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-sm"
            >
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 360 Interactive Viewer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#121B26] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                {/* Viewer Navigation Toolbar */}
                <div className="flex items-center justify-between p-3.5 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevProduct}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-200 transition-colors"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                      {product.name}
                    </span>
                    <button
                      type="button"
                      onClick={nextProduct}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-200 transition-colors"
                      aria-label="Next product"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewAngle((prev) => (prev - 30 + 360) % 360)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-200 transition-colors"
                      title="Rotate counter-clockwise"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={toggleRotate}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isRotating
                          ? "bg-brand text-white shadow-sm"
                          : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <Play className={`w-3.5 h-3.5 ${isRotating ? "animate-pulse" : ""}`} />
                      <span>{isRotating ? "Pause 360°" : "Auto-Rotate"}</span>
                    </button>
                  </div>
                </div>

                {/* 360 Product Canvas */}
                <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 flex items-center justify-center overflow-hidden p-6 select-none">
                  <div
                    className="relative transition-transform duration-100 ease-out flex items-center justify-center"
                    style={{ transform: `perspective(800px) rotateY(${viewAngle}deg)` }}
                  >
                    {product.image_url ? (
                      <div className="w-56 h-56 sm:w-72 sm:h-72 relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          priority
                          className="object-cover"
                          sizes="(max-width: 640px) 224px, 288px"
                        />
                      </div>
                    ) : (
                      <div className="w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-br from-brand to-brand-light rounded-3xl shadow-2xl flex items-center justify-center text-white">
                        <Gift className="w-20 h-20" />
                      </div>
                    )}
                  </div>

                  {/* Angle Display Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-mono text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/10 shadow-xs">
                    Angle: {viewAngle}°
                  </div>

                  {/* Preset Rotation Angles */}
                  <div className="absolute bottom-4 right-4 flex gap-1.5">
                    {[
                      { angle: 0, label: "Front" },
                      { angle: 90, label: "Side" },
                      { angle: 180, label: "Back" },
                    ].map((p) => (
                      <button
                        key={p.angle}
                        type="button"
                        onClick={() => setViewAngle(p.angle)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          viewAngle === p.angle
                            ? "bg-brand text-white shadow-xs"
                            : "bg-white/90 dark:bg-zinc-800/90 text-gray-700 dark:text-zinc-300 hover:bg-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Gallery Rail */}
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                {products.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedIdx(i);
                      setViewAngle(0);
                    }}
                    className={`shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all overflow-hidden relative ${
                      selectedIdx === i
                        ? "border-brand shadow-md scale-105"
                        : "border-gray-200 dark:border-white/10 hover:border-brand/40 bg-white dark:bg-zinc-800"
                    }`}
                  >
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand">
                        <Gift className="w-6 h-6" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Specifications & Proof Conversion Card */}
            {product && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#121B26] rounded-3xl border border-gray-200 dark:border-white/10 p-5 shadow-sm space-y-4">
                  <div>
                    {product.category && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-light">
                        {product.category}
                      </span>
                    )}
                    <h2 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mt-1 leading-snug">
                      {product.name}
                    </h2>
                    <p className="text-2xl font-display font-bold text-brand dark:text-brand-light mt-2">
                      {formatKsh(product.sale_price || product.price)}
                    </p>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed border-t border-gray-100 dark:border-white/10 pt-3">
                      {product.description}
                    </p>
                  )}

                  {/* Highlights */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-white/10 pt-3 text-xs text-gray-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Laser Engraving & Screen Print Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>MOQ: 10 units for corporate wholesale rates</span>
                    </div>
                  </div>

                  {/* Primary B2B Conversion Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={whatsAppProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Free Digital Proof on WhatsApp
                    </a>

                    <Link
                      href={`/product/${product.slug}`}
                      className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Product & Buy Sample
                    </Link>
                  </div>
                </div>

                {/* Wholesale Volume Price Tiers */}
                <div className="bg-white dark:bg-[#121B26] rounded-3xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
                    Bulk Volume Tier Pricing
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      { qty: "10–24 units", rate: 0.9, label: "10% off" },
                      { qty: "25–49 units", rate: 0.85, label: "15% off" },
                      { qty: "50+ units", rate: 0.8, label: "20% wholesale off" },
                    ].map((tier) => (
                      <div
                        key={tier.qty}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0 text-xs"
                      >
                        <span className="text-gray-600 dark:text-zinc-300">{tier.qty}</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatKsh(Math.round(product.price * tier.rate))}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1.5 font-semibold">
                            ({tier.label})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
