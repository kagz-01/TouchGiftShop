/**
 * Maps user-friendly category slugs (used in UI tabs, MegaMenu, OccasionFilter)
 * to the actual WooCommerce/Supabase category slugs in the database.
 *
 * Multiple DB slugs can map to one UI slug (e.g. "corporate" maps to several
 * WooCommerce product categories).
 */

export const CATEGORY_MAP: Record<string, string[]> = {
  // Occasions
  birthdays: ["birthday-gifts"],
  anniversaries: ["occasions", "flowers-aromatics", "fresh-flower-bouquets", "jewelry-fine-pieces"],
  weddings: ["occasions", "flowers-aromatics", "fresh-flower-bouquets", "gift-packaging-accessories"],
  baby: ["baby-shower-gifts", "kids-baby-gifts", "early-education-toys"],
  graduation: ["occasions", "personalized-gifts", "personalized-journals-notebooks"],
  milestone: ["personalized-gifts", "personalized-journals-notebooks", "jewelry-fine-pieces", "watches-timepieces"],
  condolences: ["greeting-cards-note-cards", "flowers-aromatics", "fresh-flower-bouquets"],

  // Sentiments
  "thank-you": ["personalized-gifts", "flowers-aromatics", "fresh-flower-bouquets", "greeting-cards-note-cards"],
  apology: ["flowers-aromatics", "fresh-flower-bouquets", "greeting-cards-note-cards", "apology"],
  "get-well": ["flowers-aromatics", "fresh-flower-bouquets", "wellness-self-care-hampers"],
  "just-because": ["just-because", "personalized-gifts", "flowers-aromatics", "fresh-flower-bouquets"],

  // For Her
  her: [
    "womens-luxury-accessories",
    "handbags-clutches-purses",
    "scarves-wraps-shawls",
    "sunglasses-fashion-essentials",
    "fashion-accessories",
    "jewelry-fine-pieces",
    "handmade-jewelry",
    "flowers-aromatics",
    "fresh-flower-bouquets",
    "plush-toys-dolls",
    "luxury-perfumes-fragrance-collection",
    "personalized-gifts",
    "name-printed-mugs-drinkware",
  ],
  flowers: ["flowers-aromatics", "fresh-flower-bouquets"],
  chocolates: ["hampers-gift-sets", "customizable-hamper-kits"],
  jewellery: ["jewelry-fine-pieces", "handmade-jewelry", "watches-timepieces"],
  personalised: ["personalized-gifts", "personalized-desk-accessories", "personalized-journals-notebooks", "name-printed-mugs-drinkware"],
  spa: ["wellness-self-care-hampers"],

  // For Him
  him: [
    "mens-premium-accessories",
    "watches-timepieces",
    "wallets-cardholders",
    "monogrammed-wallets-accessories",
    "sunglasses-fashion-essentials",
    "personalized-gifts",
    "name-printed-mugs-drinkware",
    "art-craft-gifts",
  ],
  drinks: ["wine-whiskey-beverage-hampers", "hampers-gift-sets"],
  gadgets: ["luxury-kitchen-accessories", "home-lifestyle"],
  grooming: ["wellness-self-care-hampers", "luxury-perfumes-fragrance-collection"],
  stationery: ["personalized-journals-notebooks", "planners-premium-stationery", "office-desk-essentials", "personalized-desk-accessories"],
  sports: ["home-lifestyle", "fashion-accessories", "watches-timepieces"],

  // Corporate
  corporate: [
    "corporate-business-gifts",
    "corporate-events-gifts",
    "corporate-appreciation-hampers",
    "corporate-events-awards",
    "clients-welcome-kits",
    "staff-recognition-awards",
    "branded-merchandise",
    "executive-gift-set",
    "personalized-desk-accessories",
    "personalized-journals-notebooks",
  ],

  // Hampers
  hampers: [
    "hampers-gift-sets",
    "customizable-hamper-kits",
    "wellness-self-care-hampers",
    "wine-whiskey-beverage-hampers",
    "corporate-appreciation-hampers",
    "hamper-packaging-supplies",
  ],

  // Candles
  candles: ["candle-holders-lanterns", "home-lifestyle"],
};

/**
 * Returns the DB category slugs for a given UI slug.
 * If no mapping exists, returns the original slug as a single-element array
 * (for direct DB slug lookups like "just-because").
 */
export function getDbSlugs(uiSlug: string): string[] {
  return CATEGORY_MAP[uiSlug] || [uiSlug];
}
