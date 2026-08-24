/**
 * AI Spec Extractor — scans products that have no specs yet and extracts
 * attributes (volume, size, material, pieces, flavour...) from name+description
 * using OpenAI, then writes them into product_specs.
 *
 * Usage:
 *   npx tsx scripts/extract-specs.ts            # process up to 100 products
 *   npx tsx scripts/extract-specs.ts --limit=50 --batch=10 --dry
 */

import fs from "fs";
import path from "path";
import { Client } from "pg";

// ---- Load .env.local (tsx doesn't auto-load it) ----
(function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m) continue;
    let v = (m[2] ?? "").trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
})();

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);
const LIMIT = Number(args.get("limit") ?? 100);
const BATCH = Number(args.get("batch") ?? 10);
const DRY = args.get("dry") === "true";
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error("❌ OPENAI_API_KEY missing in .env.local");
  process.exit(1);
}

interface ExtractedSpec {
  key: string;
  value: string;
  icon?: string;
}

async function extractBatch(
  items: { id: string; name: string; description: string }[]
): Promise<Record<string, ExtractedSpec[]>> {
  const prompt = `You extract product attributes for an e-commerce gift shop.
For each product below, extract 1-4 concrete specs customers care about (e.g. volume like "750ml", capacity, piece count like "3 Pieces", material, size, flavour, age/statement years for alcohol).
Rules:
- Only include facts implied by the name/description. Never invent.
- value must be short (max ~20 chars), e.g. "750ml", "40% ABV", "3-in-1".
- icon: one fitting emoji or empty string.
- If nothing can be extracted, return an empty specs array for that id.

Respond with ONLY JSON: {"results":[{"id":"<product id>","specs":[{"key":"volume","value":"750ml","icon":"🍾"}]}]}

PRODUCTS:
${items.map((p) => `- id:${p.id}\n  name:"${p.name}"\n  description:"${p.description.slice(0, 400)}"`).join("\n")}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  const out: Record<string, ExtractedSpec[]> = {};
  for (const r of parsed.results ?? []) {
    if (r?.id && Array.isArray(r.specs)) out[r.id] = r.specs;
  }
  return out;
}

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  const { rows: products } = await db.query<{ id: string; name: string; description: string }>(
    `SELECT p.id, p.name, COALESCE(p.description,'') AS description
     FROM products p
     LEFT JOIN product_specs s ON s.product_id = p.id
     WHERE s.id IS NULL AND p.in_stock = true
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [LIMIT]
  );

  console.log(`🔎 ${products.length} products without specs${DRY ? " (DRY RUN)" : ""}`);

  let processed = 0;
  let specCount = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    try {
      const results = await extractBatch(batch);

      for (const item of batch) {
        const specs = (results[item.id] ?? []).slice(0, 5);
        if (specs.length === 0) continue;

        console.log(`  ✅ ${item.name} → ${specs.map((s) => `${s.icon ?? ""}${s.value}`).join(", ")}`);
        processed++;
        specCount += specs.length;

        if (!DRY) {
          for (let j = 0; j < specs.length; j++) {
            const s = specs[j];
            await db.query(
              `INSERT INTO product_specs (product_id, spec_key, spec_value, icon, sort_order)
               VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (product_id, spec_key)
               DO UPDATE SET spec_value = EXCLUDED.spec_value, icon = EXCLUDED.icon`,
              [item.id, s.key.toLowerCase().replace(/\s+/g, "_"), String(s.value).slice(0, 100), s.icon || null, j]
            );
          }
        }
      }
    } catch (err) {
      console.error(`  ⚠️ Batch ${i / BATCH + 1} failed:`, err instanceof Error ? err.message : err);
    }

    // Small delay between batches to be polite to the API
    if (i + BATCH < products.length && !DRY) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  await db.end();
  console.log(`\n🎉 Done: ${processed} products got ${specCount} specs${DRY ? " (dry run — nothing saved)" : ""}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
