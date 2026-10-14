/**
 * Corporate merchandise taxonomy — generated from catalog/brandables.csv.
 *
 * DO NOT hand-edit the counts: they mirror the CSV exactly (48 SKUs). Both the
 * corporate hero hub and the catalog sidebar read this module so the two can't
 * drift apart, which is exactly what happened before — the hero advertised
 * "Jackets & Workwear · 32 styles" and "Banners & Displays · 11 formats" that
 * existed in neither the CSV nor the database.
 *
 * Brand framing follows `coporate side.txt`:
 *   TouchGift sells what someone RECEIVES. Workwear, hi-vis, banners, gazebos
 *   and uniforms are B2B supply and route to TouchLine (touchlineltd.co.ke),
 *   so they are deliberately absent from this list. See TOUCHLINE_BRIDGE.
 *
 * `slug` values must exist in the TAXONOMY set in lib/category-map.ts — an
 * unknown slug resolves to [] and silently drops the filter, which is how the
 * old sidebar ended up showing every product in the shop under a
 * "Banners & Displays" heading.
 */

export type MerchCategory = {
  /** CSV `category` value — the grouping ops and merchandising think in. */
  key: string;
  label: string;
  emoji: string;
  count: number;
  /** Category slug understood by lib/category-map.ts. */
  slug: string;
  /** Short, gift-framed line for the card. */
  blurb: string;
  moq: number;
};

export const MERCH_CATEGORIES: MerchCategory[] = [
  {
    key: "Branded Apparel",
    label: "Polos & Apparel",
    emoji: "👕",
    count: 13,
    slug: "apparel",
    blurb: "The keep-forever layer — polos, tees, hoodies",
    moq: 25,
  },
  {
    key: "Branded Accessories",
    label: "Umbrellas & Aprons",
    emoji: "☂️",
    count: 8,
    slug: "accessories",
    blurb: "Golf umbrellas, denim and bar aprons",
    moq: 25,
  },
  {
    key: "Branded Bags",
    label: "Bags & Totes",
    emoji: "🎒",
    count: 7,
    slug: "bags",
    blurb: "Totes, backpacks and laptop bags",
    moq: 25,
  },
  {
    key: "Branded Outerwear",
    label: "Softshell & Jackets",
    emoji: "🧥",
    count: 6,
    slug: "apparel",
    blurb: "Softshell, fleece and harrington — premium, not work shell",
    moq: 10,
  },
  {
    key: "Branded Headwear",
    label: "Caps & Beanies",
    emoji: "🧢",
    count: 5,
    slug: "accessories",
    blurb: "Classic caps, beanies, bucket hats",
    moq: 25,
  },
  {
    key: "Home & Comfort Gifts",
    label: "Throws & Comfort",
    emoji: "🧣",
    count: 5,
    slug: "accessories",
    blurb: "Fleece throws, towels, cushion covers",
    moq: 15,
  },
  {
    key: "Travel Gifts",
    label: "Travel Comfort",
    emoji: "✈️",
    count: 2,
    slug: "accessories",
    blurb: "Neck pillows and sleep masks",
    moq: 25,
  },
  {
    key: "Desk Gifts",
    label: "Desk & Mouse Pads",
    emoji: "🖱️",
    count: 2,
    slug: "stationery-office",
    blurb: "Fabric mouse pads and desk pads",
    moq: 20,
  },
];

export const MERCH_TOTAL_SKUS = MERCH_CATEGORIES.reduce((n, c) => n + c.count, 0);

/**
 * The soft bridge required by `coporate side.txt` §"Soft bridge": a clear but
 * secondary exit on the corporate page ONLY. Not the homepage, not the main
 * catalog — those stay purely gift-led.
 */
export const TOUCHLINE_BRIDGE = {
  url: "https://touchlineltd.co.ke",
  eyebrow: "Need more than a gift?",
  heading: "Staff uniforms, event banners & full branding programmes",
  body:
    "Our sister company handles the heavy brandable work — workwear, hi-vis, roll-ups, gazebos, signage and tender-scale runs — while we stay on gifts people actually receive.",
  cta: "Browse brandable & signage options",
  secondaryCta: "Request a corporate branding quote",
} as const;
