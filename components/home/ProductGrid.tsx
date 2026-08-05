import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

async function getProducts(): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) return [];
  const { products } = await res.json();
  return products ?? [];
}

export default async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <p className="text-sm text-brand-muted">
        No products yet — products are syncing from WooCommerce...
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.id}`}
          className="rounded-lg border border-gray-200 p-3"
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
