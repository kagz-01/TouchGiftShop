import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WC_URL = process.env.WOOCOMMERCE_URL!;
const WC_AUTH = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString("base64");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "products";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
    });
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
    await delay(500);
  }
  return all;
}

async function downloadAndConvert(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  return sharp(input).webp({ quality: 80 }).toBuffer();
}

async function uploadToStorage(productId: number, webpBuffer: Buffer): Promise<string> {
  const path = `${productId}.webp`;
  await supabase.storage.from(BUCKET).remove([path]);
  const { error } = await supabase.storage.from(BUCKET).upload(path, webpBuffer, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  console.log("=== TouchGift Image Migration (with retry) ===\n");
  await ensureBucket();

  console.log("Fetching products from WooCommerce...");
  const products = await fetchAllProducts();
  console.log(`Found ${products.length} products.\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const wc of products) {
    const imageUrl = wc.images?.[0]?.src;
    if (!imageUrl) { skipped++; continue; }

    try {
      process.stdout.write(`[${wc.id}] ${wc.name.slice(0, 40)}... `);
      const webpBuffer = await downloadAndConvert(imageUrl);
      const publicUrl = await uploadToStorage(wc.id, webpBuffer);
      const { error } = await supabase.from("products").update({ image_url: publicUrl }).eq("woocommerce_id", wc.id);
      if (error) throw new Error(`DB update: ${error.message}`);
      console.log(`✓ (${(webpBuffer.length / 1024).toFixed(0)}KB)`);
      success++;
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : err}`);
      failed++;
    }

    await delay(1000);
  }

  console.log(`\n=== Done ===`);
  console.log(`Success: ${success} | Skipped: ${skipped} | Failed: ${failed}`);
}

main().catch(console.error);
