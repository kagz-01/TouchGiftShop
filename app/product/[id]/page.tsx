import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductAIHelper from "@/components/product/ProductAIHelper";
import WishlistButton from "@/components/product/WishlistButton";
import ProductReviews from "@/components/reviews/ProductReviews";
import ProductGallery from "@/components/product/ProductGallery";
import { ArrowLeft, Zap, Camera, EyeOff, CheckCircle, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

async function getProduct(id: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const res = await fetch(`${base}/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { product } = await res.json();
  return product;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: "Product Not Found | TouchGift" };
  return {
    title: `${product.name} | TouchGift`,
    description: product.description?.slice(0, 155) ?? `Send ${product.name} as a gift. Same-day delivery in Nairobi.`,
  };
}

function StructuredDescription({ text }: { text: string }) {
  if (!text) return null;

  let mainText = text;
  let features: string[] = [];

  if (text.includes("Features:")) {
    const parts = text.split("Features:");
    mainText = parts[0].trim();
    features = parts[1]
      .split(/(?:\. | - )/)
      .map((f) => f.replace(/&amp;/g, "&").trim())
      .filter((f) => f.length > 3);
  } else if (text.length > 200) {
    const sentences = text.split(". ");
    mainText = sentences.slice(0, 2).join(". ") + ".";
    features = sentences
      .slice(2)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-muted leading-relaxed">{mainText}</p>
      {features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-brand-muted">
              <CheckCircle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {feature.endsWith(".") ? feature : feature + "."}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="min-h-screen section-theme-a flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔍</span>
          <p className="font-display text-xl font-semibold mb-2">Product not found</p>
          <p className="text-brand-muted mb-6">This gift doesn&apos;t exist or has been removed.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const PERSONALIZE_KEYWORDS = [
    "custom", "personali", "engrav", "monogram", "bespoke",
    "print", "logo", "name on", "your text", "your photo",
    "your message", "inscri", "embroid",
  ];
  const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
  const autoPersonalizable =
    product.is_personalizable || PERSONALIZE_KEYWORDS.some((kw) => haystack.includes(kw));

  return (
    <div className="min-h-screen section-theme-a">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="page-container-capped py-3 flex items-center gap-3">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Shop</span>
          </Link>
          <span className="text-black/15 hidden sm:inline">/</span>
          <span className="text-sm text-brand-deep font-medium truncate max-w-[200px] hidden sm:inline">
            {product.name}
          </span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="page-container-capped py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16 items-start">

          {/* ── Gallery ── */}
          <ProductGallery
            productName={product.name}
            image_url={product.image_url}
            images={product.images}
            in_stock={product.in_stock}
            is_personalizable={autoPersonalizable}
          />

          {/* ── Details panel ── */}
          <div className="space-y-5 lg:sticky lg:top-20">

            {/* Title & price */}
            <div>
              {product.category && (
                <p className="text-[11px] font-semibold text-brand/70 uppercase tracking-wider mb-2">
                  {product.category.replace(/-/g, " ")}
                </p>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-deep leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gold">{formatKsh(product.price)}</span>
                {!product.in_stock && (
                  <span className="text-sm text-red-500 font-semibold">Out of stock</span>
                )}
              </div>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Zap className="w-3.5 h-3.5 text-gold-dark" />, label: "Same-day delivery" },
                { icon: <Camera className="w-3.5 h-3.5 text-brand" />, label: "Photo proof" },
                { icon: <EyeOff className="w-3.5 h-3.5 text-brand-muted" />, label: "Anonymous option" },
              ].map((pill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/8 rounded-full text-[11px] font-semibold text-brand-muted shadow-sm"
                >
                  {pill.icon}
                  {pill.label}
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl border border-black/6 p-5">
                <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-3">
                  About this gift
                </p>
                <StructuredDescription text={product.description} />
              </div>
            )}

            {/* Add to cart button */}
            <AddToCartButton product={product} />

            {/* Add to wishlist */}
            <WishlistButton productId={product.id} />

            {/* AI Helper */}
            <ProductAIHelper productName={product.name} productId={product.id} />

            {/* Gift Lab upsell */}
            <div className="bg-white border border-black/6 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-deep">Want to add more items?</p>
                <p className="text-xs text-brand-muted">Build a custom hamper with this + other gifts.</p>
              </div>
              <Link
                href="/gift-lab/build-hamper"
                className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-brand bg-brand/8 rounded-xl hover:bg-brand/15 transition-colors"
              >
                Build →
              </Link>
            </div>

            {/* Guarantees strip */}
            <div className="bg-gradient-to-br from-brand-dark to-brand rounded-2xl p-5 space-y-3">
              {[
                "On-time delivery or it's free",
                "Photo proof before dispatch",
                "Your identity stays private",
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  <p className="text-sm text-white/85">{g}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-16">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}
