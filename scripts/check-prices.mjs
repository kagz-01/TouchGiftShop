import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from("products").select("id, name, slug, price, sale_price, status").order("name");
if (error) { console.error("ERR", error.message); process.exit(1); }

const bad = data.filter(p => !p.price || Number(p.price) === 0 || !p.sale_price || Number(p.sale_price) === 0);
console.log(`Total: ${data.length}`);
console.log(`Zero/null price: ${data.filter(p => !p.price || Number(p.price) === 0).length}`);
console.log(`Zero/null sale_price: ${data.filter(p => p.sale_price !== null && (!p.sale_price || Number(p.sale_price) === 0)).length}`);
console.log(`Either bad: ${bad.length}\n`);
for (const p of bad.slice(0, 30)) console.log(`- ${p.name} | price=${p.price} sale=${p.sale_price} [${p.status}]`);
