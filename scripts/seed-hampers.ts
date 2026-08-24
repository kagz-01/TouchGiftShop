/**
 * Seed corporate templates + retail hamper bundles.
 * Informed by competitor research:
 *  - Corporate: Postal.io, SendAChoice, Social Imprints, Givenly
 *    (welcome kits, client appreciation, recognition, holiday, events, executive VIP, milestones, sympathy)
 *  - Retail Kenya: Purpink, Montys, Blooms & Gifts, Jays Wines
 *    (whisky luxury sets, wine+chocolate, spa romance, beer combos, Kenyan coffee, baby, get-well)
 *
 * Idempotent: skips items whose slug already exists.
 *
 * Run: npx tsx scripts/seed-hampers.ts [--dry]
 */

import fs from "fs";
import path from "path";
import { Client } from "pg";

(function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m) continue;
    let v = (m[2] ?? "").trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
})();

const DRY = process.argv.includes("--dry");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface TplSeed {
  name: string; description: string; category: string;
  min: number; max: number; occasions: string[]; featured?: boolean;
  items: [string, number][]; // [name, price]
}

// ── Corporate templates (8) ──────────────────────────────────────────
const CORPORATE_TEMPLATES: TplSeed[] = [
  {
    name: "New Hire Welcome Kit", category: "welcome", min: 2500, max: 5000,
    description: "Make new hires feel valued from day one with a curated onboarding experience.",
    occasions: ["onboarding", "new hire", "welcome"], featured: true,
    items: [["Artisan Coffee Beans", 850], ["Premium Chocolate Box", 650], ["Branded Notebook", 450], ["Scented Candle", 550], ["Welcome Card", 200]],
  },
  {
    name: "Client Appreciation", category: "client", min: 3000, max: 8000,
    description: "Strengthen relationships after closing a deal or during holidays.",
    occasions: ["client", "thank you", "deal closed"],
    items: [["Premium Wine Bottle", 1200], ["Luxury Chocolate Truffles", 950], ["Artisan Cheese Board", 1100], ["Thank You Card", 200]],
  },
  {
    name: "Conference Gift Bag", category: "event", min: 1500, max: 3000,
    description: "Branded gift bags for conferences, launches, and corporate events.",
    occasions: ["event", "conference", "launch"],
    items: [["Premium Notebook", 350], ["Artisan Chocolate Bar", 300], ["Branded Tote Bag", 450], ["Gourmet Snack Pack", 400]],
  },
  {
    name: "Festive Season Hamper", category: "holiday", min: 2000, max: 6000,
    description: "Christmas, New Year, Ramadan, Easter — seasonal gifts for your entire team.",
    occasions: ["christmas", "new year", "holiday", "eid"],
    items: [["Festive Cookie Box", 650], ["Spiced Tea Collection", 500], ["Holiday Candle", 550], ["Chocolate Truffles", 600], ["Festive Card", 200]],
  },
  {
    name: "Milestone Celebration", category: "recognition", min: 2000, max: 4500,
    description: "Reward work anniversaries, promotions, and exceptional performance.",
    occasions: ["anniversary", "promotion", "milestone"],
    items: [["Premium Gift Box", 800], ["Artisan Coffee Set", 750], ["Luxury Soap Set", 600], ["Congrats Card", 200]],
  },
  {
    name: "Executive Luxury Box", category: "executive", min: 8000, max: 15000,
    description: "Premium gifts for C-suite executives and high-value clients.",
    occasions: ["executive", "vip", "premium", "luxury"], featured: true,
    items: [["Premium Whisky Set", 2500], ["Artisan Chocolate Collection", 1200], ["Leather Card Holder", 1800], ["Gourmet Gift Basket", 1500], ["Personalised Crystal", 1100]],
  },
  {
    name: "Sympathy & Care Package", category: "sympathy", min: 2500, max: 6000,
    description: "Thoughtful comfort for bereavement, illness, or difficult seasons. Discreet and dignified.",
    occasions: ["sympathy", "bereavement", "get well"],
    items: [["Comfort Tea Selection", 700], ["Honey & Nuts Set", 900], ["Soft Throw Blanket", 1400], ["Candle", 550], ["Condolence Card", 150]],
  },
  {
    name: "Prospecting Door-Opener", category: "client", min: 1200, max: 2500,
    description: "Light-touch gift to warm up cold prospects and secure that first meeting.",
    occasions: ["prospecting", "sales", "meeting"],
    items: [["Kenyan Coffee Pack", 550], ["Macadamia Snack Box", 450], ["Notebook + Pen", 350], ["Card", 100]],
  },
];

// ── Retail bundles (10) — Kenyan market pricing from Purpink/Montys/Blooms ──
interface BundleSeed {
  name: string; description: string; category: string;
  regular: number; bundle: number; occasions: string[];
  featured?: boolean; comingSoon?: boolean;
  items: [string, number][];
}

const RETAIL_BUNDLES: BundleSeed[] = [
  {
    name: "Whisky Lovers Hamper", category: "liquor", regular: 12500, bundle: 10500,
    description: "Premium whisky with glassware, whisky stones and artisan chocolates in a woven basket.",
    occasions: ["birthday", "fathers-day", "corporate"], featured: true, comingSoon: true,
    items: [["Premium Blended Whisky 750ml", 4500], ["Whisky Glass Set", 1500], ["Whisky Stones in Wooden Box", 1200], ["Ferrero Collection 24pc", 2200], ["Signature Woven Basket", 1100]],
  },
  {
    name: "Wine & Chocolate Indulgence", category: "wine", regular: 4800, bundle: 3999,
    description: "Red wine paired with premium chocolates — the classic romantic gesture.",
    occasions: ["valentines", "anniversary", "date-night"], featured: true, comingSoon: true,
    items: [["Red Wine 750ml", 1800], ["Lindt Lindor Box", 1300], ["Rose Stem Bunch", 700], ["Gift Card", 199]],
  },
  {
    name: "Champagne Celebration Set", category: "wine", regular: 9500, bundle: 8500,
    description: "Sparkling celebration with truffles and keepsake flutes for milestone moments.",
    occasions: ["wedding", "promotion", "new-year"], comingSoon: true,
    items: [["Sparkling Wine 750ml", 4200], ["Chocolate Truffles", 1600], ["Keepsake Flute Pair", 1900], ["Celebration Basket", 800]],
  },
  {
    name: "Tusker & Nyama Choma Combo", category: "liquor", regular: 3200, bundle: 2750,
    description: "Cold Tuskers with gourmet snack pack — the ultimate Kenyan celebration box.",
    occasions: ["birthday", "weekend", "friends"], comingSoon: true,
    items: [["Tusker Lager 500ml x6", 1500], ["Gourmet Biltong Pack", 800], ["Salted Cashews", 350], ["Kachumbari Spice Kit", 100]],
  },
  {
    name: "Spa Day Retreat Hamper", category: "wellness", regular: 6500, bundle: 5600,
    description: "Bath salts, essential oils, candle and chocolate — pure relaxation at home.",
    occasions: ["mothers-day", "birthday", "self-care"], featured: true,
    items: [["Bath Salts 500g", 900], ["Lavender Essential Oil", 800], ["Rose & Jasmine Candle", 950], ["Silk Body Scrub", 1100], ["Herbal Tea Tin", 650], ["Woven Gift Box", 700]],
  },
  {
    name: "Kenyan Coffee Lover's Box", category: "gourmet", regular: 3800, bundle: 3200,
    description: "Single-origin Kenyan beans, French press and biscotti — brewed pride.",
    occasions: ["birthday", "corporate", "thank-you"],
    items: [["Spring Valley Espresso Beans 250g", 750], ["Kenyan AA Ground Coffee", 650], ["Mini French Press", 1400], ["Almond Biscotti", 400]],
  },
  {
    name: "Baby Welcome Basket", category: "baby", regular: 5200, bundle: 4500,
    description: "Soft essentials for the newest arrival — perfect for baby showers and visits.",
    occasions: ["baby-shower", "new-mom", "congratulations"],
    items: [["Organic Onesie Set", 1200], ["Plush Toy", 850], ["Baby Blanket", 950], ["Mom's Recovery Tea", 600], ["Welcome Card", 150], ["Gift Basket", 750]],
  },
  {
    name: "Get Well Soon Comfort Box", category: "wellness", regular: 3600, bundle: 3100,
    description: "Nourishing comforts to lift spirits during recovery.",
    occasions: ["get-well", "hospital", "recovery"],
    items: [["Honey & Lemon Set", 700], ["Herbal Tea Collection", 650], ["Cozy Socks", 450], ["Puzzle Book", 350], ["Fruit & Nut Mix", 550], ["Cheer-up Card", 100]],
  },
  {
    name: "Executive Gentleman's Set", category: "corporate", regular: 15500, bundle: 13500,
    description: "Hip flask, leather wallet, whisky mini and truffles — boardroom ready.",
    occasions: ["corporate", "promotion", "retirement"], comingSoon: true,
    items: [["Leather Hip Flask 270ml", 2800], ["PU Leather Wallet", 2200], ["Whisky Miniature Trio", 2900], ["Ferrero Rocher 24pc", 2200], ["Personalised Card", 400], ["Rigid Gift Box", 1000]],
  },
  {
    name: "Chocolate Overload Tower", category: "chocolate", regular: 4400, bundle: 3799,
    description: "Three tiers of chocolate heaven for the serious sweet tooth.",
    occasions: ["birthday", "apology", "just-because"],
    items: [["Quality Street 265g", 850], ["Cachet Dark Orange & Almonds", 600], ["Ferrero Rocher T3", 950], ["Feastables Bar Duo", 500], ["Tower Boxes", 899]],
  },
];

async function seedTemplates(db: Client) {
  console.log("\n📦 Seeding corporate templates...");
  let added = 0;
  for (const t of CORPORATE_TEMPLATES) {
    const exists = await db.query("SELECT id FROM hamper_templates WHERE lower(name) = lower($1)", [t.name]);
    if (exists.rows.length > 0) { console.log(`  ⏭️  ${t.name} (exists)`); continue; }
    if (DRY) { console.log(`  🌱 [dry] ${t.name} (${t.items.length} items)`); added++; continue; }

    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO hamper_templates (name, description, category, price_range_min, price_range_max, item_count, occasions, is_active, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8) RETURNING id`,
      [t.name, t.description, t.category, t.min, t.max, t.items.length, t.occasions, !!t.featured]
    );
    let i = 0;
    for (const [itemName, price] of t.items) {
      await db.query(
        `INSERT INTO hamper_template_items (template_id, product_id, product_name, price, quantity, sort_order)
         VALUES ($1,NULL,$2,$3,1,$4)`,
        [rows[0].id, itemName, price, i++]
      );
    }
    console.log(`  ✅ ${t.name}`);
    added++;
  }
  return added;
}

async function seedBundles(db: Client) {
  console.log("\n🎁 Seeding retail bundles...");
  let added = 0;
  for (const b of RETAIL_BUNDLES) {
    const slug = slugify(b.name);
    const exists = await db.query("SELECT id FROM hamper_bundles WHERE slug = $1", [slug]);
    if (exists.rows.length > 0) { console.log(`  ⏭️  ${b.name} (exists)`); continue; }
    if (DRY) { console.log(`  🌱 [dry] ${b.name}${b.comingSoon ? " (coming soon)" : ""}`); added++; continue; }

    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO hamper_bundles (name, slug, description, regular_price, bundle_price, category, occasions, item_count, is_active, is_featured, is_coming_soon)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10) RETURNING id`,
      [b.name, slug, b.description, b.regular, b.bundle, b.category, b.occasions, b.items.reduce((s, [, q]) => s + q, 0), !!b.featured, !!b.comingSoon]
    );
    let i = 0;
    for (const [itemName] of b.items) {
      await db.query(
        `INSERT INTO hamper_bundle_items (bundle_id, product_id, product_name, quantity, sort_order)
         VALUES ($1,NULL,$2,1,$3)`,
        [rows[0].id, itemName, i++]
      );
    }
    console.log(`  ✅ ${b.name}${b.comingSoon ? " 🔒coming-soon" : ""}`);
    added++;
  }
  return added;
}

async function main() {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_DATABASE_URL) { console.error("❌ DATABASE_URL missing"); process.exit(1); }
  const db = new Client({ connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_DATABASE_URL });
  await db.connect();

  const tpl = await seedTemplates(db);
  const bnd = await seedBundles(db);

  await db.end();
  console.log(`\n🎉 Done${DRY ? " (DRY RUN — nothing saved)" : ""}: ${tpl} templates, ${bnd} bundles seeded`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
