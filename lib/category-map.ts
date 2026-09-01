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
  "baby-essentials": ["baby-shower-gifts", "kids-baby-gifts", "newborn-essentials", "baby-feeding-sets"],
  "baby-toys": ["kids-baby-gifts", "early-education-toys", "baby-sensory-toys"],
  "baby-nursery": ["nursery-decor", "baby-room-accessories", "home-lifestyle"],
  "baby-keepsakes": ["baby-keepsake-gifts", "personalized-gifts", "photo-frames-keepsakes"],
  "baby-clothing": ["baby-clothing-sets", "kids-baby-gifts"],
  "baby-hampers": ["baby-shower-gifts", "hampers-gift-sets", "kids-baby-gifts"],
  "baby-bath": ["baby-bath-time", "kids-baby-gifts", "wellness-self-care-hampers"],
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
  "for-her": [
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
  "for-him": [
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

  // Beverages
  beverages: ["wine-whiskey-beverage-hampers", "hampers-gift-sets", "customizable-hamper-kits"],
  "alcoholic": ["wine-whiskey-beverage-hampers", "hampers-gift-sets"],
  "non-alcoholic": ["juices-tea-coffee-gifts", "hampers-gift-sets", "customizable-hamper-kits"],

  // Food & Treats
  "food-treats": ["hampers-gift-sets", "customizable-hamper-kits", "chocolates-sweets-gifts"],
  chocolates: ["hampers-gift-sets", "customizable-hamper-kits", "chocolates-sweets-gifts"],

  // Plants
  plants: ["plants-succulents", "flowers-aromatics", "home-lifestyle"],

  // Books & Media
  "books-media": ["books-magazines-gifts", "personalized-journals-notebooks"],

  // Experience Gifts
  "experience-gifts": ["spa-experience-vouchers", "wellness-self-care-hampers", "dining-experience-vouchers"],

  // Subscriptions
  subscriptions: ["monthly-subscription-boxes", "wellness-self-care-hampers"],

  // Pet Gifts
  "pet-gifts": ["pet-accessories-gifts", "home-lifestyle"],

  // Composite / Curated Collections
  "date-night": ["flowers-aromatics", "fresh-flower-bouquets", "chocolates-sweets-gifts", "wine-whiskey-beverage-hampers"],
  "self-care": ["wellness-self-care-hampers", "candle-holders-lanterns", "luxury-perfumes-fragrance-collection"],

  // Fitness & Gym
  fitness: ["fitness-equipment", "home-lifestyle", "fashion-accessories"],
  "gym-accessories": ["fitness-equipment", "fashion-accessories"],

  // Gaming
  gaming: ["gaming-accessories", "board-games-puzzles", "home-lifestyle"],
  "board-games": ["board-games-puzzles", "early-education-toys"],

  // Music
  music: ["vinyl-records", "musical-accessories", "home-lifestyle"],

  // Outdoor & Camping
  outdoor: ["camping-gear", "picnic-accessories", "home-lifestyle"],
  camping: ["camping-gear", "home-lifestyle"],

  // Home Decor
  "home-decor": ["wall-art-decor", "home-lifestyle", "candle-holders-lanterns"],
  "wall-art": ["wall-art-decor", "art-prints-canvas", "wall-hangings-sculptures"],

  // Kitchen
  kitchen: ["kitchen-tools", "luxury-kitchen-accessories", "home-lifestyle"],

  // Wedding Registry
  "wedding-registry": ["wedding-registry-items", "home-lifestyle", "personalized-gifts"],
  "his-hers": ["wedding-registry-items", "personalized-gifts"],

  // Professional Appreciation
  "teacher-gifts": ["teacher-appreciation", "personalized-gifts", "greeting-cards-note-cards"],
  "nurse-gifts": ["nurse-appreciation", "wellness-self-care-hampers", "personalized-gifts"],

  // Seasonal
  christmas: ["christmas-gifts", "hampers-gift-sets", "candle-holders-lanterns"],
  valentines: ["valentines-gifts", "flowers-aromatics", "chocolates-sweets-gifts"],
  easter: ["easter-gifts", "chocolates-sweets-gifts", "kids-baby-gifts"],

  // Collections (MegaMenu)
  wellness: ["wellness-self-care-hampers", "spa-experience-vouchers", "candle-holders-lanterns"],
  tech: ["home-lifestyle", "gaming-accessories", "luxury-kitchen-accessories"],
  experiences: ["spa-experience-vouchers", "dining-experience-vouchers"],
  housewarming: ["home-lifestyle", "wall-art-decor", "candle-holders-lanterns", "plants-succulents"],

  // Audience (MegaMenu — By Recipient)
  parents: ["home-lifestyle", "wellness-self-care-hampers", "luxury-kitchen-accessories", "personalized-gifts"],
  friend: ["just-because", "chocolates-sweets-gifts", "plush-toys-dolls", "board-games-puzzles"],
  colleague: ["corporate-business-gifts", "office-desk-essentials", "personalized-desk-accessories"],

  // Holidays (MegaMenu — Kenyan + International)
  "mothers-day": ["mothers-day-fathers-day", "flowers-aromatics", "fresh-flower-bouquets", "wellness-self-care-hampers"],
  "fathers-day": ["mothers-day-fathers-day", "mens-premium-accessories", "watches-timepieces"],
  eid: ["hampers-gift-sets", "chocolates-sweets-gifts", "personalized-gifts"],
  madaraka: ["hampers-gift-sets", "handmade-african-art", "handmade-crafts-fairs"],
  mashujaa: ["hampers-gift-sets", "handmade-african-art", "collectible-award-sculpture"],
  jamhuri: ["hampers-gift-sets", "handmade-african-art", "handmade-crafts-fairs"],
  utamaduni: ["handmade-african-art", "handmade-crafts-fairs", "art-craft-gifts"],
  "labour-day": ["office-desk-essentials", "corporate-business-gifts"],
  "womens-day": ["womens-luxury-accessories", "flowers-aromatics", "fresh-flower-bouquets"],

  // Cultural life moments (MegaMenu — Gift Lab + Occasions)
  ruracio: ["wedding-registry-items", "personalized-gifts", "jewelry-fine-pieces"],
  dowry: ["home-lifestyle", "hampers-gift-sets", "luxury-gifts"],
  circumcision: ["mens-premium-accessories", "personalized-gifts", "watches-timepieces"],
  christening: ["baby-shower-gifts", "kids-baby-gifts", "greeting-cards-note-cards"],
  funeral: ["greeting-cards-note-cards", "fresh-flower-bouquets", "flowers-aromatics"],
};

/**
 * Returns the DB category slugs for a given UI slug.
 * If no mapping exists, returns the original slug as a single-element array
 * (for direct DB slug lookups like "just-because").
 */
export function getDbSlugs(uiSlug: string): string[] {
  return CATEGORY_MAP[uiSlug] || [uiSlug];
}
