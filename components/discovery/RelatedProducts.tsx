import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

type RelatedProductsProps = {
  categorySlugs: string[];
  currentProductId: string;
  limit?: number;
};

async function getRelatedProducts(categorySlugs: string[], currentProductId: string, limit = 6) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get category IDs from slugs
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .in("slug", categorySlugs);

  if (!categories || categories.length === 0) return [];

  const categoryIds = categories.map((c) => c.id);

  // Get product IDs in those categories
  const { data: productCats } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", categoryIds);

  if (!productCats || productCats.length === 0) return [];

  // Get unique product IDs, excluding current product
  const productIds = [...new Set(productCats.map((pc) => pc.product_id))]
    .filter((id) => id !== currentProductId)
    .slice(0, limit);

  if (productIds.length === 0) return [];

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("in_stock", true);

  return products ?? [];
}

export default async function RelatedProducts({
  categorySlugs,
  currentProductId,
  limit = 6,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(categorySlugs, currentProductId, limit);

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 border-t border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold">You Might Also Like</h2>
          <p className="text-sm text-brand-muted mt-1">Similar gifts you may love</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] bg-blush rounded-xl overflow-hidden mb-2">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
              )}
            </div>
            <h3 className="text-xs font-medium line-clamp-2 group-hover:text-brand transition-colors">
              {product.name}
            </h3>
            <p className="text-xs font-bold text-gold mt-0.5">{formatKsh(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
