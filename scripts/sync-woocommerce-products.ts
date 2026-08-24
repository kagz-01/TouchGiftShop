/**
 * Bulk sync all WooCommerce products into Supabase.
 *
 * Usage:
 *   npx tsx scripts/sync-woocommerce-products.ts
 *
 * This runs the same logic as the webhook handler but for ALL products.
 * Safe to run multiple times — uses upserts (idempotent).
 */

import { fetchAllWcProducts } from "../lib/woocommerce";
import { syncProductToSupabase } from "../lib/sync-product";

async function main() {
  console.log("🔄 Fetching all products from WooCommerce...");
  const wcProducts = await fetchAllWcProducts();
  console.log(`📦 Found ${wcProducts.length} products`);

  let synced = 0;
  let failed = 0;

  for (const wcProduct of wcProducts) {
    try {
      const product = await syncProductToSupabase(wcProduct);
      synced++;
      console.log(`  ✅ [${synced}/${wcProducts.length}] ${product.name} (KES ${product.price})`);
    } catch (err) {
      failed++;
      console.error(`  ❌ [${wcProducts.indexOf(wcProduct) + 1}/${wcProducts.length}] ${wcProduct.name}: ${err}`);
    }
  }

  console.log(`\n🎉 Sync complete: ${synced} synced, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
