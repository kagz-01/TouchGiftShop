import { config } from "dotenv";
import { resolve } from "path";
import axios from 'axios';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "./seed-catalog";

config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "products";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchBingImage(query: string): Promise<string[]> {
  try {
    const res = await axios.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`);
    const $ = cheerio.load(res.data);
    const images: string[] = [];
    $('a.iusc').each((i, el) => {
      const m = $(el).attr('m');
      if (m) {
        try {
          const data = JSON.parse(m);
          if (data.murl) images.push(data.murl);
        } catch(e) {}
      }
    });
    return images;
  } catch (err) {
    console.error(`Bing search failed for "${query}":`, err instanceof Error ? err.message : err);
    return [];
  }
}

async function downloadAndReplace(slug: string, query: string): Promise<string | null> {
  const path = `seed/${slug}.webp`;
  const urls = await searchBingImage(query);

  for (const url of urls) {
    try {
      console.log(`    Trying: ${url.substring(0, 60)}...`);
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
      
      const input = Buffer.from(res.data);
      if (input.length < 5000) {
        console.warn(`    Skipping tiny image (${input.length} bytes)`);
        continue;
      }

      const webpBuffer = await sharp(input)
        .resize(600, 800, { fit: "cover" })
        .webp({ quality: 82 })
        .toBuffer();

      await supabase.storage.from(BUCKET).remove([path]);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) {
        console.warn(`    Storage upload failed: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      continue;
    }
  }

  return null;
}

async function main() {
  console.log(`\n=== TouchGift Realistic Image Fix ===`);
  console.log(`Fixing images for ${PRODUCTS.length} products...\n`);

  let fixed = 0;
  let failed = 0;
  let notFound = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const productDef = PRODUCTS[i];
    const slug = productDef.slug;
    const query = productDef.imageQuery || productDef.name;
    const prefix = `[${i + 1}/${PRODUCTS.length}]`;

    console.log(`${prefix} Processing: ${slug} (Query: ${query})`);

    const { data: product } = await supabase
      .from("products")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (!product) {
      console.log(`  ⚠ Not in DB (will patch URL if seeded later): ${slug}`);
      notFound++;
      await downloadAndReplace(slug, query + " high quality product");
      await sleep(1000);
      continue;
    }

    const imageUrl = await downloadAndReplace(slug, query + " high quality product");

    if (!imageUrl) {
      console.error(`  ✗ All image sources failed: ${slug}`);
      failed++;
      await sleep(1000);
      continue;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", product.id);

    if (updateError) {
      console.error(`  ✗ DB update failed: ${updateError.message}`);
      failed++;
      continue;
    }

    console.log(`  ✓ Fixed: ${product.name}`);
    fixed++;

    await sleep(1000);
  }

  console.log(`\n=== Done ===`);
  console.log(`  ✓ Fixed:     ${fixed}`);
  console.log(`  ⚠ Not in DB: ${notFound}`);
  console.log(`  ✗ Failed:    ${failed}`);
  console.log(`  Total:       ${PRODUCTS.length}`);
}

main();
