/**
 * Seeds ~200 products across new and under-served categories.
 * Downloads images from free stock sources, converts to WebP,
 * uploads to Supabase Storage, creates product rows + category links.
 *
 * Usage: npx tsx scripts/seed-catalog.ts
 *
 * Safe to re-run — matches on slug, uses upsert.
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

// ─── Types ────────────────────────────────────────────────────────

type ProductSeed = {
  name: string;
  slug: string;
  price: number;
  description: string;
  categorySlugs: string[];
  imageQuery: string; // search term for stock photos
  imageUrls: string[]; // fallback direct URLs
  isPersonalizable?: boolean;
};

// ─── Image Download ───────────────────────────────────────────────

const BUCKET = "products";
const CONCURRENCY = 3;

async function downloadAndStore(
  productId: string,
  urls: string[]
): Promise<string | null> {
  const path = `seed/${productId}.webp`;

  // Check if already uploaded
  const { data: list } = await supabase.storage
    .from(BUCKET)
    .list("seed", { search: `${productId}.webp` });
  if (list && list.length > 0) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "TouchGiftSeed/1.0" },
        redirect: "follow",
      });
      if (!res.ok) continue;

      const input = Buffer.from(await res.arrayBuffer());
      if (input.length < 1000) continue; // skip tiny/broken images

      const webpBuffer = await sharp(input)
        .resize(600, 800, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      await supabase.storage.from(BUCKET).remove([path]);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) {
        console.error(`Upload failed for ${productId}:`, error.message);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch {
      continue;
    }
  }

  console.warn(`  All image sources failed for ${productId}`);
  return null;
}

// ─── Product Data ─────────────────────────────────────────────────
// Realistic Kenyan market products with KSh pricing

const PRODUCTS: ProductSeed[] = [
  // ═══════════════════════════════════════════════════════════════
  // BEVERAGES — ALCOHOLIC (wine-whiskey-beverage-hampers)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Tusker Premium Gift Pack",
    slug: "tusker-premium-gift-pack",
    price: 2800,
    description: "4-pack of Kenya's iconic Tusker Premium Lager. Perfect for the beer lover who appreciates the classics.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "beer gift pack",
    imageUrls: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Johnnie Walker Red Label Hamper",
    slug: "johnnie-walker-red-hamper",
    price: 4500,
    description: "Johnnie Walker Red Label blended Scotch whisky paired with gourmet snacks in a luxury hamper box.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "whiskey hamper gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Captain Morgan Spiced Gift Set",
    slug: "captain-morgan-spiced-set",
    price: 3800,
    description: "Captain Morgan Original Spiced Gold with two branded glasses and premium mixers.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "rum gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Gordon's Gin & Tonic Set",
    slug: "gordons-gin-tonic-set",
    price: 3200,
    description: "Gordon's London Dry Gin with premium tonic water, lime, and ice glasses for the perfect G&T.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "gin tonic gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Bacardi Mojito Cocktail Kit",
    slug: "bacardi-mojito-kit",
    price: 3500,
    description: "Bacardi Superior rum with fresh mint, lime, sugar, and soda — everything for authentic mojitos at home.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "cocktail kit gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Savanna Dry Cider Gift Box",
    slug: "savanna-dry-cider-box",
    price: 2200,
    description: "6-pack of Savanna Dry Premium Cider. Crisp, refreshing, and perfect for warm Nairobi evenings.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "cider gift box",
    imageUrls: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Singleton 12 Year Old Hamper",
    slug: "singleton-12-year-hamper",
    price: 8500,
    description: "Singleton 12 Year Old Single Malt Scotch Whisky with artisan chocolates and a crystal glass.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "scotch whisky luxury",
    imageUrls: [
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Jameson Irish Whiskey Gift Set",
    slug: "jameson-gift-set",
    price: 5200,
    description: "Jameson Triple Distilled Irish Whiskey with two whiskey glasses and a leather coaster.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "irish whiskey gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Craft Beer Variety Pack",
    slug: "craft-beer-variety",
    price: 3000,
    description: "Selection of 8 craft beers from local Kenyan microbreweries. Discover new favourites.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "craft beer variety",
    imageUrls: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Martini Rosso & Vermouth Set",
    slug: "martini-rosso-set",
    price: 3600,
    description: "Martini Rosso and Martini Bianco with a mixing glass and bar tools for the home bartender.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "vermouth cocktail set",
    imageUrls: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Prosecco & Chocolate Box",
    slug: "prosecco-chocolate-box",
    price: 4200,
    description: "Sparkling Prosecco paired with a curated box of Belgian chocolates. Celebrate in style.",
    categorySlugs: ["wine-whiskey-beverage-hampers", "chocolates-sweets-gifts"],
    imageQuery: "prosecco chocolates gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Hennessy VS Cognac Gift",
    slug: "hennessy-vs-cognac",
    price: 6500,
    description: "Hennessy Very Special Cognac in a premium gift box with two cognac glasses.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "cognac gift luxury",
    imageUrls: [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Amarula Cream Liqueur Set",
    slug: "amarula-cream-set",
    price: 3400,
    description: "Amarula Cream Liqueur from Kenya's own marula fruit. Includes two glasses and chocolate truffles.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "cream liqueur gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Smirnoff Ice Party Pack",
    slug: "smirnoff-ice-party",
    price: 1800,
    description: "12-pack of Smirnoff Ice for parties and celebrations. Ready to serve.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "vodka ready to drink",
    imageUrls: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Chivas Regal 12 Year Hamper",
    slug: "chivas-regal-12-hamper",
    price: 9500,
    description: "Chivas Regal 12 Year Old Blended Scotch Whisky with premium nuts and dried fruits.",
    categorySlugs: ["wine-whiskey-beverage-hampers"],
    imageQuery: "premium scotch hamper",
    imageUrls: [
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BEVERAGES — NON-ALCOHOLIC (juices-tea-coffee-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Kenyan Purple Tea Gift Box",
    slug: "kenyan-purple-tea-gift",
    price: 1800,
    description: "Premium Kenyan purple tea leaves in a beautiful gift box. Rich in antioxidants, uniquely Kenyan.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "tea gift box",
    imageUrls: [
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "AA Coffee Sampler Pack",
    slug: "aa-coffee-sampler",
    price: 2200,
    description: "Three origins of Kenya AA coffee beans — Nyeri, Kirinyaga, and Murang'a. Whole bean, freshly roasted.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "coffee beans gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Mango Juice Hamper",
    slug: "mango-juice-hamper",
    price: 1500,
    description: "Selection of Kenyan mango juices and dried mango slices. Pure tropical goodness.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "mango juice gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Chai Masala Gift Set",
    slug: "chai-masala-set",
    price: 1600,
    description: "Artisan Kenyan chai masala blend with cinnamon, cardamom, ginger, and cloves. Includes a tea strainer.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "chai tea gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cold Pressed Juice Trio",
    slug: "cold-pressed-juice-trio",
    price: 1200,
    description: "Three bottles of cold-pressed juice: green detox, berry blast, and tropical sunrise. No sugar added.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "cold pressed juice bottles",
    imageUrls: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Espresso Machine Starter Kit",
    slug: "espresso-starter-kit",
    price: 4500,
    description: "Manual espresso maker with Kenyan coffee beans, milk frother, and two espresso cups.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "espresso kit gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Herbal Tea Collection",
    slug: "herbal-tea-collection",
    price: 1400,
    description: "Six varieties of herbal tea: hibiscus, chamomile, peppermint, rooibos, ginger, and lemongrass.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "herbal tea collection",
    imageUrls: [
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Fresh Fruit Basket & Juice",
    slug: "fresh-fruit-basket-juice",
    price: 2000,
    description: "Seasonal Kenyan fruits — mangoes, passion fruit, avocados — with a bottle of fresh-squeezed juice.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "fruit basket gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Gourmet Coffee & Biscotti Box",
    slug: "coffee-biscotti-box",
    price: 2500,
    description: "Ground Kenya AA coffee with handmade almond biscotti in an elegant gift box.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "coffee biscotti gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Smoothie Kit Gift Box",
    slug: "smoothie-kit-gift",
    price: 1800,
    description: "Freeze-dried fruit blends, protein powder, and a recipe book. Just add liquid and blend.",
    categorySlugs: ["juices-tea-coffee-gifts"],
    imageQuery: "smoothie kit gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FOOD & TREATS (chocolates-sweets-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Belgian Chocolate Truffle Box",
    slug: "belgian-chocolate-truffles",
    price: 2800,
    description: "24 handcrafted Belgian chocolate truffles in a luxury gift box. Milk, dark, and white varieties.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "chocolate truffle box",
    imageUrls: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Artisan Cookie Jar Gift",
    slug: "artisan-cookie-jar",
    price: 1500,
    description: "Handmade cookies — chocolate chip, oatmeal raisin, and shortbread — in a reusable cookie jar.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "cookie jar gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Tropical Dried Fruit Platter",
    slug: "tropical-dried-fruit",
    price: 1200,
    description: "Dried mango, pineapple, coconut, and passion fruit. No preservatives, naturally sweet.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "dried fruit gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Chocolate-Covered Strawberries",
    slug: "chocolate-strawberries",
    price: 2200,
    description: "Fresh strawberries dipped in Belgian milk and dark chocolate. Same-day delivery.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "chocolate strawberries",
    imageUrls: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Gourmet Popcorn Tin",
    slug: "gourmet-popcorn-tin",
    price: 900,
    description: "Three flavours of gourmet popcorn: caramel, cheese, and truffle salt. In a collectible tin.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "gourmet popcorn gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Kenyan Honey & Nut Basket",
    slug: "honey-nut-basket",
    price: 1800,
    description: "Raw Kenyan honey, roasted macadamia nuts, cashews, and almonds in a woven basket.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "honey nut gift basket",
    imageUrls: [
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Macaron Assortment Box",
    slug: "macaron-assortment",
    price: 2500,
    description: "16 French macarons in assorted flavours: rose, pistachio, salted caramel, raspberry, and vanilla.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "macaron gift box",
    imageUrls: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Fudge Collection Tin",
    slug: "fudge-collection-tin",
    price: 1100,
    description: "Assorted homemade fudge: vanilla, chocolate, coffee, and salted caramel. In a vintage tin.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "fudge gift tin",
    imageUrls: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Chocolate Hamper Deluxe",
    slug: "chocolate-hamper-deluxe",
    price: 4500,
    description: "Premium chocolate selection: Lindt, Toblerone, Ferrero Rocher, and artisan bars in a wicker hamper.",
    categorySlugs: ["chocolates-sweets-gifts", "hampers-gift-sets"],
    imageQuery: "chocolate hamper luxury",
    imageUrls: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Candy Jar Rainbow Mix",
    slug: "candy-jar-rainbow",
    price: 800,
    description: "Colourful candy mix — gummies, lollipops, jelly beans, and sour belts — in a glass jar.",
    categorySlugs: ["chocolates-sweets-gifts"],
    imageQuery: "candy jar gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PLANTS (plants-succulents)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Succulent Trio Gift Set",
    slug: "succulent-trio-set",
    price: 1800,
    description: "Three beautiful succulents in ceramic pots — echeveria, haworthia, and sedum. Low maintenance, high style.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "succulent gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Lucky Bamboo Plant",
    slug: "lucky-bamboo-plant",
    price: 1200,
    description: "Three-stem lucky bamboo in a glass vase with decorative stones. Symbol of good fortune.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "lucky bamboo gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Herb Garden Starter Kit",
    slug: "herb-garden-kit",
    price: 2200,
    description: "Grow your own basil, rosemary, thyme, and mint. Includes seeds, soil, and three planters.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "herb garden kit",
    imageUrls: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Peace Lily Indoor Plant",
    slug: "peace-lily-plant",
    price: 1500,
    description: "Elegant peace lily in a decorative pot. Purifies air and blooms indoors. Easy care.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "peace lily plant gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Desert Rose Arrangement",
    slug: "desert-rose-arrangement",
    price: 2800,
    description: "Stunning desert rose (adenium) in a handcrafted ceramic pot. Vibrant blooms, long-lasting.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "desert rose plant",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cactus Collection",
    slug: "cactus-collection",
    price: 1600,
    description: "Set of four mini cacti in terracotta pots. Perfect for desk or windowsill. Almost impossible to kill.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "cactus collection gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Money Plant in Macrame Hanger",
    slug: "money-plant-macrame",
    price: 2000,
    description: "Trailing money plant (pothos) in a handwoven macrame hanging planter. Adds life to any room.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "money plant hanging",
    imageUrls: [
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Aloe Vera Gift Pot",
    slug: "aloe-vera-gift",
    price: 900,
    description: "实用 aloe vera plant in a stylish pot. Soothing gel inside, beautiful green outside.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "aloe vera plant gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Terrarium Workshop Kit",
    slug: "terrarium-workshop-kit",
    price: 3500,
    description: "Build your own terrarium: glass dome, succulents, moss, stones, and charcoal. Instructions included.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "terrarium kit gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Orchid in Ceramic Pot",
    slug: "orchid-ceramic-pot",
    price: 2500,
    description: "Phalaenopsis orchid in a premium ceramic pot. Elegant blooms lasting 2-3 months.",
    categorySlugs: ["plants-succulents"],
    imageQuery: "orchid gift plant",
    imageUrls: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BOOKS & MEDIA (books-magazines-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "African Literature Collection",
    slug: "african-literature-collection",
    price: 2500,
    description: "Three acclaimed African novels: Things Fall Apart, Half of a Yellow Sun, and The River Between.",
    categorySlugs: ["books-magazines-gifts"],
    imageQuery: "african literature books",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Leather Journal & Pen Set",
    slug: "leather-journal-pen",
    price: 1800,
    description: "Hand-stitched leather journal with unlined pages and a brass fountain pen. For the writer at heart.",
    categorySlugs: ["books-magazines-gifts", "personalized-journals-notebooks"],
    imageQuery: "leather journal gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Coffee Table Photography Book",
    slug: "coffee-table-photo-book",
    price: 3200,
    description: "Stunning photography book showcasing Kenya's wildlife, landscapes, and cultures. Large format.",
    categorySlugs: ["books-magazines-gifts"],
    imageQuery: "photography coffee table book",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cookbook & Spice Set",
    slug: "cookbook-spice-set",
    price: 2800,
    description: "East African cookbook with 6 signature spice blends. Learn to cook like a local.",
    categorySlugs: ["books-magazines-gifts"],
    imageQuery: "cookbook gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Mindfulness Journal",
    slug: "mindfulness-journal",
    price: 1200,
    description: "Guided mindfulness journal with daily prompts, gratitude sections, and reflection pages.",
    categorySlugs: ["books-magazines-gifts"],
    imageQuery: "mindfulness journal",
    imageUrls: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Children's Story Book Collection",
    slug: "childrens-story-collection",
    price: 1500,
    description: "Five beautifully illustrated African children's stories. Perfect for bedtime reading.",
    categorySlugs: ["books-magazines-gifts"],
    imageQuery: "children books gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Self-Help Book Bundle",
    slug: "self-help-bundle",
    price: 2200,
    description: "Three bestsellers: Atomic Habits, The 48 Laws of Power, and Thinking, Fast and Slow.",
    categorySlugs: ["books-magazines-gifts"],
    imageQuery: "self help books bundle",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Wine & Book Pairing Box",
    slug: "wine-book-pairing",
    price: 4000,
    description: "A bottle of South African wine paired with a hand-selected novel. The ultimate evening in.",
    categorySlugs: ["books-magazines-gifts", "wine-whiskey-beverage-hampers"],
    imageQuery: "wine and book gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // EXPERIENCE GIFTS (spa-experience-vouchers, dining-experience-vouchers)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Luxury Spa Day Voucher",
    slug: "luxury-spa-day-voucher",
    price: 8000,
    description: "Full day at a premium Nairobi spa: massage, facial, manicure, and lunch. Valid for 3 months.",
    categorySlugs: ["spa-experience-vouchers"],
    imageQuery: "spa day voucher gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Couples Massage Experience",
    slug: "couples-massage-experience",
    price: 12000,
    description: "60-minute couples massage at a luxury Nairobi spa. Includes champagne and chocolates.",
    categorySlugs: ["spa-experience-vouchers"],
    imageQuery: "couples massage spa",
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Fine Dining Voucher — KSh 5,000",
    slug: "fine-dining-voucher-5k",
    price: 5000,
    description: "Voucher for Nairobi's top restaurants. Choose from Carnivore, Talisman, or About Thyme.",
    categorySlugs: ["dining-experience-vouchers"],
    imageQuery: "fine dining restaurant gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Wine Tasting Experience",
    slug: "wine-tasting-experience",
    price: 6500,
    description: "Guided wine tasting for two at a Nairobi wine bar. Sample 6 wines with cheese pairing.",
    categorySlugs: ["dining-experience-vouchers", "wine-whiskey-beverage-hampers"],
    imageQuery: "wine tasting experience",
    imageUrls: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Hot Air Balloon Safari",
    slug: "hot-air-balloon-safari",
    price: 35000,
    description: "Sunrise hot air balloon ride over the Maasai Mara. Includes bush breakfast and champagne.",
    categorySlugs: ["spa-experience-vouchers"],
    imageQuery: "hot air balloon safari",
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cooking Class Voucher",
    slug: "cooking-class-voucher",
    price: 4500,
    description: "Hands-on cooking class for two. Learn to make Kenyan, Italian, or Thai cuisine.",
    categorySlugs: ["dining-experience-vouchers"],
    imageQuery: "cooking class gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS (monthly-subscription-boxes)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Monthly Coffee Subscription — 3 Months",
    slug: "coffee-subscription-3mo",
    price: 4500,
    description: "Three months of freshly roasted Kenyan AA coffee delivered monthly. 250g bags, whole bean.",
    categorySlugs: ["monthly-subscription-boxes"],
    imageQuery: "coffee subscription box",
    imageUrls: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Wine of the Month — 3 Bottles",
    slug: "wine-monthly-3-bottles",
    price: 6000,
    description: "Three hand-selected wines delivered monthly. Red, white, and rosé from South African vineyards.",
    categorySlugs: ["monthly-subscription-boxes", "wine-whiskey-beverage-hampers"],
    imageQuery: "wine subscription box",
    imageUrls: [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Self-Care Box — Monthly",
    slug: "self-care-monthly-box",
    price: 3500,
    description: "Monthly surprise box of self-care essentials: bath bombs, candles, face masks, and teas.",
    categorySlugs: ["monthly-subscription-boxes", "wellness-self-care-hampers"],
    imageQuery: "self care subscription box",
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Kids Activity Box — 3 Months",
    slug: "kids-activity-box-3mo",
    price: 5400,
    description: "Three months of educational activity boxes for kids aged 4-10. Crafts, puzzles, and experiments.",
    categorySlugs: ["monthly-subscription-boxes"],
    imageQuery: "kids activity subscription",
    imageUrls: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Book Club Subscription — 3 Books",
    slug: "book-club-subscription",
    price: 4000,
    description: "Three curated books delivered monthly. Choose from fiction, non-fiction, or African literature.",
    categorySlugs: ["monthly-subscription-boxes", "books-magazines-gifts"],
    imageQuery: "book subscription box",
    imageUrls: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PET GIFTS (pet-accessories-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Dog Lover Gift Box",
    slug: "dog-lover-gift-box",
    price: 2500,
    description: "Treats, toys, and a bandana for your furry friend. Includes a personalised dog tag.",
    categorySlugs: ["pet-accessories-gifts"],
    imageQuery: "dog gift box",
    imageUrls: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cat Pamper Pack",
    slug: "cat-pamper-pack",
    price: 1800,
    description: "Catnip toys, gourmet treats, and a cozy cat blanket. Your cat deserves it.",
    categorySlugs: ["pet-accessories-gifts"],
    imageQuery: "cat gift pack",
    imageUrls: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Pet Portrait Commission",
    slug: "pet-portrait-commission",
    price: 3500,
    description: "Custom illustrated portrait of your pet from a photo. Digital + printed copy.",
    categorySlugs: ["pet-accessories-gifts"],
    imageQuery: "pet portrait gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Premium Dog Leash & Collar Set",
    slug: "premium-dog-leash-set",
    price: 2200,
    description: "Leather leash and collar set with brass hardware. Available in brown or black.",
    categorySlugs: ["pet-accessories-gifts"],
    imageQuery: "dog leash collar gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cat Tree Condo",
    slug: "cat-tree-condo",
    price: 5500,
    description: "Multi-level cat tree with scratching posts, cozy hideaway, and dangling toys.",
    categorySlugs: ["pet-accessories-gifts"],
    imageQuery: "cat tree gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FLOWERS (fill out under-served category)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Classic Red Rose Bouquet — 24 Stems",
    slug: "classic-red-roses-24",
    price: 3500,
    description: "24 long-stem red roses in a luxury gift box. The timeless expression of love.",
    categorySlugs: ["flowers-aromatics", "fresh-flower-bouquets"],
    imageQuery: "red rose bouquet luxury",
    imageUrls: [
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Sunflower Happiness Bunch",
    slug: "sunflower-bunch",
    price: 2200,
    description: "Bright sunflowers with baby's breath and eucalyptus. Pure joy in a bouquet.",
    categorySlugs: ["flowers-aromatics", "fresh-flower-bouquets"],
    imageQuery: "sunflower bouquet",
    imageUrls: [
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Mixed Wildflower Arrangement",
    slug: "wildflower-arrangement",
    price: 2800,
    description: "Seasonal wildflowers in a hand-tied wrap. Unique, colourful, and full of character.",
    categorySlugs: ["flowers-aromatics", "fresh-flower-bouquets"],
    imageQuery: "wildflower bouquet",
    imageUrls: [
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Elegant Lily & Rose Combo",
    slug: "lily-rose-combo",
    price: 3200,
    description: "White lilies and pink roses in a crystal vase. Sophisticated and fragrant.",
    categorySlugs: ["flowers-aromatics", "fresh-flower-bouquets"],
    imageQuery: "lily rose bouquet",
    imageUrls: [
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Pastel Peony Bunch",
    slug: "pastel-peony-bunch",
    price: 4000,
    description: "Soft pink and white peonies. Romantic, luxurious, and available seasonally.",
    categorySlugs: ["flowers-aromatics", "fresh-flower-bouquets"],
    imageQuery: "peony bouquet pastel",
    imageUrls: [
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Condolence White Flower Wreath",
    slug: "condolence-wreath",
    price: 4500,
    description: "White floral wreath with lilies, roses, and greenery. A respectful tribute.",
    categorySlugs: ["flowers-aromatics", "fresh-flower-bouquets"],
    imageQuery: "condolence flower wreath",
    imageUrls: [
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CANDLES & HOME (candle-holders-lanterns, home-lifestyle)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Soy Candle Trio — Signature Scents",
    slug: "soy-candle-trio",
    price: 1800,
    description: "Three hand-poured soy candles: vanilla, lavender, and sandalwood. 40-hour burn time each.",
    categorySlugs: ["candle-holders-lanterns"],
    imageQuery: "scented candle gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Luxury Candle & Diffuser Set",
    slug: "luxury-candle-diffuser",
    price: 3200,
    description: "Premium scented candle with reed diffuser in matching fragrance. Long-lasting home fragrance.",
    categorySlugs: ["candle-holders-lanterns"],
    imageQuery: "luxury candle diffuser",
    imageUrls: [
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Decorative Lantern & Candle",
    slug: "decorative-lantern-candle",
    price: 2500,
    description: "Moroccan-style metal lantern with pillar candle. Creates warm ambient lighting.",
    categorySlugs: ["candle-holders-lanterns"],
    imageQuery: "decorative lantern candle",
    imageUrls: [
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cozy Throw Blanket",
    slug: "cozy-throw-blanket",
    price: 2800,
    description: "Ultra-soft fleece throw blanket in neutral tones. Perfect for movie nights.",
    categorySlugs: ["home-lifestyle"],
    imageQuery: "cozy throw blanket gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Artisan Ceramic Mug Set",
    slug: "artisan-mug-set",
    price: 1600,
    description: "Four handmade ceramic mugs in earthy tones. Each one unique, each one beautiful.",
    categorySlugs: ["home-lifestyle", "name-printed-mugs-drinkware"],
    imageQuery: "artisan ceramic mugs",
    imageUrls: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // WELLNESS & SPA (wellness-self-care-hampers)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Bath Bomb Gift Set — 12 Pieces",
    slug: "bath-bomb-set-12",
    price: 1500,
    description: "12 handmade bath bombs in assorted scents. Fizz, fragrance, and fun.",
    categorySlugs: ["wellness-self-care-hampers"],
    imageQuery: "bath bomb gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Luxury Spa Hamper",
    slug: "luxury-spa-hamper",
    price: 5500,
    description: "Robe, slippers, bath salts, body lotion, face mask, and a scented candle. Full pamper experience.",
    categorySlugs: ["wellness-self-care-hampers"],
    imageQuery: "luxury spa hamper gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Essential Oil Diffuser Set",
    slug: "essential-oil-diffuser",
    price: 3800,
    description: "Ultrasonic diffuser with five essential oils: lavender, eucalyptus, peppermint, lemon, and tea tree.",
    categorySlugs: ["wellness-self-care-hampers"],
    imageQuery: "essential oil diffuser gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Yoga Mat & Block Set",
    slug: "yoga-mat-block-set",
    price: 3200,
    description: "Premium non-slip yoga mat with two cork blocks and a carrying strap. Namaste.",
    categorySlugs: ["wellness-self-care-hampers"],
    imageQuery: "yoga mat gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Skincare Routine Set",
    slug: "skincare-routine-set",
    price: 4200,
    description: "Complete skincare set: cleanser, toner, serum, moisturiser, and SPF. For her daily ritual.",
    categorySlugs: ["wellness-self-care-hampers"],
    imageQuery: "skincare gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PERSONALISED (personalized-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Custom Name Necklace",
    slug: "custom-name-necklace",
    price: 3500,
    description: "Gold-plated necklace with your name or loved one's name. Elegant and personal.",
    categorySlugs: ["personalized-gifts"],
    imageQuery: "name necklace gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Photo Canvas Print",
    slug: "photo-canvas-print",
    price: 2500,
    description: "Your favourite photo printed on premium canvas. Choose size: A4, A3, or A2.",
    categorySlugs: ["personalized-gifts"],
    imageQuery: "photo canvas gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Engraved Wallet",
    slug: "engraved-wallet",
    price: 2800,
    description: "Genuine leather wallet with custom initials or message engraved. For him or her.",
    categorySlugs: ["personalized-gifts", "wallets-cardholders"],
    imageQuery: "engraved leather wallet",
    imageUrls: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Custom Star Map Print",
    slug: "custom-star-map",
    price: 2200,
    description: "The night sky on your special date — anniversary, birthday, or first meeting. Beautifully framed.",
    categorySlugs: ["personalized-gifts"],
    imageQuery: "star map print gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Personalised Coffee Mug",
    slug: "personalised-coffee-mug",
    price: 1200,
    description: "Ceramic mug with your photo or message. Dishwasher safe. Start every morning with a smile.",
    categorySlugs: ["personalized-gifts", "name-printed-mugs-drinkware"],
    imageQuery: "personalised mug gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Customised Phone Case",
    slug: "customised-phone-case",
    price: 1500,
    description: "Slim phone case with your photo or design. Fits iPhone and Samsung models.",
    categorySlugs: ["personalized-gifts"],
    imageQuery: "custom phone case gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HAMPERS (hampers-gift-sets, customizable-hamper-kits)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Executive Hamper",
    slug: "executive-hamper",
    price: 8500,
    description: "Premium hamper with wine, cheese, crackers, nuts, dried fruits, and chocolate. For the boss.",
    categorySlugs: ["hampers-gift-sets"],
    imageQuery: "executive gift hamper",
    imageUrls: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "New Baby Hamper",
    slug: "new-baby-hamper",
    price: 3500,
    description: "Onesie, bib, soft toy, baby blanket, and a card. Everything a new parent needs.",
    categorySlugs: ["hampers-gift-sets"],
    imageQuery: "new baby hamper gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Get Well Soon Hamper",
    slug: "get-well-hamper",
    price: 2800,
    description: "Soup, herbal tea, honey, a cosy socks, and a feel-good book. For recovery mode.",
    categorySlugs: ["hampers-gift-sets", "wellness-self-care-hampers"],
    imageQuery: "get well hamper",
    imageUrls: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Thank You Hamper",
    slug: "thank-you-hamper",
    price: 3000,
    description: "Wine, chocolates, and a heartfelt thank-you card. Show your appreciation in style.",
    categorySlugs: ["hampers-gift-sets"],
    imageQuery: "thank you hamper gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Gourmet Food Hamper",
    slug: "gourmet-food-hamper",
    price: 5500,
    description: "Artisan cheese, crackers, olive oil, chutney, dried fruits, and nuts in a wicker basket.",
    categorySlugs: ["hampers-gift-sets"],
    imageQuery: "gourmet food hamper",
    imageUrls: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // JEWELLERY (jewelry-fine-pieces, handmade-jewelry)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Gold Heart Pendant Necklace",
    slug: "gold-heart-pendant",
    price: 4500,
    description: "18k gold-plated heart pendant on a delicate chain. Classic romance.",
    categorySlugs: ["jewelry-fine-pieces"],
    imageQuery: "gold heart necklace gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "African Bead Bracelet Set",
    slug: "african-bead-bracelets",
    price: 1800,
    description: "Three handcrafted Maasai bead bracelets. Bold colours, authentic craftsmanship.",
    categorySlugs: ["handmade-jewelry"],
    imageQuery: "african bead bracelet",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Silver Hoop Earrings",
    slug: "silver-hoop-earrings",
    price: 2200,
    description: "Sterling silver hoop earrings. Lightweight, elegant, everyday wear.",
    categorySlugs: ["jewelry-fine-pieces"],
    imageQuery: "silver hoop earrings gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Birthstone Ring",
    slug: "birthstone-ring",
    price: 3500,
    description: "Custom birthstone ring in rose gold. Choose your month, wear your story.",
    categorySlugs: ["jewelry-fine-pieces"],
    imageQuery: "birthstone ring gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cowrie Shell Anklet",
    slug: "cowrie-shell-anklet",
    price: 1200,
    description: "Delicate anklet with real cowrie shells and gold-plated beads. Beach vibes.",
    categorySlugs: ["handmade-jewelry"],
    imageQuery: "cowrie shell anklet",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // STATIONERY (personalized-journals-notebooks, planners-premium-stationery)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Premium Planner 2025",
    slug: "premium-planner-2025",
    price: 1800,
    description: "Leather-bound weekly planner with tabs, pen loop, and bookmark. Start the year organised.",
    categorySlugs: ["planners-premium-stationery"],
    imageQuery: "premium planner gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Fountain Pen & Ink Set",
    slug: "fountain-pen-ink-set",
    price: 2500,
    description: "Classic fountain pen with two bottles of ink. For the love of handwriting.",
    categorySlugs: ["personalized-journals-notebooks"],
    imageQuery: "fountain pen gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Washi Tape & Sticker Bundle",
    slug: "washi-tape-sticker-bundle",
    price: 800,
    description: "20 rolls of washi tape and 500 stickers for journaling, scrapbooking, and crafts.",
    categorySlugs: ["planners-premium-stationery"],
    imageQuery: "washi tape craft gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // GIFTS FOR HER — fill out
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Silk Scarf — Nairobi Print",
    slug: "silk-scarf-nairobi",
    price: 2800,
    description: "Hand-printed silk scarf with Nairobi skyline motif. Lightweight luxury.",
    categorySlugs: ["scarves-wraps-shawls"],
    imageQuery: "silk scarf gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Leather Tote Bag",
    slug: "leather-tote-bag",
    price: 5500,
    description: "Full-grain leather tote in tan. Spacious, elegant, built to last years.",
    categorySlugs: ["handbags-clutches-purses"],
    imageQuery: "leather tote bag gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38ef6d218?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Designer Sunglasses",
    slug: "designer-sunglasses",
    price: 4200,
    description: "Polarised sunglasses with UV protection. Stylish frame, crystal-clear vision.",
    categorySlugs: ["sunglasses-fashion-essentials"],
    imageQuery: "designer sunglasses gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Perfume — Floral Mist",
    slug: "perfume-floral-mist",
    price: 3800,
    description: "Light floral perfume with notes of jasmine, rose, and peony. 50ml EDP.",
    categorySlugs: ["luxury-perfumes-fragrance-collection"],
    imageQuery: "floral perfume gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // GIFTS FOR HIM — fill out
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Classic Chronograph Watch",
    slug: "classic-chronograph-watch",
    price: 8500,
    description: "Stainless steel chronograph watch with leather strap. Timeless style.",
    categorySlugs: ["watches-timepieces"],
    imageQuery: "chronograph watch gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Leather Card Holder",
    slug: "leather-card-holder",
    price: 1800,
    description: "Slim leather card holder with RFID protection. Holds 6 cards and cash.",
    categorySlugs: ["wallets-cardholders"],
    imageQuery: "leather card holder gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Aftershave & Grooming Kit",
    slug: "aftershave-grooming-kit",
    price: 3200,
    description: "Aftershave balm, face wash, moisturiser, and beard oil. The complete grooming ritual.",
    categorySlugs: ["wellness-self-care-hampers", "luxury-perfumes-fragrance-collection"],
    imageQuery: "grooming kit gift men",
    imageUrls: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Bluetooth Speaker — Portable",
    slug: "bluetooth-speaker-portable",
    price: 3500,
    description: "Waterproof portable Bluetooth speaker. 12-hour battery, rich bass, rugged design.",
    categorySlugs: ["luxury-kitchen-accessories", "home-lifestyle"],
    imageQuery: "bluetooth speaker gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Monogrammed Dopp Kit",
    slug: "monogrammed-dopp-kit",
    price: 2500,
    description: "Canvas and leather toiletry bag with custom monogram. For the man who travels.",
    categorySlugs: ["monogrammed-wallets-accessories", "personalized-gifts"],
    imageQuery: "dopp kit toiletry bag",
    imageUrls: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — NEWBORN ESSENTIALS (newborn-essentials, baby-shower-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Organic Cotton Swaddle Set — 3 Pack",
    slug: "organic-swaddle-set-3",
    price: 1800,
    description: "Three muslin swaddle blankets in soft pastel prints. 100% organic cotton, breathable.",
    categorySlugs: ["newborn-essentials", "baby-shower-gifts"],
    imageQuery: "baby swaddle set gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Newborn Onesie Bundle — 5 Pack",
    slug: "newborn-onesie-bundle-5",
    price: 2200,
    description: "Five organic cotton onesies in neutral colours. Envelope neckline for easy changes.",
    categorySlugs: ["newborn-essentials", "baby-shower-gifts"],
    imageQuery: "baby onesie bundle",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Bib Collection — 4 Pack",
    slug: "baby-bib-collection-4",
    price: 1200,
    description: "Four waterproof bibs with food catch pockets. Machine washable, colourful prints.",
    categorySlugs: ["newborn-essentials", "baby-feeding-sets"],
    imageQuery: "baby bibs gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Knitted Baby Beanie & Booties Set",
    slug: "knitted-beanie-booties-set",
    price: 1500,
    description: "Hand-knitted wool beanie and booties set. Warm, soft, and adorable for newborns.",
    categorySlugs: ["newborn-essentials", "baby-shower-gifts"],
    imageQuery: "knitted baby beanie booties",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Blanket & Comforter Set",
    slug: "baby-blanket-comforter-set",
    price: 2500,
    description: "Plush fleece blanket with matching stuffed animal comforter. Hypoallergenic filling.",
    categorySlugs: ["newborn-essentials", "baby-shower-gifts"],
    imageQuery: "baby blanket comforter set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — TOYS 0-12MO (kids-baby-gifts, early-education-toys, baby-sensory-toys)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Wooden Rattle & Teether Set",
    slug: "wooden-rattle-teether-set",
    price: 1200,
    description: "Three natural wood rattles and teethers. Non-toxic, smooth edges, Montessori-inspired.",
    categorySlugs: ["baby-sensory-toys", "kids-baby-gifts"],
    imageQuery: "wooden baby rattle teether",
    imageUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Sensory Play Mat — Activity Gym",
    slug: "sensory-play-mat-gym",
    price: 4500,
    description: "Foldable play mat with hanging toys, mirror, and crinkle pages. Develops motor skills.",
    categorySlugs: ["baby-sensory-toys", "early-education-toys"],
    imageQuery: "baby activity gym play mat",
    imageUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Soft Cloth Book Collection — 5 Books",
    slug: "soft-cloth-book-collection",
    price: 1500,
    description: "Five crinkle cloth books with bright colours and textures. Safe for chewing, washable.",
    categorySlugs: ["baby-sensory-toys", "early-education-toys"],
    imageQuery: "baby cloth books soft",
    imageUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Stacking Rings & Shape Sorter",
    slug: "stacking-rings-shape-sorter",
    price: 1800,
    description: "Classic wooden stacking rings with shape sorting cube. Teaches colours, shapes, and sizes.",
    categorySlugs: ["early-education-toys", "kids-baby-gifts"],
    imageQuery: "baby stacking toy wooden",
    imageUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Musical Crib Mobile — Starry Night",
    slug: "musical-crib-mobile-starry",
    price: 3200,
    description: "Rotating crib mobile with stars and moon. Plays lullabies, projects soft light.",
    categorySlugs: ["baby-sensory-toys", "nursery-decor"],
    imageQuery: "baby crib mobile musical",
    imageUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — FEEDING SETS (baby-feeding-sets)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Baby Bottle Gift Set — 3 Pack",
    slug: "baby-bottle-gift-set-3",
    price: 2500,
    description: "Three anti-colic bottles with different nipple flows. BPA-free, easy to clean.",
    categorySlugs: ["baby-feeding-sets", "baby-shower-gifts"],
    imageQuery: "baby bottle gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Sippy Cup & Snack Set",
    slug: "sippy-cup-snack-set",
    price: 1800,
    description: "Training sippy cup, snack container, and spoon set. Drop-proof, dishwasher safe.",
    categorySlugs: ["baby-feeding-sets", "kids-baby-gifts"],
    imageQuery: "baby sippy cup snack set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "High Chair Feeding Bundle",
    slug: "high-chair-feeding-bundle",
    price: 3500,
    description: "Suction bowl, plate, cup, bib, and utensils set. Everything for mealtime.",
    categorySlugs: ["baby-feeding-sets", "kids-baby-gifts"],
    imageQuery: "baby feeding set high chair",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — BATH TIME (baby-bath-time, kids-baby-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Baby Bath Time Gift Set",
    slug: "baby-bath-time-gift-set",
    price: 2200,
    description: "Shampoo, body wash, lotion, rubber duck, and hooded towel. Tear-free formula.",
    categorySlugs: ["baby-bath-time", "baby-shower-gifts"],
    imageQuery: "baby bath gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Hooded Towel & Washcloth Set — Elephant",
    slug: "hooded-towel-elephant-set",
    price: 1800,
    description: "Super-absorbent hooded towel with elephant face and matching washcloths. Organic cotton.",
    categorySlugs: ["baby-bath-time", "kids-baby-gifts"],
    imageQuery: "baby hooded towel elephant",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Bath Toy Set — Floating Animals",
    slug: "bath-toy-floating-animals",
    price: 1200,
    description: "Six floating animal figures with a mesh storage bag. Mould-free, easy to dry.",
    categorySlugs: ["baby-bath-time", "kids-baby-gifts"],
    imageQuery: "baby bath toys floating",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — NURSERY DECOR (nursery-decor, baby-room-accessories)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Wooden Name Sign — Custom",
    slug: "wooden-name-sign-custom",
    price: 3500,
    description: "Personalised wooden name sign for nursery wall. Choose font and paint colour.",
    categorySlugs: ["nursery-decor", "personalized-gifts"],
    imageQuery: "baby nursery name sign wooden",
    imageUrls: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Nursery Wall Art Set — Animals",
    slug: "nursery-wall-art-animals",
    price: 2200,
    description: "Three framed animal prints (lion, elephant, giraffe). Watercolour style, A4 size.",
    categorySlugs: ["nursery-decor", "baby-room-accessories"],
    imageQuery: "nursery wall art animals",
    imageUrls: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Star Night Light Projector",
    slug: "star-night-light-projector",
    price: 2800,
    description: "Projects stars and moon on ceiling. Rotates slowly, plays white noise, timer function.",
    categorySlugs: ["nursery-decor", "baby-sensory-toys"],
    imageQuery: "baby night light projector stars",
    imageUrls: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — KEEPSAKES (baby-keepsake-gifts, photo-frames-keepsakes)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Baby Milestone Cards — 20 Cards",
    slug: "baby-milestone-cards-20",
    price: 1200,
    description: "20 illustrated milestone cards: first smile, first steps, first tooth, and more.",
    categorySlugs: ["baby-keepsake-gifts", "baby-shower-gifts"],
    imageQuery: "baby milestone cards",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Memory Book — First Year",
    slug: "baby-memory-book-first-year",
    price: 2500,
    description: "Hardcover memory book with pages for photos, footprints, and memories from birth to 1 year.",
    categorySlugs: ["baby-keepsake-gifts", "baby-shower-gifts"],
    imageQuery: "baby memory book first year",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Handprint & Footprint Kit",
    slug: "baby-handprint-footprint-kit",
    price: 1800,
    description: "Non-toxic ink pads and clay kit for making handprint and footprint keepsakes.",
    categorySlugs: ["baby-keepsake-gifts", "personalized-gifts"],
    imageQuery: "baby handprint footprint kit",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Photo Frame — First Year Monthly",
    slug: "baby-photo-frame-monthly",
    price: 2200,
    description: "12-frame collage with month markers (1-12). Display baby's growth journey.",
    categorySlugs: ["photo-frames-keepsakes", "baby-keepsake-gifts"],
    imageQuery: "baby photo frame monthly",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — CLOTHING SETS (baby-clothing-sets, kids-baby-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Newborn Outfit Set — 0-3 Months",
    slug: "newborn-outfit-set-0-3mo",
    price: 2500,
    description: "Three-piece set: onesie, pants, and beanie. Organic cotton, snap closures.",
    categorySlugs: ["baby-clothing-sets", "kids-baby-gifts"],
    imageQuery: "newborn outfit set baby",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Summer Clothes Set — 3-6 Months",
    slug: "baby-summer-set-3-6mo",
    price: 2200,
    description: "Lightweight romper, sun hat, and socks. Breathable fabric for warm weather.",
    categorySlugs: ["baby-clothing-sets", "kids-baby-gifts"],
    imageQuery: "baby summer clothes set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Winter Warm Set — 6-12 Months",
    slug: "baby-winter-warm-set-6-12mo",
    price: 3000,
    description: "Fleece-lined jacket, leggings, booties, and mittens. Warm and cosy for winter.",
    categorySlugs: ["baby-clothing-sets", "kids-baby-gifts"],
    imageQuery: "baby winter clothes set",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — HAMPERS (baby-shower-gifts, hampers-gift-sets, kids-baby-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Deluxe Baby Shower Hamper",
    slug: "deluxe-baby-shower-hamper",
    price: 6500,
    description: "Wicker basket with swaddle, onesie, bib, toy, blanket, and card. The ultimate baby shower gift.",
    categorySlugs: ["baby-shower-gifts", "hampers-gift-sets"],
    imageQuery: "deluxe baby shower hamper",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Welcome Baby Gift Basket",
    slug: "welcome-baby-gift-basket",
    price: 4500,
    description: "Essentials basket: newborn outfit, washcloths, lotion, diaper cream, and a toy.",
    categorySlugs: ["baby-shower-gifts", "kids-baby-gifts"],
    imageQuery: "welcome baby gift basket",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Christening Gift Set",
    slug: "christening-gift-set",
    price: 5500,
    description: "Silver-plated picture frame, bib, and spoon set with personalised engraving.",
    categorySlugs: ["baby-shower-gifts", "personalized-gifts"],
    imageQuery: "christening gift set baby",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — JEWELLERY (baby-keepsake-gifts, jewelry-fine-pieces)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Baby Sterling Silver Bracelet",
    slug: "baby-silver-bracelet",
    price: 2500,
    description: "925 sterling silver bracelet with heart charm. Adjustable, hypoallergenic.",
    categorySlugs: ["baby-keepsake-gifts", "jewelry-fine-pieces"],
    imageQuery: "baby silver bracelet gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baby Necklace — Birthstone",
    slug: "baby-necklace-birthstone",
    price: 2800,
    description: "Delicate chain with birthstone pendant. Choose the baby's birth month.",
    categorySlugs: ["baby-keepsake-gifts", "personalized-gifts"],
    imageQuery: "baby birthstone necklace",
    imageUrls: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BABY — PRAM ACCESSORIES (baby-room-accessories, kids-baby-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Pram Footmuff — Universal Fit",
    slug: "pram-footmuff-universal",
    price: 3500,
    description: "Cosy footmuff for strollers. Fleece-lined, waterproof, fits most prams.",
    categorySlugs: ["baby-room-accessories", "kids-baby-gifts"],
    imageQuery: "pram footmuff baby",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Pram Organiser Bag",
    slug: "pram-organiser-bag",
    price: 1800,
    description: "Attaches to pram handle. Holds bottle, phone, keys, and nappies. Waterproof lining.",
    categorySlugs: ["baby-room-accessories", "kids-baby-gifts"],
    imageQuery: "pram organiser bag",
    imageUrls: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FITNESS & GYM (fitness-equipment, gym-accessories)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Premium Yoga Mat — Non-Slip",
    slug: "premium-yoga-mat",
    price: 3500,
    description: "6mm thick TPE yoga mat with alignment lines. Non-slip, eco-friendly, includes carry strap.",
    categorySlugs: ["fitness-equipment", "home-lifestyle"],
    imageQuery: "yoga mat gift fitness",
    imageUrls: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Insulated Water Bottle — 750ml",
    slug: "insulated-water-bottle-750",
    price: 1800,
    description: "Double-wall vacuum insulated bottle. Keeps water cold 24hrs, hot 12hrs. Stainless steel.",
    categorySlugs: ["fitness-equipment", "fashion-accessories"],
    imageQuery: "insulated water bottle fitness",
    imageUrls: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Gym Duffel Bag — Waterproof",
    slug: "gym-duffel-bag",
    price: 4500,
    description: "Large capacity gym bag with shoe compartment, wet pocket, and USB charging port.",
    categorySlugs: ["fitness-equipment", "fashion-accessories"],
    imageQuery: "gym duffel bag",
    imageUrls: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Resistance Bands Set — 5 Pack",
    slug: "resistance-bands-set-5",
    price: 1500,
    description: "Five resistance levels (5-50 lbs). Latex-free, with carry bag and exercise guide.",
    categorySlugs: ["fitness-equipment", "home-lifestyle"],
    imageQuery: "resistance bands set",
    imageUrls: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Smart Fitness Tracker Band",
    slug: "smart-fitness-tracker",
    price: 5500,
    description: "Heart rate, sleep tracking, step counter, waterproof. Works with iOS and Android.",
    categorySlugs: ["fitness-equipment", "home-lifestyle"],
    imageQuery: "fitness tracker smart band",
    imageUrls: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Foam Roller — Deep Tissue",
    slug: "foam-roller-deep-tissue",
    price: 2200,
    description: "High-density EVA foam roller. 45cm, textured surface for muscle recovery.",
    categorySlugs: ["fitness-equipment", "wellness-self-care-hampers"],
    imageQuery: "foam roller fitness recovery",
    imageUrls: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // GAMING (gaming-accessories, board-games-puzzles)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Wireless Gaming Headset",
    slug: "wireless-gaming-headset",
    price: 6500,
    description: "7.1 surround sound, noise-cancelling mic, 20hr battery. Works with PC, PS5, Xbox.",
    categorySlugs: ["gaming-accessories", "home-lifestyle"],
    imageQuery: "gaming headset wireless gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Pro Gaming Controller — Multi-Platform",
    slug: "pro-gaming-controller",
    price: 4500,
    description: "Ergonomic wireless controller with programmable buttons and RGB lighting.",
    categorySlugs: ["gaming-accessories", "home-lifestyle"],
    imageQuery: "gaming controller wireless",
    imageUrls: [
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "1000-Piece Jigsaw Puzzle — Nairobi Skyline",
    slug: "jigsaw-puzzle-nairobi-1000",
    price: 1800,
    description: "1000-piece puzzle featuring Nairobi cityscape. Thick cardboard, matte finish.",
    categorySlugs: ["board-games-puzzles", "home-lifestyle"],
    imageQuery: "jigsaw puzzle gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Strategy Board Game — Settlers Edition",
    slug: "strategy-board-game-settlers",
    price: 3500,
    description: "Classic resource management board game for 3-4 players. Family game night essential.",
    categorySlugs: ["board-games-puzzles", "home-lifestyle"],
    imageQuery: "board game strategy gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Retro Arcade Console — 500 Games",
    slug: "retro-arcade-console-500",
    price: 4000,
    description: "Mini retro console with 500 classic games. HDMI output, two wireless controllers.",
    categorySlugs: ["gaming-accessories", "home-lifestyle"],
    imageQuery: "retro arcade console gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "LED Gaming Mouse Pad — Extended",
    slug: "led-gaming-mousepad",
    price: 2500,
    description: "900x400mm extended mouse pad with 16.8M RGB colours. Anti-slip rubber base.",
    categorySlugs: ["gaming-accessories", "home-lifestyle"],
    imageQuery: "gaming mouse pad led",
    imageUrls: [
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Card Game Bundle — Exploding Kittens + Expansion",
    slug: "card-game-bundle-exploding",
    price: 2200,
    description: "Hilarious card game for 2-5 players. Includes base game and first expansion pack.",
    categorySlugs: ["board-games-puzzles", "home-lifestyle"],
    imageQuery: "card game gift explodin",
    imageUrls: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MUSIC (vinyl-records, musical-accessories)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Classic Vinyl Record — Greatest Hits",
    slug: "vinyl-record-greatest-hits",
    price: 2500,
    description: "180g vinyl pressing of timeless classics. Includes digital download code.",
    categorySlugs: ["vinyl-records", "home-lifestyle"],
    imageQuery: "vinyl record gift music",
    imageUrls: [
      "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Bluetooth Vinyl Turntable",
    slug: "bluetooth-vinyl-turntable",
    price: 8500,
    description: "Belt-driven turntable with Bluetooth output, built-in speakers, and USB recording.",
    categorySlugs: ["vinyl-records", "home-lifestyle"],
    imageQuery: "vinyl turntable bluetooth gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Guitar Picks & Capo Set",
    slug: "guitar-picks-capo-set",
    price: 1200,
    description: "12 guitar picks (various gauges), metal capo, and pick holder. Essential accessories.",
    categorySlugs: ["musical-accessories", "hobby-craft-supplies"],
    imageQuery: "guitar picks capo gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Studio Monitor Headphones",
    slug: "studio-monitor-headphones",
    price: 5500,
    description: "Over-ear headphones with flat response. Detachable cable, foldable design.",
    categorySlugs: ["musical-accessories", "home-lifestyle"],
    imageQuery: "studio monitor headphones gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Music Gift Card — KSh 3000",
    slug: "music-gift-card-3000",
    price: 3000,
    description: "Digital gift card for music streaming, vinyl records, or instrument accessories.",
    categorySlugs: ["gift-cards-vouchers", "vinyl-records"],
    imageQuery: "music gift card voucher",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Kalimba — 17 Keys Thumb Piano",
    slug: "kalimba-17-keys-thumb-piano",
    price: 2200,
    description: "Mahogany kalimba with 17 tines. Includes tuning hammer, music book, and carrying bag.",
    categorySlugs: ["musical-accessories", "handmade-crafts-fairs"],
    imageQuery: "kalimba thumb piano gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // OUTDOOR & CAMPING (camping-gear, picnic-accessories)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Camping Hamper — Adventure Pack",
    slug: "camping-hamper-adventure",
    price: 8500,
    description: "Tent, sleeping bag, headlamp, camping plates, and cutlery set. Ready for the wild.",
    categorySlugs: ["camping-gear", "hampers-gift-sets"],
    imageQuery: "camping hamper adventure gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Picnic Basket Set — 4 Person",
    slug: "picnic-basket-set-4",
    price: 4500,
    description: "Wicker basket with plates, cutlery, wine glasses, and blanket. Insulated compartment.",
    categorySlugs: ["picnic-accessories", "home-lifestyle"],
    imageQuery: "picnic basket set gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cooler Bag — 30L Premium",
    slug: "cooler-bag-30l-premium",
    price: 3500,
    description: "Heavy-duty cooler bag with 72hr ice retention. Padded straps, bottle opener, pockets.",
    categorySlugs: ["camping-gear", "picnic-accessories"],
    imageQuery: "cooler bag premium gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Hammock — Double Outdoor",
    slug: "hammock-double-outdoor",
    price: 3000,
    description: "Parachute nylon hammock, fits 2 people. Tree straps included, packs into carry bag.",
    categorySlugs: ["camping-gear", "home-lifestyle"],
    imageQuery: "outdoor hammock double gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "LED Camping Lantern — 2 Pack",
    slug: "led-camping-lantern-2",
    price: 1800,
    description: "Rechargeable LED lanterns, 1000 lumens each. Water-resistant, collapsible design.",
    categorySlugs: ["camping-gear", "home-lifestyle"],
    imageQuery: "led camping lantern gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Portable Braai/BBQ Set",
    slug: "portable-bbq-set",
    price: 5500,
    description: "Collapsible charcoal grill with tongs, fork, brush, and carry bag. Stainless steel.",
    categorySlugs: ["camping-gear", "picnic-accessories"],
    imageQuery: "portable braai bbq set",
    imageUrls: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HOME DECOR (wall-art-decor, art-prints-canvas, wall-hangings-sculptures)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Ceramic Vase — Handmade Terracotta",
    slug: "ceramic-vase-terracotta",
    price: 2800,
    description: "Handcrafted terracotta vase with matte finish. 25cm tall, perfect for dried flowers.",
    categorySlugs: ["home-lifestyle", "handmade-crafts-fairs"],
    imageQuery: "ceramic vase handmade gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1612198188708-27b227f8ab14?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Framed Art Print — African Sunset",
    slug: "framed-art-african-sunset",
    price: 3500,
    description: "A3 giclée print of an African savanna sunset. Black frame, museum-quality paper.",
    categorySlugs: ["art-prints-canvas", "wall-art-decor"],
    imageQuery: "framed art print african sunset",
    imageUrls: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612198188708-27b227f8ab14?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Woven Wall Hanging — Macrame",
    slug: "woven-wall-hanging-macrame",
    price: 4500,
    description: "Large macrame wall hanging in natural cotton. 90cm wide, bohemian chic.",
    categorySlugs: ["wall-hangings-sculptures", "wall-art-decor"],
    imageQuery: "macrame wall hanging gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612198188708-27b227f8ab14?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Decorative Mirror — Sunburst Gold",
    slug: "decorative-mirror-sunburst",
    price: 5500,
    description: "Gold metal sunburst mirror, 60cm diameter. Statement piece for living room or bedroom.",
    categorySlugs: ["home-lifestyle", "wall-art-decor"],
    imageQuery: "sunburst mirror gold decor",
    imageUrls: [
      "https://images.unsplash.com/photo-1612198188708-27b227f8ab14?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Throw Cushion Set — 3 Pack",
    slug: "throw-cushion-set-3",
    price: 3000,
    description: "Three African-inspired print cushion covers (45x45cm). Invisible zip, machine washable.",
    categorySlugs: ["home-lifestyle", "wall-art-decor"],
    imageQuery: "throw cushion set african print",
    imageUrls: [
      "https://images.unsplash.com/photo-1612198188708-27b227f8ab14?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Wool Throw Blanket — Kenya",
    slug: "wool-throw-blanket-kenya",
    price: 4000,
    description: "100% wool throw with Maasai-inspired pattern. 150x200cm, soft and warm.",
    categorySlugs: ["home-lifestyle", "handmade-crafts-fairs"],
    imageQuery: "wool throw blanket african",
    imageUrls: [
      "https://images.unsplash.com/photo-1612198188708-27b227f8ab14?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Scented Candle Set — 3 Jars",
    slug: "scented-candle-set-3",
    price: 2500,
    description: "Three soy wax candles: lavender, vanilla, sandalwood. 40hr burn time each.",
    categorySlugs: ["candle-holders-lanterns", "home-lifestyle"],
    imageQuery: "scented candle set gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1608181831718-2501d6b351a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Indoor Plant Pot — Concrete Modern",
    slug: "indoor-plant-pot-concrete",
    price: 1500,
    description: "Minimalist concrete plant pot with drainage hole and saucer. 15cm diameter.",
    categorySlugs: ["plants-succulents", "home-lifestyle"],
    imageQuery: "concrete plant pot modern",
    imageUrls: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // KITCHEN TOOLS (kitchen-tools, luxury-kitchen-accessories)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Chef Knife Set — 3 Piece",
    slug: "chef-knife-set-3",
    price: 6500,
    description: "8\" chef, 5\" utility, 3.5\" paring knife. German steel, ergonomic handles, block included.",
    categorySlugs: ["kitchen-tools", "luxury-kitchen-accessories"],
    imageQuery: "chef knife set gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "End-Grain Cutting Board — Acacia",
    slug: "end-grain-cutting-board",
    price: 4500,
    description: "Large 45x35cm acacia wood cutting board. End-grain construction, juice groove.",
    categorySlugs: ["kitchen-tools", "luxury-kitchen-accessories"],
    imageQuery: "end grain cutting board gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Spice Rack — Bamboo 20 Jar",
    slug: "spice-rack-bamboo-20",
    price: 3500,
    description: "Rotating bamboo spice rack with 20 glass jars and labels. Space-saving design.",
    categorySlugs: ["kitchen-tools", "home-lifestyle"],
    imageQuery: "spice rack bamboo gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Cast Iron Dutch Oven — 5L",
    slug: "cast-iron-dutch-oven-5l",
    price: 7500,
    description: "Enameled cast iron pot. Oven safe to 260°C, self-basting lid, 5L capacity.",
    categorySlugs: ["kitchen-tools", "luxury-kitchen-accessories"],
    imageQuery: "cast iron dutch oven gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Baking Set — Silicone 15 Piece",
    slug: "baking-set-silicone-15",
    price: 2800,
    description: "Silicone bakeware set: muffin tray, loaf pan, cake moulds, spatulas, piping bags.",
    categorySlugs: ["kitchen-tools", "home-lifestyle"],
    imageQuery: "baking set silicone gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // WEDDING REGISTRY (wedding-registry-items, his-hers)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "His & Hers Robe Set",
    slug: "his-hers-robe-set",
    price: 5500,
    description: "Matching terry cotton robes. His (XL charcoal), hers (L white). Embroidered initials optional.",
    categorySlugs: ["wedding-registry-items", "personalized-gifts"],
    imageQuery: "his hers robe set wedding",
    imageUrls: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Kitchen Starter Set — Newlyweds",
    slug: "kitchen-starter-set-newlyweds",
    price: 12000,
    description: "Knife set, cutting board, pot set, utensils, and tea towels. Everything for a new kitchen.",
    categorySlugs: ["wedding-registry-items", "kitchen-tools"],
    imageQuery: "kitchen starter set wedding gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Luxury Bedding Set — King",
    slug: "luxury-bedding-set-king",
    price: 8500,
    description: "300TC Egyptian cotton sheet set: fitted, flat, 4 pillowcases. Hypoallergenic, soft.",
    categorySlugs: ["wedding-registry-items", "home-lifestyle"],
    imageQuery: "luxury bedding set king wedding",
    imageUrls: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Personalised Photo Album — Wedding",
    slug: "personalised-photo-album-wedding",
    price: 3500,
    description: "Leather-bound album with 'Mr & Mrs' embossing. 200 photos, acid-free pages.",
    categorySlugs: ["wedding-registry-items", "personalized-gifts"],
    imageQuery: "personalised wedding photo album",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Wine Decanter & Glasses Set",
    slug: "wine-decanter-glasses-set",
    price: 5000,
    description: "Crystal decanter with 4 stemmed glasses. Gift boxed, perfect for anniversary toasts.",
    categorySlugs: ["wedding-registry-items", "wine-whiskey-beverage-hampers"],
    imageQuery: "wine decanter glasses set gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Couples Experience Voucher — Dinner",
    slug: "couples-experience-voucher-dinner",
    price: 10000,
    description: "Fine dining experience for two at a top Nairobi restaurant. 3-course meal with wine.",
    categorySlugs: ["dining-experience-vouchers", "wedding-registry-items"],
    imageQuery: "couples dinner experience voucher",
    imageUrls: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PROFESSIONAL APPRECIATION (teacher-appreciation, nurse-appreciation)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Teacher Appreciation Hamper",
    slug: "teacher-appreciation-hamper",
    price: 3500,
    description: "Personalised mug, notebook, pen set, hand cream, and chocolates. Thank a great teacher.",
    categorySlugs: ["teacher-appreciation", "personalized-gifts"],
    imageQuery: "teacher appreciation hamper gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Nurse Appreciation Gift Box",
    slug: "nurse-appreciation-gift-box",
    price: 4000,
    description: "Compression socks, scrub cap, badge reel, energy snacks, and thank-you card.",
    categorySlugs: ["nurse-appreciation", "wellness-self-care-hampers"],
    imageQuery: "nurse appreciation gift box",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Work Anniversary Gift Set",
    slug: "work-anniversary-gift-set",
    price: 3000,
    description: "Engraved pen, leather notebook, and desk plant. Celebrate milestones at work.",
    categorySlugs: ["teacher-appreciation", "personalized-gifts"],
    imageQuery: "work anniversary gift set",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Boss Appreciation Gift",
    slug: "boss-appreciation-gift",
    price: 5500,
    description: "Premium desk accessory set: business card holder, pen stand, and leather blotter.",
    categorySlugs: ["teacher-appreciation", "luxury-kitchen-accessories"],
    imageQuery: "boss appreciation gift desk",
    imageUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SEASONAL (christmas-gifts, valentines-gifts, easter-gifts)
  // ═══════════════════════════════════════════════════════════════

  {
    name: "Christmas Hamper — Deluxe",
    slug: "christmas-hamper-deluxe",
    price: 7500,
    description: "Festive hamper with wine, panettone, chocolates, cheese, crackers, and Christmas pudding.",
    categorySlugs: ["christmas-gifts", "hampers-gift-sets"],
    imageQuery: "christmas hamper deluxe gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1512389142960-503fb49d06f1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Christmas Advent Calendar — Luxury",
    slug: "christmas-advent-calendar-luxury",
    price: 4500,
    description: "24 doors of premium chocolates, mini wines, and beauty surprises. Countdown to Christmas.",
    categorySlugs: ["christmas-gifts", "chocolates-sweets-gifts"],
    imageQuery: "christmas advent calendar luxury",
    imageUrls: [
      "https://images.unsplash.com/photo-1512389142960-503fb49d06f1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f8?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Valentine's Day Gift Box — Premium",
    slug: "valentines-gift-box-premium",
    price: 6500,
    description: "Red roses (24 stems), Belgian chocolates, prosecco, and a love letter card.",
    categorySlugs: ["valentines-gifts", "flowers-aromatics", "chocolates-sweets-gifts"],
    imageQuery: "valentines day gift box premium",
    imageUrls: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Valentine's Couple Experience",
    slug: "valentines-couple-experience",
    price: 12000,
    description: "Couples spa day: massage, facial, champagne lunch. Full day of relaxation together.",
    categorySlugs: ["valentines-gifts", "spa-experience-vouchers"],
    imageQuery: "valentines couple spa experience",
    imageUrls: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Easter Hamper — Family",
    slug: "easter-hamper-family",
    price: 3500,
    description: "Hot cross buns, Easter eggs, mini chicks, and a family game. Easter morning sorted.",
    categorySlugs: ["easter-gifts", "hampers-gift-sets", "chocolates-sweets-gifts"],
    imageQuery: "easter hamper family gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
  {
    name: "Easter Chocolate Egg — Giant",
    slug: "easter-chocolate-egg-giant",
    price: 2500,
    description: "Handcrafted Belgian chocolate egg filled with truffles and pralines. 1kg.",
    categorySlugs: ["easter-gifts", "chocolates-sweets-gifts"],
    imageQuery: "easter chocolate egg giant gift",
    imageUrls: [
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    ],
  },
];

// ─── Seed Logic ───────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`\n=== TouchGift Catalog Seeder ===`);
  console.log(`Seeding ${PRODUCTS.length} products...\n`);

  // 1. Fetch existing categories from DB
  const { data: dbCategories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug");

  if (catErr || !dbCategories) {
    console.error("Failed to fetch categories:", catErr?.message);
    process.exit(1);
  }

  const categoryMap = new Map(dbCategories.map((c) => [c.slug, c.id]));

  // 2. Create missing categories
  const allNeededSlugs = new Set(PRODUCTS.flatMap((p) => p.categorySlugs));
  for (const slug of allNeededSlugs) {
    if (!categoryMap.has(slug)) {
      const name = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const { data, error } = await supabase
        .from("categories")
        .upsert({ name, slug, kind: "practical" }, { onConflict: "slug" })
        .select()
        .single();
      if (error) {
        console.error(`Failed to create category "${slug}":`, error.message);
      } else {
        categoryMap.set(slug, data.id);
        console.log(`  Created category: ${slug}`);
      }
    }
  }

  // 3. Seed products
  let seeded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    const prefix = `[${i + 1}/${PRODUCTS.length}]`;

    // Check if product already exists by slug
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", product.slug)
      .single();

    if (existing) {
      skipped++;
      console.log(`${prefix} SKIP (exists): ${product.slug}`);
      continue;
    }

    try {
      // Download and store image
      const imageUrl = await downloadAndStore(product.slug, product.imageUrls);

      // Insert product
      const { data: newProduct, error: prodErr } = await supabase
        .from("products")
        .upsert(
          {
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            image_url: imageUrl,
            is_personalizable: product.isPersonalizable ?? false,
            in_stock: true,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (prodErr || !newProduct) {
        throw new Error(prodErr?.message ?? "Product insert failed");
      }

      // Link to categories
      for (const catSlug of product.categorySlugs) {
        const catId = categoryMap.get(catSlug);
        if (!catId) {
          console.warn(`${prefix} Category not found: ${catSlug}`);
          continue;
        }
        await supabase
          .from("product_categories")
          .upsert(
            { product_id: newProduct.id, category_id: catId },
            { onConflict: "product_id,category_id" }
          );
      }

      seeded++;
      console.log(`${prefix} OK: ${product.name} (${product.price} KSh)`);
    } catch (err) {
      failed++;
      console.error(
        `${prefix} FAIL: ${product.slug} — ${err instanceof Error ? err.message : err}`
      );
    }

    // Rate limit
    if (i % 5 === 4) await sleep(1000);
  }

  console.log(`\n=== Done ===`);
  console.log(`  Seeded: ${seeded}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${PRODUCTS.length}`);
}

main();
