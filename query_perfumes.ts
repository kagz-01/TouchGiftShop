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
    .select("name, sku, tags, product_categories!inner(categories!inner(slug))")
    .eq("product_categories.categories.slug", "perfumes");
    
  if (error) console.error(error);
  else {
    console.log(`Found ${data.length} perfumes.`);
    const prefixes = new Set();
    const tags = new Set();
    data.forEach((p: any) => {
      if (p.sku) prefixes.add(p.sku.split("-")[0]);
      if (p.tags) p.tags.forEach((t: string) => tags.add(t));
    });
    console.log("SKU Prefixes:", [...prefixes]);
    console.log("Tags:", [...tags]);
  }
}
main();
