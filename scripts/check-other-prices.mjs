import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

for (const [table, cols] of [
  ["hamper_bundles", "name, regular_price, bundle_price, is_active"],
  ["hamper_templates", "name"],
  ["gift_cards", "name, amount, price"],
]) {
  const { data, error } = await supabase.from(table).select(cols).limit(1000);
  if (error) { console.log(`${table}: ERR ${error.message}`); continue; }
  const priceCols = cols.split(", ").filter(c => /price|amount/i.test(c));
  const bad = data.filter(row => priceCols.some(c => !row[c] || Number(row[c]) === 0));
  console.log(`${table}: ${data.length} rows, zero/missing: ${bad.length}`);
  bad.slice(0, 10).forEach(r => console.log(`  -`, JSON.stringify(r)));
}
