/**
 * fix-all-product-images.ts
 *
 * Replaces ALL product images with curated, category-matched Unsplash photos.
 * Force-overwrites existing Storage files and patches image_url in the DB.
 *
 * Usage: npx tsx scripts/fix-all-product-images.ts
 *
 * Safe to re-run — always upserts.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "products";

// ─── Curated Unsplash Photo Map ───────────────────────────────────────────────
// Each value is a hand-picked Unsplash URL that actually matches the product.

const CURATED_IMAGES: Record<string, string[]> = {
  // ── ALCOHOLIC BEVERAGES ───────────────────────────────────────────────────────
  "tusker-premium-gift-pack": [
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop&auto=format",
  ],
  "johnnie-walker-red-hamper": [
    "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop&auto=format",
  ],
  "captain-morgan-spiced-set": [
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop&auto=format",
  ],
  "gordons-gin-tonic-set": [
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1582106245687-ae1c0c41a7f3?w=600&h=800&fit=crop&auto=format",
  ],
  "bacardi-mojito-kit": [
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop&auto=format",
  ],
  "savanna-dry-cider-box": [
    "https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop&auto=format",
  ],
  "singleton-12-year-hamper": [
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop&auto=format",
  ],
  "jameson-gift-set": [
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop&auto=format",
  ],
  "craft-beer-variety": [
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop&auto=format",
  ],
  "martini-rosso-set": [
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop&auto=format",
  ],
  "prosecco-chocolate-box": [
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=800&fit=crop&auto=format",
  ],
  "hennessy-vs-cognac": [
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop&auto=format",
  ],
  "amarula-cream-set": [
    "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop&auto=format",
  ],
  "smirnoff-ice-party": [
    "https://images.unsplash.com/photo-1575650781-8e8f65f9f4c7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=800&fit=crop&auto=format",
  ],
  "chivas-regal-12-hamper": [
    "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=800&fit=crop&auto=format",
  ],

  // ── NON-ALCOHOLIC BEVERAGES ───────────────────────────────────────────────────
  "kenyan-purple-tea-gift": [
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop&auto=format",
  ],
  "aa-coffee-sampler": [
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop&auto=format",
  ],
  "mango-juice-hamper": [
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop&auto=format",
  ],
  "chai-masala-set": [
    "https://images.unsplash.com/photo-1571934811356-5cc061b6d72b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=800&fit=crop&auto=format",
  ],
  "cold-pressed-juice-trio": [
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=800&fit=crop&auto=format",
  ],
  "espresso-starter-kit": [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop&auto=format",
  ],
  "herbal-tea-collection": [
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=800&fit=crop&auto=format",
  ],
  "fresh-fruit-basket-juice": [
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=800&fit=crop&auto=format",
  ],
  "coffee-biscotti-box": [
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop&auto=format",
  ],
  "smoothie-kit-gift": [
    "https://images.unsplash.com/photo-1638439430466-b2bb7fdc1d67?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop&auto=format",
  ],

  // ── FOOD & TREATS / CHOCOLATES ────────────────────────────────────────────────
  "belgian-chocolate-truffles": [
    "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
  ],
  "artisan-cookie-jar": [
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=800&fit=crop&auto=format",
  ],
  "tropical-dried-fruit": [
    "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=800&fit=crop&auto=format",
  ],
  "chocolate-strawberries": [
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=800&fit=crop&auto=format",
  ],
  "gourmet-popcorn-tin": [
    "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=800&fit=crop&auto=format",
  ],
  "honey-nut-basket": [
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&auto=format",
  ],
  "macaron-assortment": [
    "https://images.unsplash.com/photo-1558327219-93c88f628fa5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=600&h=800&fit=crop&auto=format",
  ],
  "fudge-collection-tin": [
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=800&fit=crop&auto=format",
  ],
  "chocolate-hamper-deluxe": [
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
  ],
  "candy-jar-rainbow": [
    "https://images.unsplash.com/photo-1555441955-b7eca84a7067?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1581798459219-318e769bd6d2?w=600&h=800&fit=crop&auto=format",
  ],

  // ── PLANTS ────────────────────────────────────────────────────────────────────
  "succulent-trio-set": [
    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop&auto=format",
  ],
  "lucky-bamboo-plant": [
    "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1555955208-ba1f5fc5c28e?w=600&h=800&fit=crop&auto=format",
  ],
  "herb-garden-kit": [
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=800&fit=crop&auto=format",
  ],
  "peace-lily-plant": [
    "https://images.unsplash.com/photo-1597305877032-0668b3c6413a?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&h=800&fit=crop&auto=format",
  ],
  "desert-rose-arrangement": [
    "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=800&fit=crop&auto=format",
  ],
  "cactus-collection": [
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=800&fit=crop&auto=format",
  ],
  "money-plant-macrame": [
    "https://images.unsplash.com/photo-1555955208-ba1f5fc5c28e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&h=800&fit=crop&auto=format",
  ],
  "aloe-vera-gift": [
    "https://images.unsplash.com/photo-1567331711402-509c12c41959?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop&auto=format",
  ],
  "terrarium-workshop-kit": [
    "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=800&fit=crop&auto=format",
  ],
  "orchid-ceramic-pot": [
    "https://images.unsplash.com/photo-1490750967868-88df5691cc4c?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1597305877032-0668b3c6413a?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BOOKS & MEDIA ─────────────────────────────────────────────────────────────
  "african-literature-collection": [
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop&auto=format",
  ],
  "leather-journal-pen": [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop&auto=format",
  ],
  "coffee-table-photo-book": [
    "https://images.unsplash.com/photo-1476275466078-4cdc02a51f0f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop&auto=format",
  ],
  "cookbook-spice-set": [
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&h=800&fit=crop&auto=format",
  ],
  "mindfulness-journal": [
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop&auto=format",
  ],
  "childrens-story-collection": [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop&auto=format",
  ],
  "self-help-bundle": [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop&auto=format",
  ],
  "wine-book-pairing": [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
  ],

  // ── EXPERIENCE GIFTS ──────────────────────────────────────────────────────────
  "luxury-spa-day-voucher": [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop&auto=format",
  ],
  "couples-massage-experience": [
    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800&fit=crop&auto=format",
  ],
  "fine-dining-voucher-5k": [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop&auto=format",
  ],
  "wine-tasting-experience": [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop&auto=format",
  ],
  "hot-air-balloon-safari": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&h=800&fit=crop&auto=format",
  ],
  "cooking-class-voucher": [
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop&auto=format",
  ],

  // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────
  "coffee-subscription-3mo": [
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop&auto=format",
  ],
  "wine-monthly-3-bottles": [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop&auto=format",
  ],
  "self-care-monthly-box": [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop&auto=format",
  ],
  "kids-activity-box-3mo": [
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
  ],
  "book-club-subscription": [
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop&auto=format",
  ],

  // ── PET GIFTS ─────────────────────────────────────────────────────────────────
  "dog-lover-gift-box": [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=800&fit=crop&auto=format",
  ],
  "cat-pamper-pack": [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=800&fit=crop&auto=format",
  ],
  "pet-portrait-commission": [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=800&fit=crop&auto=format",
  ],
  "premium-dog-leash-set": [
    "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop&auto=format",
  ],
  "cat-tree-condo": [
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=800&fit=crop&auto=format",
  ],

  // ── FLOWERS ───────────────────────────────────────────────────────────────────
  "classic-red-roses-24": [
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=800&fit=crop&auto=format",
  ],
  "sunflower-bunch": [
    "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1551893665-f843f600794e?w=600&h=800&fit=crop&auto=format",
  ],
  "wildflower-arrangement": [
    "https://images.unsplash.com/photo-1487530811015-6780a4b19db1?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1490750967868-88df5691cc4c?w=600&h=800&fit=crop&auto=format",
  ],
  "lily-rose-combo": [
    "https://images.unsplash.com/photo-1490750967868-88df5691cc4c?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=800&fit=crop&auto=format",
  ],
  "pastel-peony-bunch": [
    "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1487530811015-6780a4b19db1?w=600&h=800&fit=crop&auto=format",
  ],
  "condolence-wreath": [
    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1487530811015-6780a4b19db1?w=600&h=800&fit=crop&auto=format",
  ],

  // ── CANDLES & HOME ────────────────────────────────────────────────────────────
  "soy-candle-trio": [
    "https://images.unsplash.com/photo-1608181831688-8694dc2b29af?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop&auto=format",
  ],
  "luxury-candle-diffuser": [
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1608181831688-8694dc2b29af?w=600&h=800&fit=crop&auto=format",
  ],
  "decorative-lantern-candle": [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1608181831688-8694dc2b29af?w=600&h=800&fit=crop&auto=format",
  ],
  "cozy-throw-blanket": [
    "https://images.unsplash.com/photo-1580539021184-e9acce030b13?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=800&fit=crop&auto=format",
  ],
  "artisan-mug-set": [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop&auto=format",
  ],

  // ── WELLNESS & SPA ────────────────────────────────────────────────────────────
  "bath-bomb-set-12": [
    "https://images.unsplash.com/photo-1570554520913-ce2d62fef9a7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&fit=crop&auto=format",
  ],
  "luxury-spa-hamper": [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1570554520913-ce2d62fef9a7?w=600&h=800&fit=crop&auto=format",
  ],
  "essential-oil-diffuser": [
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=800&fit=crop&auto=format",
  ],
  "yoga-mat-block-set": [
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=800&fit=crop&auto=format",
  ],
  "skincare-routine-set": [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop&auto=format",
  ],

  // ── PERSONALISED ──────────────────────────────────────────────────────────────
  "custom-name-necklace": [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop&auto=format",
  ],
  "photo-canvas-print": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531345287543-18d562535cdf?w=600&h=800&fit=crop&auto=format",
  ],
  "engraved-wallet": [
    "https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&auto=format",
  ],
  "custom-star-map": [
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531345287543-18d562535cdf?w=600&h=800&fit=crop&auto=format",
  ],
  "personalised-coffee-mug": [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=600&h=800&fit=crop&auto=format",
  ],
  "customised-phone-case": [
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531345287543-18d562535cdf?w=600&h=800&fit=crop&auto=format",
  ],

  // ── HAMPERS ───────────────────────────────────────────────────────────────────
  "executive-hamper": [
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],
  "new-baby-hamper": [
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],
  "get-well-hamper": [
    "https://images.unsplash.com/photo-1570554520913-ce2d62fef9a7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=800&fit=crop&auto=format",
  ],
  "thank-you-hamper": [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
  ],
  "gourmet-food-hamper": [
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],

  // ── JEWELLERY ─────────────────────────────────────────────────────────────────
  "gold-heart-pendant": [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop&auto=format",
  ],
  "african-bead-bracelets": [
    "https://images.unsplash.com/photo-1612117189122-9e3c13c6e9fb?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop&auto=format",
  ],
  "silver-hoop-earrings": [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop&auto=format",
  ],
  "birthstone-ring": [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop&auto=format",
  ],
  "cowrie-shell-anklet": [
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1612117189122-9e3c13c6e9fb?w=600&h=800&fit=crop&auto=format",
  ],

  // ── STATIONERY ────────────────────────────────────────────────────────────────
  "premium-planner-2025": [
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop&auto=format",
  ],
  "fountain-pen-ink-set": [
    "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&h=800&fit=crop&auto=format",
  ],
  "washi-tape-sticker-bundle": [
    "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=800&fit=crop&auto=format",
  ],

  // ── GIFTS FOR HER ─────────────────────────────────────────────────────────────
  "silk-scarf-nairobi": [
    "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=600&h=800&fit=crop&auto=format",
  ],
  "leather-tote-bag": [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop&auto=format",
  ],
  "designer-sunglasses": [
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop&auto=format",
  ],
  "perfume-floral-mist": [
    "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&h=800&fit=crop&auto=format",
  ],

  // ── GIFTS FOR HIM ─────────────────────────────────────────────────────────────
  "classic-chronograph-watch": [
    "https://images.unsplash.com/photo-1523170335258-f87a2d362db5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1548614606-52b4451f994b?w=600&h=800&fit=crop&auto=format",
  ],
  "leather-card-holder": [
    "https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&auto=format",
  ],
  "aftershave-grooming-kit": [
    "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=600&h=800&fit=crop&auto=format",
  ],
  "bluetooth-speaker-portable": [
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=800&fit=crop&auto=format",
  ],
  "monogrammed-dopp-kit": [
    "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — NEWBORN ESSENTIALS ─────────────────────────────────────────────────
  "organic-swaddle-set-3": [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
  ],
  "newborn-onesie-bundle-5": [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-bib-collection-4": [
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
  ],
  "knitted-beanie-booties-set": [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-blanket-comforter-set": [
    "https://images.unsplash.com/photo-1580539021184-e9acce030b13?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — TOYS ───────────────────────────────────────────────────────────────
  "wooden-rattle-teether-set": [
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
  ],
  "sensory-play-mat-gym": [
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&h=800&fit=crop&auto=format",
  ],
  "soft-cloth-book-collection": [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
  ],
  "stacking-rings-shape-sorter": [
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&h=800&fit=crop&auto=format",
  ],
  "musical-crib-mobile-starry": [
    "https://images.unsplash.com/photo-1554139533-2fe0b0e6c8c1?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — FEEDING ────────────────────────────────────────────────────────────
  "baby-bottle-gift-set-3": [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
  ],
  "sippy-cup-snack-set": [
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
  ],
  "high-chair-feeding-bundle": [
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — BATH TIME ──────────────────────────────────────────────────────────
  "baby-bath-time-gift-set": [
    "https://images.unsplash.com/photo-1570554520913-ce2d62fef9a7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
  ],
  "hooded-towel-elephant-set": [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],
  "bath-toy-floating-animals": [
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — NURSERY ────────────────────────────────────────────────────────────
  "wooden-name-sign-custom": [
    "https://images.unsplash.com/photo-1554139533-2fe0b0e6c8c1?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],
  "nursery-wall-art-animals": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1554139533-2fe0b0e6c8c1?w=600&h=800&fit=crop&auto=format",
  ],
  "star-night-light-projector": [
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1554139533-2fe0b0e6c8c1?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — KEEPSAKES ──────────────────────────────────────────────────────────
  "baby-milestone-cards-20": [
    "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-memory-book-first-year": [
    "https://images.unsplash.com/photo-1476275466078-4cdc02a51f0f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-handprint-footprint-kit": [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-photo-frame-monthly": [
    "https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — CLOTHING ───────────────────────────────────────────────────────────
  "newborn-outfit-set-0-3mo": [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-summer-set-3-6mo": [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-winter-warm-set-6-12mo": [
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — HAMPERS ────────────────────────────────────────────────────────────
  "deluxe-baby-shower-hamper": [
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],
  "welcome-baby-gift-basket": [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515488042361-ee00e41b4f90?w=600&h=800&fit=crop&auto=format",
  ],
  "christening-gift-set": [
    "https://images.unsplash.com/photo-1523688471150-efdd09f4e7c6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — JEWELLERY ──────────────────────────────────────────────────────────
  "baby-silver-bracelet": [
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop&auto=format",
  ],
  "baby-necklace-birthstone": [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop&auto=format",
  ],

  // ── BABY — PRAM ───────────────────────────────────────────────────────────────
  "pram-footmuff-universal": [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1580539021184-e9acce030b13?w=600&h=800&fit=crop&auto=format",
  ],
  "pram-organiser-bag": [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop&auto=format",
  ],

  // ── FITNESS & GYM ─────────────────────────────────────────────────────────────
  "premium-yoga-mat": [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&h=800&fit=crop&auto=format",
  ],
  "insulated-water-bottle-750": [
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=800&fit=crop&auto=format",
  ],
  "gym-duffel-bag": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&auto=format",
  ],
  "resistance-bands-set-5": [
    "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=800&fit=crop&auto=format",
  ],
  "smart-fitness-tracker": [
    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format",
  ],
  "foam-roller-deep-tissue": [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=800&fit=crop&auto=format",
  ],

  // ── GAMING ────────────────────────────────────────────────────────────────────
  "wireless-gaming-headset": [
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=800&fit=crop&auto=format",
  ],
  "pro-gaming-controller": [
    "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop&auto=format",
  ],
  "jigsaw-puzzle-nairobi-1000": [
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1551269901-5c5e68149a6b?w=600&h=800&fit=crop&auto=format",
  ],
  "strategy-board-game-settlers": [
    "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&h=800&fit=crop&auto=format",
  ],
  "retro-arcade-console-500": [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&h=800&fit=crop&auto=format",
  ],
  "led-gaming-mousepad": [
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=800&fit=crop&auto=format",
  ],
  "card-game-bundle-exploding": [
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&h=800&fit=crop&auto=format",
  ],

  // ── MUSIC ─────────────────────────────────────────────────────────────────────
  "vinyl-record-greatest-hits": [
    "https://images.unsplash.com/photo-1603695823539-14d9cd93e0b6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1535712376408-8d79ba67e2f9?w=600&h=800&fit=crop&auto=format",
  ],
  "bluetooth-vinyl-turntable": [
    "https://images.unsplash.com/photo-1535712376408-8d79ba67e2f9?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1603695823539-14d9cd93e0b6?w=600&h=800&fit=crop&auto=format",
  ],
  "guitar-picks-capo-set": [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=800&fit=crop&auto=format",
  ],
  "studio-monitor-headphones": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop&auto=format",
  ],
  "music-gift-card-3000": [
    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop&auto=format",
  ],
  "kalimba-17-keys-thumb-piano": [
    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop&auto=format",
  ],

  // ── OUTDOOR & CAMPING ─────────────────────────────────────────────────────────
  "camping-hamper-adventure": [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=600&h=800&fit=crop&auto=format",
  ],
  "picnic-basket-set-4": [
    "https://images.unsplash.com/photo-1463123081488-789f998ac9c4?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&auto=format",
  ],
  "cooler-bag-30l-premium": [
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop&auto=format",
  ],
  "hammock-double-outdoor": [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&auto=format",
  ],
  "led-camping-lantern-2": [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=600&h=800&fit=crop&auto=format",
  ],
  "portable-bbq-set": [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop&auto=format",
  ],

  // ── HOME DECOR ────────────────────────────────────────────────────────────────
  "ceramic-vase-terracotta": [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481474046514-2e8b1fdafbdf?w=600&h=800&fit=crop&auto=format",
  ],
  "framed-art-african-sunset": [
    "https://images.unsplash.com/photo-1531345287543-18d562535cdf?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&auto=format",
  ],
  "woven-wall-hanging-macrame": [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1531345287543-18d562535cdf?w=600&h=800&fit=crop&auto=format",
  ],
  "decorative-mirror-sunburst": [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=800&fit=crop&auto=format",
  ],
  "throw-cushion-set-3": [
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop&auto=format",
  ],
  "wool-throw-blanket-kenya": [
    "https://images.unsplash.com/photo-1580539021184-e9acce030b13?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=800&fit=crop&auto=format",
  ],
  "scented-candle-set-3": [
    "https://images.unsplash.com/photo-1608181831688-8694dc2b29af?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=800&fit=crop&auto=format",
  ],
  "indoor-plant-pot-concrete": [
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=800&fit=crop&auto=format",
  ],

  // ── KITCHEN TOOLS ─────────────────────────────────────────────────────────────
  "chef-knife-set-3": [
    "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=800&fit=crop&auto=format",
  ],
  "end-grain-cutting-board": [
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop&auto=format",
  ],
  "spice-rack-bamboo-20": [
    "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=800&fit=crop&auto=format",
  ],
  "cast-iron-dutch-oven-5l": [
    "https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=800&fit=crop&auto=format",
  ],
  "baking-set-silicone-15": [
    "https://images.unsplash.com/photo-1486887396153-fa416526c108?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=800&fit=crop&auto=format",
  ],

  // ── WEDDING REGISTRY ──────────────────────────────────────────────────────────
  "his-hers-robe-set": [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800&fit=crop&auto=format",
  ],
  "kitchen-starter-set-newlyweds": [
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop&auto=format",
  ],
  "luxury-bedding-set-king": [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=800&fit=crop&auto=format",
  ],
  "personalised-photo-album-wedding": [
    "https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1476275466078-4cdc02a51f0f?w=600&h=800&fit=crop&auto=format",
  ],
  "wine-decanter-glasses-set": [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop&auto=format",
  ],
  "couples-experience-voucher-dinner": [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop&auto=format",
  ],

  // ── PROFESSIONAL APPRECIATION ─────────────────────────────────────────────────
  "teacher-appreciation-hamper": [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&h=800&fit=crop&auto=format",
  ],
  "nurse-appreciation-gift-box": [
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],
  "work-anniversary-gift-set": [
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],
  "boss-appreciation-gift": [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
  ],

  // ── SEASONAL ──────────────────────────────────────────────────────────────────
  "christmas-hamper-deluxe": [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],
  "christmas-advent-calendar-luxury": [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
  ],
  "valentines-gift-box-premium": [
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
  ],
  "valentines-couple-experience": [
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop&auto=format",
  ],
  "easter-hamper-family": [
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=800&fit=crop&auto=format",
  ],
  "easter-chocolate-egg-giant": [
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop&auto=format",
  ],
};

// ─── Core Fix Logic ────────────────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadAndReplace(
  slug: string,
  urls: string[]
): Promise<string | null> {
  const path = `seed/${slug}.webp`;

  for (const url of urls) {
    try {
      console.log(`    Fetching: ${url.substring(0, 80)}...`);
      const res = await fetch(url, {
        headers: { "User-Agent": "TouchGiftImageFix/1.0" },
        redirect: "follow",
      });
      if (!res.ok) {
        console.warn(`    HTTP ${res.status}`);
        continue;
      }

      const input = Buffer.from(await res.arrayBuffer());
      if (input.length < 2000) {
        console.warn(`    Skipping tiny response (${input.length} bytes)`);
        continue;
      }

      const webpBuffer = await sharp(input)
        .resize(600, 800, { fit: "cover" })
        .webp({ quality: 82 })
        .toBuffer();

      await supabase.storage.from(BUCKET).remove([path]);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) {
        console.warn(`    Storage upload failed: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.warn(`    Fetch error: ${err instanceof Error ? err.message : err}`);
      continue;
    }
  }

  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const slugs = Object.keys(CURATED_IMAGES);
  console.log(`\n=== TouchGift Image Fix ===`);
  console.log(`Fixing images for ${slugs.length} products...\n`);

  let fixed = 0;
  let failed = 0;
  let notFound = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const urls = CURATED_IMAGES[slug];
    const prefix = `[${i + 1}/${slugs.length}]`;

    console.log(`${prefix} Processing: ${slug}`);

    const { data: product } = await supabase
      .from("products")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (!product) {
      console.log(`  ⚠ Not in DB (will patch URL if seeded later): ${slug}`);
      notFound++;
      continue;
    }

    const imageUrl = await downloadAndReplace(slug, urls);

    if (!imageUrl) {
      console.error(`  ✗ All image sources failed: ${slug}`);
      failed++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", product.id);

    if (updateError) {
      console.error(`  ✗ DB update failed: ${updateError.message}`);
      failed++;
      continue;
    }

    console.log(`  ✓ Fixed: ${product.name}`);
    fixed++;

    if (i % 10 === 9) await sleep(1500);
  }

  console.log(`\n=== Done ===`);
  console.log(`  ✓ Fixed:     ${fixed}`);
  console.log(`  ⚠ Not in DB: ${notFound}`);
  console.log(`  ✗ Failed:    ${failed}`);
  console.log(`  Total:       ${slugs.length}`);
}

main();
