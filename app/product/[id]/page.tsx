import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductAIHelper from "@/components/product/ProductAIHelper";
import WishlistButton from "@/components/product/WishlistButton";
import ProductReviews from "@/components/reviews/ProductReviews";

import ProductGallery from "@/components/product/ProductGallery";

// Helper to structure the description text
function StructuredDescription({ text }: { text: string }) {
  // If no text, return null
  if (!text) return null;

  // Extremely basic heuristic: if it contains "Features:", split it there.
  // Otherwise, if it's very long, split by periods.
  let mainText = text;
  let features: string[] = [];

  if (text.includes("Features:")) {
    const parts = text.split("Features:");
    mainText = parts[0].trim();
    // Split the features by periods, clean them up, filter empty ones
    features = parts[1]
      .split(/(?:\. | - )/)
      .map(f => f.replace(/&amp;/g, '&').trim())
      .filter(f => f.length > 3);
  } else if (text.length > 200) {
    const sentences = text.split(". ");
    mainText = sentences.slice(0, 2).join(". ") + ".";
    features = sentences.slice(2).map(s => s.trim()).filter(s => s.length > 3);
  }

  return (
    <div className="bg-surface-secondary rounded-2xl p-5">
      <h3 className="font-display font-semibold text-sm mb-3 text-brand-muted uppercase tracking-wider">
        About this gift
      </h3>
      <p className="text-sm text-brand-muted leading-relaxed mb-4">
        {mainText}
      </p>
      
      {features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-brand-muted">
              <span className="text-brand mt-0.5">•</span>
              <span className="leading-relaxed">{feature.endsWith('.') ? feature : feature + '.'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function getProduct(id: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const res = await fetch(`${base}/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { product } = await res.json();
  return product;
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="w-full mx-auto px-4 md:px-8 py-16 text-center animate-fade-in">
        <span className="text-6xl mb-4 block">🔍</span>
        <p className="font-display text-xl font-semibold mb-2">Product not found</p>
        <p className="text-brand-muted mb-6">This gift doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="btn-brand inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery */}
        {(() => {
          // Auto-detect personalizable from name/description keywords
          const PERSONALIZE_KEYWORDS = [
            "custom", "personali", "engrav", "monogram", "bespoke",
            "print", "logo", "name on", "your text", "your photo",
            "your message", "inscri", "embroid",
          ];
          const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
          const autoPersonalizable = product.is_personalizable ||
            PERSONALIZE_KEYWORDS.some((kw) => haystack.includes(kw));
          return (
            <ProductGallery 
              productName={product.name}
              image_url={product.image_url}
              images={product.images}
              in_stock={product.in_stock}
              is_personalizable={autoPersonalizable}
            />
          );
        })()}

        {/* Details */}
        <div className="space-y-6 animate-fade-in-up animate-delay-200">
          {/* Title & Price */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-gold">{formatKsh(product.price)}</p>
          </div>

          {/* Description */}
          {product.description && <StructuredDescription text={product.description} />}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blush rounded-xl p-3 text-center">
              <span className="text-xl mb-1 block">⚡</span>
              <p className="text-xs font-medium text-brand">Same-day</p>
            </div>
            <div className="bg-blush rounded-xl p-3 text-center">
              <span className="text-xl mb-1 block">📸</span>
              <p className="text-xs font-medium text-brand">Photo proof</p>
            </div>
            <div className="bg-blush rounded-xl p-3 text-center">
              <span className="text-xl mb-1 block">🤫</span>
              <p className="text-xs font-medium text-brand">Anonymous</p>
            </div>
          </div>

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Add to Wishlist */}
          <WishlistButton productId={product.id} />

          {/* AI Helper */}
          <ProductAIHelper productName={product.name} productId={product.id} />

          {/* Guarantees */}
          <div className="bg-gradient-dark text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gold">✓</span>
              <p className="text-sm">On-time delivery or it&apos;s free</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold">✓</span>
              <p className="text-sm">Photo proof before dispatch</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold">✓</span>
              <p className="text-sm">Your identity stays private</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <ProductReviews productId={product.id} />
    </div>
  );
}
