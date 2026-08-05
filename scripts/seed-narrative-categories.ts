/**
 * Seeds ONLY the narrative categories (Apology, Milestone, Just Because) —
 * TouchGift-specific collections that have no WooCommerce equivalent.
 * Practical categories (Birthdays, Weddings, Corporate, etc.) now come
 * automatically from WooCommerce via sync-woocommerce-products.ts.
 *
 * Usage: npx tsx scripts/seed-narrative-categories.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NARRATIVE_CATEGORIES = [
  { name: "Apology", slug: "apology", kind: "narrative" as const },
  { name: "Milestone", slug: "milestone", kind: "narrative" as const },
  { name: "Just Because", slug: "just-because", kind: "narrative" as const },
];

async function main() {
  for (const cat of NARRATIVE_CATEGORIES) {
    const { error } = await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" });
    if (error) console.error(`Failed "${cat.slug}":`, error.message);
    else console.log(`Upserted "${cat.slug}".`);
  }
}

main();
