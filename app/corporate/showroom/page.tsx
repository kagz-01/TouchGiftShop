"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Eye, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  Gift, ChevronLeft, ChevronRight, Star, Heart,
  Package, ShoppingCart, ArrowRight, Sparkles, Play
} from "lucide-react";

type ShowroomProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  emoji: string;
  rating: number;
  reviews: number;
  features: string[];
  gradient: string;
};

const SHOWROOM_PRODUCTS: ShowroomProduct[] = [
  {
    id: "1",
    name: "Executive Luxe Hamper",
    price: 12500,
    description: "Premium whiskey, artisan chocolates, leather accessories, and a personalized crystal award.",
    category: "Premium",
    emoji: "🎁",
    rating: 4.9,
    reviews: 42,
    features: ["Personalized", "Premium Packaging", "Free Delivery"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "2",
    name: "Welcome Aboard Kit",
    price: 3500,
    description: "Artisan coffee, branded notebook, scented candle, and a handwritten welcome card.",
    category: "Onboarding",
    emoji: "📦",
    rating: 4.8,
    reviews: 89,
    features: ["Custom Branding", "Bulk Available", "Same-Day"],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "3",
    name: "Birthday Joy Box",
    price: 4200,
    description: "Champagne, luxury chocolates, spa vouchers, and a personalized birthday message.",
    category: "Birthday",
    emoji: "🎂",
    rating: 4.7,
    reviews: 156,
    features: ["AI Handwritten Note", "Photo Card", "Express Delivery"],
    gradient: "from-pink-400 to-rose-500",
  },
  {
    id: "4",
    name: "Client Appreciation Set",
    price: 8500,
    description: "Premium wine, gourmet cheese board, artisan crackers, and a thank you card.",
    category: "Client",
    emoji: "🏆",
    rating: 4.9,
    reviews: 67,
    features: ["White-Label", "Custom Message", "Scheduled Delivery"],
    gradient: "from-gold to-amber-500",
  },
  {
    id: "5",
    name: "Team Celebration Pack",
    price: 2800,
    description: "Assorted snacks, branded tote bag, premium notebook, and celebration confetti.",
    category: "Team",
    emoji: "🥳",
    rating: 4.6,
    reviews: 203,
    features: ["Bulk Pricing", "Custom Colors", "Eco-Friendly"],
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "6",
    name: "Farewell Treasure Chest",
    price: 6500,
    description: "Memory book, personalized crystal, premium gift box, and a farewell message.",
    category: "Farewell",
    emoji: "👋",
    rating: 4.8,
    reviews: 34,
    features: ["Engraved", "Photo Album", "Gift Wrapping"],
    gradient: "from-coral to-pink-400",
  },
];

export default function VirtualShowroom() {
  const [selectedProduct, setSelectedProduct] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [viewAngle, setViewAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const rotateRef = useRef<NodeJS.Timeout | null>(null);

  const product = SHOWROOM_PRODUCTS[selectedProduct];

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

  const nextProduct = () => {
    setSelectedProduct(((selectedProduct + 1) % SHOWROOM_PRODUCTS.length) as 0 | 1 | 2 | 3 | 4 | 5);
    setViewAngle(0);
  };

  const prevProduct = () => {
    setSelectedProduct(((selectedProduct - 1 + SHOWROOM_PRODUCTS.length) % SHOWROOM_PRODUCTS.length) as 0 | 1 | 2 | 3 | 4 | 5);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card border border-surface-border shadow-sm overflow-hidden">
              {/* Viewer controls */}
              <div className="flex items-center justify-between p-4 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevProduct}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-theme-muted" />
                  </button>
                  <span className="text-sm font-semibold text-theme-heading">
                    {product.name}
                  </span>
                  <button
                    onClick={nextProduct}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-theme-muted" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewAngle((prev) => (prev - 30 + 360) % 360)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors"
                    title="Rotate left"
                  >
                    <RotateCcw className="w-4 h-4 text-theme-muted" />
                  </button>
                  <button
                    onClick={toggleRotate}
                    className={`p-2 shape-premium-card transition-colors ${isRotating ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
                    title={isRotating ? "Stop rotation" : "Auto-rotate"}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors" title="Fullscreen">
                    <Maximize2 className="w-4 h-4 text-theme-muted" />
                  </button>
                </div>
              </div>

              {/* 3D product view */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
                {/* Rotating product */}
                <div
                  className="relative transition-transform duration-100"
                  style={{ transform: `perspective(800px) rotateY(${viewAngle}deg)` }}
                >
                  <div className={`w-64 h-64 bg-gradient-to-br ${product.gradient} rounded-3xl shadow-2xl flex items-center justify-center`}>
                    <span className="text-8xl">{product.emoji}</span>
                  </div>

                  {/* Floating features */}
                  {product.features.map((feature, i) => (
                    <div
                      key={i}
                      className="absolute bg-white dark:bg-gray-800 shape-premium-button px-3 py-1 text-xs font-semibold text-theme-heading shadow-lg border border-surface-border"
                      style={{
                        top: `${20 + i * 25}%`,
                        right: i % 2 === 0 ? "-80px" : undefined,
                        left: i % 2 !== 0 ? "-80px" : undefined,
                        transform: `rotateY(${-viewAngle}deg)`,
                      }}
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Angle indicator */}
                <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shape-premium-card px-3 py-1.5 text-xs font-mono text-theme-muted">
                  {viewAngle}°
                </div>

                {/* View controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => setViewAngle(0)}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shape-premium-card text-xs text-theme-muted hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setViewAngle(90)}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shape-premium-card text-xs text-theme-muted hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    Side
                  </button>
                  <button
                    onClick={() => setViewAngle(180)}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-premium-card text-xs text-theme-muted hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setViewAngle(270)}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shape-premium-card text-xs text-theme-muted hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    Other
                  </button>
                </div>
              </div>
            </div>

            {/* Product thumbnails */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {SHOWROOM_PRODUCTS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProduct(i as 0 | 1 | 2 | 3 | 4 | 5); setViewAngle(0); }}
                  className={`flex-shrink-0 w-20 h-20 shape-premium-card border-2 transition-all flex items-center justify-center ${
                    selectedProduct === i
                      ? "border-brand shadow-ribbon"
                      : "border-surface-border hover:border-brand/30"
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-semibold shape-premium-button bg-gradient-to-r ${product.gradient} text-white`}>
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-gold">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-semibold">{product.rating}</span>
                  <span className="text-[10px] text-theme-muted">({product.reviews})</span>
                </div>
              </div>

              <h2 className="font-display italic text-xl font-bold text-theme-heading mb-2">{product.name}</h2>
              <p className="text-sm text-theme-muted mb-4">{product.description}</p>

              <div className="text-2xl font-bold text-brand mb-4">KSh {product.price.toLocaleString()}</div>

              <div className="space-y-2 mb-6">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-theme-body">
                    <div className="w-5 h-5 bg-success/10 shape-premium-button flex items-center justify-center">
                      <span className="text-success text-xs">✓</span>
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link
                  href="/corporate/build"
                  className="flex-1 py-3 bg-brand text-white shape-premium-card font-semibold text-sm text-center hover:bg-brand-dark transition-colors"
                >
                  Add to Order
                </Link>
                <button className="p-3 bg-gray-100 dark:bg-white/5 shape-premium-card hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  <Heart className="w-5 h-5 text-theme-muted" />
                </button>
              </div>
            </div>

            {/* Bulk pricing */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Bulk Pricing</h3>
              <div className="space-y-2">
                {[
                  { qty: "1-9", price: product.price },
                  { qty: "10-24", price: Math.round(product.price * 0.9) },
                  { qty: "25-49", price: Math.round(product.price * 0.85) },
                  { qty: "50+", price: Math.round(product.price * 0.8) },
                ].map((tier) => (
                  <div key={tier.qty} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                    <span className="text-xs text-theme-muted">{tier.qty} units</span>
                    <span className="text-sm font-semibold text-theme-heading">KSh {tier.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Share this product</h3>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-emerald-500 text-white shape-premium-button text-xs font-semibold hover:bg-emerald-600 transition-colors">
                  WhatsApp
                </button>
                <button className="flex-1 py-2 bg-blue-500 text-white shape-premium-button text-xs font-semibold hover:bg-blue-600 transition-colors">
                  Email
                </button>
                <button className="flex-1 py-2 bg-gray-100 dark:bg-white/5 text-theme-muted shape-premium-button text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
