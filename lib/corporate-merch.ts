/**
 * Corporate merchandise taxonomy — the intended range, per catalog/brandables.csv.
 *
 * ⚠ NOT LIVE INVENTORY. The CSV is a reference of the range we intend to carry;
 * none of it is loaded into the `products` table yet and none of it has product
 * imagery. `count` is therefore kept for planning only and is deliberately NOT
 * rendered in the UI — advertising "48 styles" for products that aren't in the
 * database is exactly the fabricated-counts problem this module was written to
 * fix. Surface the counts once the catalog is actually loaded.
 *
 * What this module DOES own today, and why it is worth keeping:
 *   1. The 8 real gift-first categories and their gift-language framing, so the
 *      page stops advertising industrial categories it won't sell.
 *   2. `slug` values that resolve in lib/category-map.ts. The previous sidebar
 *      used `workwear`, `caps`, `banners`, `umbrellas`, `fabric`, `stationery`
 *      — none in TAXONOMY. getDbSlugs() returns [] for an unknown slug and
 *      callers read that as "no filter", so six of nine categories silently
 *      displayed the whole shop under a "Banners & Displays" heading.
 *   3. The TouchLine boundary from `coporate side.txt`.
 *
 * DO NOT hand-edit `count` — it mirrors the CSV. Regenerate against the CSV.
 *
 * Brand framing follows `coporate side.txt`:
 *   TouchGift sells what someone RECEIVES. Workwear, hi-vis, banners, gazebos
 *   and uniforms are B2B supply and route to TouchLine (touchlineltd.co.ke),
 *   so they are deliberately absent from this list. See TOUCHLINE_BRIDGE.
 */

export type MerchCategory = {
  /** CSV `category` value — the grouping ops and merchandising think in. */
  key: string;
  label: string;
  emoji: string;
  /** Category slug understood by lib/category-map.ts. */
  slug: string;
  /** Short, gift-framed line for the card. */
  blurb: string;
  moq: number;
  /** Planning figure from the CSV. Do not render until the catalog is loaded. */
  count: number;
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

/** Planning total from the CSV. Exported for internal use only — do not render
 *  it in the UI while the catalog is unloaded. See the header note. */
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
