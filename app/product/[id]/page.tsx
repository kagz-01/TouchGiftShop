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
      <div className="px-4 md:px-8 py-6 text-center">
        <p className="text-brand-muted">Product not found.</p>
        <Link href="/" className="text-sm underline mt-2 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-6">
      <Link href="/" className="text-sm text-brand-muted underline">
        &larr; Back to shop
      </Link>

      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold">{product.name}</h1>
        <p className="text-lg font-medium text-brand">{formatKsh(product.price)}</p>
      </div>

      {product.description && (
        <p className="text-sm text-brand-muted leading-relaxed">
          {product.description}
        </p>
      )}

      {!product.in_stock && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          This item is currently out of stock.
        </p>
      )}

      <AddToCartButton product={product} />
    </div>
  );
}
