import { supabaseAdmin } from "@/lib/supabase";
import type { WcProduct, WcCategory } from "@/lib/woocommerce";

/**
 * Upserts one WooCommerce product (and its categories) into Supabase.
 * Shared by scripts/sync-woocommerce-products.ts (full/manual sync) and
 * app/api/sync/woocommerce/webhook/route.ts (live updates from wp-admin).
 *
 * Notes on the mapping:
 * - `is_personalizable` has no WooCommerce equivalent — defaults to false.
 *   TODO: map from a WooCommerce product tag (e.g. "personalizable") once
 *   staff start using one, or add a custom field via ACF.
 * - Narrative categories (Apology, Milestone, Just Because) don't need to
 *   exist in WooCommerce — they can stay as TouchGift-only categories,
 *   assigned manually in Supabase or layered on top of the synced ones.
 */
export async function syncProductToSupabase(wcProduct: WcProduct) {
  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .upsert(
      {
        woocommerce_id: wcProduct.id,
        name: wcProduct.name,
        slug: wcProduct.slug,
        description: stripHtml(wcProduct.description),
        price: parseFloat(wcProduct.price || "0"),
        image_url: wcProduct.images?.[0]?.src ?? null,
        in_stock: wcProduct.stock_status === "instock",
        synced_at: new Date().toISOString(),
      },
      { onConflict: "woocommerce_id" }
    )
    .select()
    .single();

  if (productError || !product) {
    throw new Error(
      `Failed to sync product ${wcProduct.id}: ${productError?.message}`
    );
  }

  for (const wcCategory of wcProduct.categories ?? []) {
    const category = await upsertCategory(wcCategory);

    await supabaseAdmin
      .from("product_categories")
      .upsert(
        { product_id: product.id, category_id: category.id },
        { onConflict: "product_id,category_id" }
      );
  }

  return product;
}

async function upsertCategory(wcCategory: WcCategory) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .upsert(
      {
        woocommerce_id: wcCategory.id,
        name: wcCategory.name,
        slug: wcCategory.slug,
        kind: "practical", // WooCommerce categories map to the practical filters
      },
      { onConflict: "woocommerce_id" }
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to sync category ${wcCategory.id}: ${error?.message}`);
  }
  return data;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
