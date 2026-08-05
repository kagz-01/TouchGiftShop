/**
 * Full product sync: pulls every published product from WooCommerce and
 * upserts it into Supabase. Safe to re-run any time — matches on
 * woocommerce_id, so nothing gets duplicated.
 *
 * Batches upserts and includes retry logic for network resilience.
 *
 * Usage: npx tsx scripts/sync-woocommerce-products.ts
 */

import { fetchAllWcProducts } from "@/lib/woocommerce";
import { syncProductToSupabase } from "@/lib/sync-product";

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const products = await fetchAllWcProducts();
  console.log(`Fetched ${products.length} products from WooCommerce.`);

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (wcProduct) => {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            await syncProductToSupabase(wcProduct);
            synced++;
            console.log(`[${synced + failed}/${products.length}] Synced "${wcProduct.slug}".`);
            return;
          } catch (err) {
            if (attempt < MAX_RETRIES) {
              await sleep(1000 * attempt);
            } else {
              failed++;
              console.error(`[${synced + failed}/${products.length}] FAILED "${wcProduct.slug}": ${err instanceof Error ? err.message : err}`);
            }
          }
        }
      })
    );

    // Small delay between batches to avoid hammering WooCommerce
    if (i + BATCH_SIZE < products.length) {
      await sleep(500);
    }
  }

  console.log(`\nDone. Synced: ${synced}, Failed: ${failed}, Total: ${products.length}`);
}

main();
