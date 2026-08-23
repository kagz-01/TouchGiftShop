"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store, Search, Filter, Star, MapPin, Truck, Shield,
  Package, Heart, ArrowRight, Grid, List, SlidersHorizontal,
  Award, Clock, Check, Phone, Globe, TrendingUp
} from "lucide-react";

type Vendor = {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  products: number;
  verified: boolean;
  specialty: string;
  deliveryTime: string;
  minOrder: string;
  emoji: string;
  gradient: string;
};

type MarketplaceProduct = {
  id: string;
  name: string;
  price: number;
  vendor: string;
  vendorId: string;
  category: string;
  rating: number;
  reviews: number;
  emoji: string;
  gradient: string;
  bulkPrice?: number;
  bulkMin?: number;
  verified: boolean;
  freeDelivery: boolean;
};

const VENDORS: Vendor[] = [
  {
    id: "1",
    name: "Nairobi Artisan Co.",
    description: "Handcrafted chocolates, coffee, and gourmet food gifts from local artisans.",
    location: "Westlands, Nairobi",
    rating: 4.9,
    reviews: 234,
    products: 45,
    verified: true,
    specialty: "Artisan Food & Drink",
    deliveryTime: "1-2 days",
    minOrder: "KSh 2,000",
    emoji: "🍫",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "2",
    name: "GiftBox Kenya",
    description: "Premium gift boxes, hampers, and corporate packaging solutions.",
    location: "Karen, Nairobi",
    rating: 4.8,
    reviews: 189,
    products: 62,
    verified: true,
    specialty: "Gift Boxes & Hampers",
    deliveryTime: "Same day",
    minOrder: "KSh 1,500",
    emoji: "📦",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "3",
    name: "GreenGift Eco",
    description: "Sustainable, eco-friendly corporate gifts and packaging.",
    location: "Lavington, Nairobi",
    rating: 4.7,
    reviews: 156,
    products: 38,
    verified: true,
    specialty: "Eco-Friendly Gifts",
    deliveryTime: "2-3 days",
    minOrder: "KSh 3,000",
    emoji: "🌿",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "4",
    name: "Swahili Luxury",
    description: "Premium Kenyan crafts, leather goods, and cultural artifacts.",
    location: "Nyali, Mombasa",
    rating: 4.9,
    reviews: 98,
    products: 28,
    verified: true,
    specialty: "Luxury & Cultural",
    deliveryTime: "3-5 days",
    minOrder: "KSh 5,000",
    emoji: "🏛️",
    gradient: "from-brand to-brand-deep",
  },
  {
    id: "5",
    name: "TechGift Africa",
    description: "Corporate tech accessories, gadgets, and branded merchandise.",
    location: "Kilimani, Nairobi",
    rating: 4.6,
    reviews: 124,
    products: 52,
    verified: true,
    specialty: "Tech & Merchandise",
    deliveryTime: "1-2 days",
    minOrder: "KSh 1,000",
    emoji: "📱",
    gradient: "from-blue-500 to-indigo-500",
  },
];

const PRODUCTS: MarketplaceProduct[] = [
  { id: "1", name: "Artisan Chocolate Box", price: 1200, vendor: "Nairobi Artisan Co.", vendorId: "1", category: "Food", rating: 4.9, reviews: 89, emoji: "🍫", gradient: "from-amber-400 to-orange-400", bulkPrice: 950, bulkMin: 20, verified: true, freeDelivery: true },
  { id: "2", name: "Premium Gift Hamper", price: 5500, vendor: "GiftBox Kenya", vendorId: "2", category: "Hampers", rating: 4.8, reviews: 124, emoji: "🎁", gradient: "from-violet-400 to-purple-400", bulkPrice: 4200, bulkMin: 10, verified: true, freeDelivery: true },
  { id: "3", name: "Bamboo Desk Set", price: 2800, vendor: "GreenGift Eco", vendorId: "3", category: "Office", rating: 4.7, reviews: 67, emoji: "🎋", gradient: "from-emerald-400 to-teal-400", verified: true, freeDelivery: false },
  { id: "4", name: "Leather Card Holder", price: 1800, vendor: "Swahili Luxury", vendorId: "4", category: "Accessories", rating: 4.9, reviews: 45, emoji: "👛", gradient: "from-brand to-brand-deep", verified: true, freeDelivery: false },
  { id: "5", name: "Wireless Charger Pad", price: 1500, vendor: "TechGift Africa", vendorId: "5", category: "Tech", rating: 4.6, reviews: 78, emoji: "🔋", gradient: "from-blue-400 to-indigo-400", bulkPrice: 1100, bulkMin: 50, verified: true, freeDelivery: true },
  { id: "6", name: "Scented Soy Candle", price: 850, vendor: "Nairobi Artisan Co.", vendorId: "1", category: "Lifestyle", rating: 4.8, reviews: 156, emoji: "🕯️", gradient: "from-amber-400 to-yellow-400", verified: true, freeDelivery: false },
  { id: "7", name: "Branded Tote Bag", price: 650, vendor: "GiftBox Kenya", vendorId: "2", category: "Merchandise", rating: 4.7, reviews: 203, emoji: "👜", gradient: "from-pink-400 to-rose-400", bulkPrice: 450, bulkMin: 100, verified: true, freeDelivery: true },
  { id: "8", name: "Recycled Notebook Set", price: 450, vendor: "GreenGift Eco", vendorId: "3", category: "Stationery", rating: 4.6, reviews: 98, emoji: "📓", gradient: "from-emerald-400 to-green-400", bulkPrice: 350, bulkMin: 50, verified: true, freeDelivery: false },
];

const CATEGORIES = ["All", "Food", "Hampers", "Office", "Accessories", "Tech", "Lifestyle", "Merchandise", "Stationery"];

export default function B2B2CMarketplace() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showVendors, setShowVendors] = useState(false);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
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
            <div className="flex gap-2">
              <button
                onClick={() => setShowVendors(!showVendors)}
                className={`px-4 py-2 shape-premium-card text-sm font-medium transition-all flex items-center gap-2 ${
                  showVendors
                    ? "bg-brand text-white"
                    : "bg-white/80 border border-surface-border text-theme-muted hover:border-brand/30"
                }`}
              >
                <Store className="w-4 h-4" /> Vendors
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search gifts, vendors, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/50 border border-surface-border shape-premium-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("grid")}
                className={`p-2.5 shape-premium-card transition-all ${view === "grid" ? "bg-brand text-white" : "bg-white/80 border border-surface-border text-theme-muted"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2.5 shape-premium-card transition-all ${view === "list" ? "bg-brand text-white" : "bg-white/80 border border-surface-border text-theme-muted"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 shape-premium-button text-sm font-medium whitespace-nowrap transition-all ${
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
            <h2 className="font-display italic text-lg font-bold text-theme-heading mb-4">Featured Vendors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VENDORS.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${vendor.gradient} shape-premium-card flex items-center justify-center text-2xl`}>
                      {vendor.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-theme-heading truncate">{vendor.name}</h3>
                        {vendor.verified && <Shield className="w-3 h-3 text-success flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-theme-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {vendor.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-theme-body mb-3 line-clamp-2">{vendor.description}</p>

                  <div className="flex items-center gap-4 text-xs text-theme-muted mb-3">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold" /> {vendor.rating} ({vendor.reviews})</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {vendor.products} items</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {vendor.deliveryTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-theme-muted">Min order: {vendor.minOrder}</span>
                    <button className="px-3 py-1.5 bg-brand/10 text-brand shape-premium-button text-xs font-semibold hover:bg-brand/20 transition-colors">
                      View Products
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display italic text-lg font-bold text-theme-heading">
            {showVendors ? "All Products" : "Browse Gifts"}
          </h2>
          <span className="text-sm text-theme-muted">{filteredProducts.length} products</span>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm hover:shadow-card-hover transition-all group"
              >
                <div className={`aspect-square bg-gradient-to-br ${product.gradient} shape-premium-card flex items-center justify-center text-5xl mb-3 group-hover:scale-105 transition-transform`}>
                  {product.emoji}
                </div>

                <div className="flex items-center gap-1 mb-1">
                  {product.verified && <Shield className="w-3 h-3 text-success" />}
                  <span className="text-[10px] text-theme-muted">{product.vendor}</span>
                </div>

                <h3 className="text-sm font-bold text-theme-heading mb-1 line-clamp-1">{product.name}</h3>

                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-gold fill-current" />
                  <span className="text-xs font-semibold text-theme-heading">{product.rating}</span>
                  <span className="text-[10px] text-theme-muted">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand">KSh {product.price.toLocaleString()}</p>
                    {product.bulkPrice && (
                      <p className="text-[10px] text-success">Bulk: KSh {product.bulkPrice.toLocaleString()} ({product.bulkMin}+)</p>
                    )}
                  </div>
                  {product.freeDelivery && (
                    <span className="px-1.5 py-0.5 bg-success/10 text-success text-[9px] font-semibold shape-premium-button flex items-center gap-0.5">
                      <Truck className="w-2.5 h-2.5" /> Free
                    </span>
                  )}
                </div>

                <button className="w-full mt-3 py-2 bg-brand/10 text-brand shape-premium-button text-xs font-semibold hover:bg-brand hover:text-white transition-all">
                  Add to Hamper
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm flex items-center gap-4 hover:shadow-card-hover transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${product.gradient} shape-premium-card flex items-center justify-center text-2xl flex-shrink-0`}>
                  {product.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {product.verified && <Shield className="w-3 h-3 text-success" />}
                    <span className="text-xs text-theme-muted">{product.vendor}</span>
                    <span className="text-[10px] text-theme-muted">·</span>
                    <span className="text-[10px] text-theme-muted">{product.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-theme-heading">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-gold fill-current" /><span className="text-xs">{product.rating}</span></span>
                    {product.freeDelivery && <span className="text-[10px] text-success flex items-center gap-0.5"><Truck className="w-2.5 h-2.5" /> Free delivery</span>}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-brand">KSh {product.price.toLocaleString()}</p>
                  {product.bulkPrice && (
                    <p className="text-[10px] text-success">Bulk: KSh {product.bulkPrice.toLocaleString()}</p>
                  )}
                  <button className="mt-2 px-4 py-1.5 bg-brand text-white shape-premium-button text-xs font-semibold hover:bg-brand-dark transition-colors">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
