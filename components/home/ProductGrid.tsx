import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

async function getProducts(category?: string): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = category
    ? `${base}/api/products?category=${encodeURIComponent(category)}`
    : `${base}/api/products`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const { products } = await res.json();
  return products ?? [];
}

export default async function ProductGrid({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const products = await getProducts(params?.category);

  if (products.length === 0) {
    return (
      <p className="text-sm text-brand-muted text-center py-8">
        No products found. Try a different category.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.id}`}
          className="rounded-lg border border-gray-200 p-3 hover:border-gray-400 transition-colors"
        >
          <div className="aspect-square bg-gray-100 rounded-md mb-2 overflow-hidden relative">
            {p.image_url && (
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            )}
          </div>
          <p className="text-sm font-medium truncate">{p.name}</p>
          <p className="text-xs text-brand-muted">{formatKsh(p.price)}</p>
        </Link>
      ))}
    </div>
  );
}
