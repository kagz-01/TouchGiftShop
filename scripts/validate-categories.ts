/**
 * Validates CATEGORY_MAP against the live Supabase database.
 * Reports which UI categories return zero products and which DB slugs
 * are not referenced by any UI category.
 *
 * Usage: npx tsx scripts/validate-categories.ts
 */

import { createClient } from "@supabase/supabase-js";
import { CATEGORY_MAP } from "../lib/category-map";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  kind: string;
}

interface ProductCountRow {
  category_id: string;
  count: number;
}

async function main() {
  console.log("=== TouchGift Category Validator ===\n");

  // 1. Fetch all DB categories
  const { data: dbCategories, error: catError } = await supabase
    .from("categories")
    .select("id, name, slug, kind");

  if (catError || !dbCategories) {
    console.error("Failed to fetch categories:", catError?.message);
    process.exit(1);
  }

  console.log(`Found ${dbCategories.length} categories in database:\n`);
  for (const cat of dbCategories) {
    console.log(`  [${cat.kind}] ${cat.slug} ("${cat.name}")`);
  }

  // 2. Get all unique DB slugs referenced in CATEGORY_MAP
  const allMappedSlugs = new Set<string>();
  for (const slugs of Object.values(CATEGORY_MAP)) {
    for (const slug of slugs) {
      allMappedSlugs.add(slug);
    }
  }

  // 3. Find DB slugs not referenced by any UI category
  const dbSlugSet = new Set(dbCategories.map((c) => c.slug));
  const unreferencedSlugs = [...dbSlugSet].filter(
    (slug) => !allMappedSlugs.has(slug)
  );

  console.log(`\n--- DB Slugs Not Referenced by Any UI Category ---`);
  if (unreferencedSlugs.length === 0) {
    console.log("  None (all DB slugs are mapped).");
  } else {
    for (const slug of unreferencedSlugs) {
      const cat = dbCategories.find((c) => c.slug === slug);
      console.log(`  ${slug} ("${cat?.name}" [${cat?.kind}])`);
    }
  }

  // 4. Find UI slugs that don't exist in CATEGORY_MAP (fallback to direct lookup)
  const allUiSlugs = [
    "birthdays", "anniversaries", "weddings", "baby", "graduation", "condolences",
    "thank-you", "apology", "get-well", "just-because", "milestone",
    "her", "flowers", "chocolates", "jewellery", "personalised", "spa",
    "him", "drinks", "gadgets", "grooming", "stationery", "sports",
    "corporate", "hampers", "candles", "beverages",
  ];

  const unmappedUiSlugs = allUiSlugs.filter(
    (slug) => !CATEGORY_MAP[slug]
  );

  console.log(`\n--- UI Slugs Not in CATEGORY_MAP (fall back to direct DB lookup) ---`);
  if (unmappedUiSlugs.length === 0) {
    console.log("  None (all UI slugs are mapped).");
  } else {
    for (const slug of unmappedUiSlugs) {
      console.log(`  ${slug}`);
    }
  }

  // 5. For each UI category, count products
  console.log(`\n--- Product Counts Per UI Category ---`);

  const results: Array<{ uiSlug: string; dbSlugs: string[]; count: number }> = [];

  for (const [uiSlug, dbSlugs] of Object.entries(CATEGORY_MAP)) {
    const { count, error } = await supabase
      .from("product_categories")
      .select("category_id", { count: "exact", head: true })
      .in(
        "category_id",
        dbCategories
          .filter((c) => dbSlugs.includes(c.slug))
          .map((c) => c.id)
      );

    if (error) {
      console.log(`  ${uiSlug}: ERROR - ${error.message}`);
    } else {
      results.push({ uiSlug, dbSlugs, count: count ?? 0 });
      const status = (count ?? 0) === 0 ? "  EMPTY" : "";
      console.log(`  ${uiSlug}: ${count ?? 0} products${status}`);
    }
  }

  // 6. Summary
  const emptyCategories = results.filter((r) => r.count === 0);
  console.log(`\n--- Summary ---`);
  console.log(`  Total UI categories: ${results.length}`);
  console.log(`  Categories with products: ${results.length - emptyCategories.length}`);
  console.log(`  EMPTY categories: ${emptyCategories.length}`);

  if (emptyCategories.length > 0) {
    console.log(`\n  Empty categories need attention:`);
    for (const cat of emptyCategories) {
      console.log(`    - ${cat.uiSlug} maps to [${cat.dbSlugs.join(", ")}]`);
    }
  }
}

main();
