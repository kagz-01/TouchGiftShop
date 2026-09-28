/**
 * Resolves a category slug from a URL (`/shop?category=<slug>`) to the slugs
 * used in the `categories` table.
 *
 * The taxonomy was rebuilt in scripts/link_categories.py: URLs now carry the
 * real DB slug, so current slugs pass straight through. Slugs still emitted by
 * the quiz, AI and seasonal modules are translated here; anything unknown
 * resolves to `[]`, which callers read as "no category filter applies".
 *
 * That matters because ~200 links across the app still point at the old
 * WooCommerce taxonomy. Filtering on those would render an empty grid, which
 * is worse than showing the full catalog.
 */

const TAXONOMY = new Set([
  "awards-trophies",
  "stationery-office",
  "drinkware",
  "bags",
  "clocks",
  "tech-gadgets",
  "accessories",
  "gift-sets",
  "apparel",
  "flowers",
  "perfumes",
  "fruits-edibles",
]);

/**
 * Legacy slug → current taxonomy. `[]` means the label has no category
 * equivalent (an occasion, an audience, a gift idea) so it must not filter.
 */
const LEGACY: Record<string, string[]> = {
  // Gift-type categories that still have an equivalent
  hampers: ["gift-sets"],
  "hampers-gift-sets": ["gift-sets"],
  "wellness-self-care-hampers": ["gift-sets"],
  "baby-shower-gifts": ["gift-sets"],
  "wine-whiskey-beverage-hampers": ["gift-sets"],
  "personalized-gifts": ["awards-trophies", "stationery-office"],
  "books-magazines-gifts": ["stationery-office"],
  "greeting-cards-note-cards": ["stationery-office"],
  "jewelry-fine-pieces": ["accessories"],
  "watches-accessories": ["clocks", "accessories"],
  "watches-timepieces": ["clocks"],
  gadgets: ["tech-gadgets"],
  tech: ["tech-gadgets"],
  "home-decor": ["accessories"],
  "home-lifestyle": ["accessories"],
  candles: ["accessories"],
  "stocking-fillers": ["accessories"],
  "wall-art-decor": ["accessories"],
  "kitchen-tools": ["accessories"],
  "picnic-accessories": ["accessories"],
  wellness: ["gift-sets"],
  "bath-body-gifts": ["gift-sets"],
  "spa-experience-vouchers": ["gift-sets"],

  // Deliberately absent: gourmet, chocolates, fruits, whisky-hampers.
  // Their only home is `fruits-edibles`, which has no stock yet, so they fall
  // through to [] and show the full catalog instead of an empty grid. Point
  // new links straight at `fruits-edibles` once edibles are imported.

  // No equivalent — occasions, audiences and segments must not filter
  birthdays: [],
  anniversaries: [],
  weddings: [],
  baby: [],
  graduation: [],
  "graduation-gifts": [],
  condolences: [],
  "just-because": [],
  apology: [],
  milestone: [],
  "for-her": [],
  "for-him": [],
  "for-couples": [],
  "for-parents": [],
  "for-colleagues": [],
  colleagues: [],
  fitness: [],
  gaming: [],
  music: [],
  outdoor: [],
  kitchen: [],
  corporate: [],
  christmas: [],
  "christmas-gifts": [],
  "valentines-day-gifts": [],
  "valentines-gifts": [],
  "easter-gifts": [],
  "teacher-appreciation": [],
  "nurse-appreciation": [],
  "thank-you-gifts": [],
  "experience-gifts": [],
  "dining-experience-vouchers": [],
  "monthly-subscription-boxes": [],
  "kids-baby-gifts": [],
  "baby-toys": [],
  "newborn-essentials": [],
  "balloons-gifts": [],
  "liquor": [],
  "whisky-spirits-hampers": [],
};

/**
 * Returns the DB category slugs for a UI slug.
 * Empty array = do not filter (see header comment).
 */
export function getDbSlugs(uiSlug: string): string[] {
  if (TAXONOMY.has(uiSlug)) return [uiSlug];
  return LEGACY[uiSlug] ?? [];
}
