import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) acc[key.trim()] = val.join("=").trim();
  return acc;
}, {} as any);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from("products")
    .select("tags, product_categories!inner(categories!inner(slug))");
    
  if (error) console.error(error);
  else {
    const corpTags = data.filter((p: any) => p.tags && (p.tags.includes("corporate") || p.tags.includes("office") || p.tags.includes("business")));
    console.log(`Found ${corpTags.length} products with corporate/office/business tags.`);
    
    // Check distribution of these in actual categories
    const dist = new Map();
    corpTags.forEach((p: any) => {
      p.product_categories.forEach((pc: any) => {
        const cat = pc.categories.slug;
        dist.set(cat, (dist.get(cat) || 0) + 1);
      });
    });
    console.log("Categories for corporate-tagged items:", Object.fromEntries(dist));
  }
}
main();
