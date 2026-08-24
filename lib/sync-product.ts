import { supabaseAdmin } from "@/lib/supabase";
import type { WcProduct, WcCategory } from "@/lib/woocommerce";
import sharp from "sharp";

/**
 * Upserts one WooCommerce product (and its categories) into Supabase.
 * Shared by scripts/sync-woocommerce-products.ts (full/manual sync) and
 * app/api/sync/woocommerce/webhook/route.ts (live updates from wp-admin).
 *
 * Notes on the mapping:
 * - `is_personalizable` is mapped from WooCommerce tag "personalizable".
 *   If the product has this tag, it's marked as personalizable.
 * - Narrative categories (Apology, Milestone, Just Because) don't need to
 *   exist in WooCommerce — they can stay as TouchGift-only categories,
 *   assigned manually in Supabase or layered on top of the synced ones.
 */
export async function syncProductToSupabase(wcProduct: WcProduct) {
  let imageUrl = wcProduct.images?.[0]?.src ?? null;

  // Convert image to WebP and store in Supabase Storage
  if (imageUrl) {
    try {
      imageUrl = await convertAndStoreImage(wcProduct.id, imageUrl);
    } catch (err) {
      console.error(`Image conversion failed for product ${wcProduct.id}:`, err);
      // Fall back to original URL
      imageUrl = wcProduct.images?.[0]?.src ?? null;
    }
  }

  // Check if product has "personalizable" tag in WooCommerce
  const isPersonalizable = wcProduct.tags?.some(
    (t) => t.name.toLowerCase() === "personalizable"
  ) ?? false;

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .upsert(
      {
        woocommerce_id: wcProduct.id,
        name: wcProduct.name,
        slug: wcProduct.slug,
        description: stripHtml(wcProduct.description),
        price: parseFloat(wcProduct.price || "0"),
        image_url: imageUrl,
        in_stock: wcProduct.stock_status === "instock",
        is_personalizable: isPersonalizable,
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

async function convertAndStoreImage(
  wcProductId: number,
  imageUrl: string
): Promise<string> {
  const bucket = "products";
  const path = `${wcProductId}.webp`;

  // Check if already converted
  const { data: existing } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path);
  if (existing?.publicUrl) {
    // Verify it exists
    const { data: list } = await supabaseAdmin.storage
      .from(bucket)
      .list("", { search: `${wcProductId}.webp` });
    if (list && list.length > 0) return existing.publicUrl;
  }

  // Download original image
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download: ${imageUrl}`);
  const input = Buffer.from(await res.arrayBuffer());

  // Convert to WebP
  const webpBuffer = await sharp(input).webp({ quality: 80 }).toBuffer();

  // Upload to Supabase Storage
  await supabaseAdmin.storage.from(bucket).remove([path]);
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, webpBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
