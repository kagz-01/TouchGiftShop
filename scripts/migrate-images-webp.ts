/**
 * Migrates WooCommerce images to Supabase Storage as WebP.
 *
 * Usage:
 *   npx tsx scripts/migrate-images-webp.ts
 *
 * What it does:
 *   1. Fetches all products from WooCommerce
 *   2. Downloads each product image
 *   3. Converts to WebP format (smaller, faster)
 *   4. Uploads to Supabase Storage bucket "products"
 *   5. Updates the product's image_url in the database
 *
 * Run once to migrate, then the webhook handles new products automatically.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WC_URL = process.env.WOOCOMMERCE_URL!;
const WC_AUTH = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString("base64");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "products";

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    console.log(`Creating bucket "${BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`Bucket "${BUCKET}" created.`);
  } else {
    console.log(`Bucket "${BUCKET}" exists.`);
  }
}

async function fetchAllProducts() {
  const all: { id: number; name: string; images: { src: string }[] }[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish`,
      { headers: { Authorization: `Basic ${WC_AUTH}` } }
    );
    if (!res.ok) break;
    const batch = await res.json();
    if (batch.length === 0) break;
    all.push(...batch);
    page++;
  }
  return all;
}

async function downloadAndConvert(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download: ${imageUrl}`);
  const input = Buffer.from(await res.arrayBuffer());
  return sharp(input).webp({ quality: 80 }).toBuffer();
}

async function uploadToStorage(
  productId: number,
  webpBuffer: Buffer
): Promise<string> {
  const path = `${productId}.webp`;

  // Delete existing file if any
  await supabase.storage.from(BUCKET).remove([path]);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, webpBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  console.log("=== TouchGift Image Migration ===\n");

  await ensureBucket();

  console.log("Fetching products from WooCommerce...");
  const products = await fetchAllProducts();
  console.log(`Found ${products.length} products.\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const wc of products) {
    const imageUrl = wc.images?.[0]?.src;
    if (!imageUrl) {
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`[${wc.id}] ${wc.name.slice(0, 40)}... `);

      const webpBuffer = await downloadAndConvert(imageUrl);
      const publicUrl = await uploadToStorage(wc.id, webpBuffer);

      // Update database
      const { error } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("woocommerce_id", wc.id);

      if (error) throw new Error(`DB update failed: ${error.message}`);

      console.log(`✓ (${(webpBuffer.length / 1024).toFixed(0)}KB)`);
      success++;
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Success: ${success} | Skipped: ${skipped} | Failed: ${failed}`);
}

main().catch(console.error);
