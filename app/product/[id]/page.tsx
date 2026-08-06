import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/product/AddToCartButton";

async function getProduct(id: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 text-center animate-fade-in">
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
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
        {/* Image */}
        <div className="relative aspect-square bg-blush rounded-3xl overflow-hidden shadow-card animate-fade-in-up">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              🎁
            </div>
          )}

          {/* Stock badge */}
          {!product.in_stock && (
            <div className="absolute top-4 left-4 bg-brand-deep/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl font-medium">
              Out of stock
            </div>
          )}

          {/* Personalizable badge */}
          {product.is_personalizable && (
            <div className="absolute top-4 left-4 bg-gold/90 backdrop-blur-sm text-brand-deep text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Customizable
            </div>
          )}
        </div>

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
          {product.description && (
            <div className="bg-surface-secondary rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm mb-2 text-brand-muted uppercase tracking-wider">
                About this gift
              </h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

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
    </div>
  );
}
