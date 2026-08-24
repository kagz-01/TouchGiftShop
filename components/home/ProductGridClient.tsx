"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { X, Minus, Plus, Sparkles, Check } from "lucide-react";

export default function ProductGridClient({
  initialProducts,
  initialHasMore,
  totalCount,
  category,
  budget,
  heading,
}: {
  initialProducts: any[];
  initialHasMore: boolean;
  totalCount: number;
  category?: string;
  budget?: string;
  heading?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    // Simplified - just reload initial products
    setProducts(initialProducts);
    setHasMore(false);
  }, [initialProducts]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wider mb-4">
        {heading || "Products"}
      </h3>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, idx) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group block rounded-xl border border-gray-300 p-4 hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-md mb-3">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                  />
                ) : (
                  <div className="w-full h-24 flex items-center justify-center text-gray-300">
                    🎁
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm line-clamp-2">{product.name}</h4>
                <p className="text-gray-500 text-xs">{formatKsh(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}