"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { formatKsh } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  sku: string | null;
  in_stock: boolean;
  status: string;
  product_specs?: { spec_key: string; spec_value: string; icon: string | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialBudget = searchParams.get("budget");

  useEffect(() => {
    setSelectedCategory(initialCategory || null);
    setBudget(initialBudget || null);
  }, [initialCategory, initialBudget]);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (budget) params.set("budget", budget);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "24");

    try {
      const res = await fetch(`/api/catalog?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setHasMore(data.hasMore ?? false);
      setPage(page + 1);
    } catch {
      setProducts([]);
    }
  }, [selectedCategory, budget, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setSearch(target.value);
    setPage(1);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setSearch("");
    setPage(1);
  };

  const handleBudgetChange = (budget: string | null) => {
    setBudget(budget);
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/shop" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors">
              <span className="w-4 h-4">←</span> Back to Shop
            </Link>
            <h1 className="font-display text-xl font-bold text-gray-900">Catalog</h1>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search products, names, SKUs..."
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="No products found"
              width={300}
              height={200}
              className="mx-auto mb-4"
            />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
<div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-108"
                  />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-brand transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1.5">
                      {product.sale_price && product.sale_price < product.price ? (
                        <>
                          <span className="text-red-500 font-bold text-xs">{formatKsh(product.sale_price)}</span>
                          <span className="text-gray-400 text-xs line-through">{formatKsh(product.price)}</span>
                        </>
                      ) : (
                        <span className="text-brand font-bold text-xs">{formatKsh(product.price)}</span>
                      )}
                    </div>
                    {product.product_specs && product.product_specs.length > 0 && (
                      <div className="flex items-center gap-2 text-xs mt-1">
                        {product.product_specs.map((spec) => (
                          <span key={spec.spec_key} className="bg-gray-50 text-gray-600 rounded-full px-2 py-0.5 mr-1">
                            {spec.icon ? <span className="text-[10px] mr-0.5">{spec.icon}</span> : ""}
                            {spec.spec_value}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.sku && (
                      <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                    )}
                    {!product.in_stock && (
                      <p className="text-xs text-red-500 mt-1">Out of stock</p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}