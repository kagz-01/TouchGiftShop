import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session || session !== process.env.ADMIN_API_KEY) {
    return false;
  }
  return true;
}

// ---- Minimal CSV parser (handles quoted fields, commas, CRLF) ----
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field.trim()); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field.trim()); field = "";
        if (row.some((f) => f !== "")) rows.push(row);
        row = [];
      } else field += c;
    }
  }
  row.push(field.trim());
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 190);
}

// Columns with special meaning; every OTHER column becomes a product_spec
const FIXED_COLS = new Set([
  "name", "price", "sale_price", "category", "sku", "stock", "quantity",
  "description", "image_url", "status", "tags",
]);

async function broadcast(event: string, payload: Record<string, unknown>) {
  try {
    const channel = supabase.channel("catalog-updates");
    await channel.send({ type: "broadcast", event, payload });
  } catch {}
}

/**
 * POST /api/admin/products/import
 * Body: { csv: string }
 *
 * Expected CSV format (header row required, case-insensitive):
 *   name,price,category,sku,stock,description,image_url,volume,abv,origin,...
 *
 * - `name` + `price` required per row
 * - `category` created automatically if missing
 * - Every extra column (volume, abv, origin, size...) is stored as a product spec
 */
export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const csv: string | undefined = body?.csv;
  if (!csv || typeof csv !== "string" || csv.trim().length < 5) {
    return NextResponse.json({ error: "Provide CSV text in body: { csv: \"...\" }" }, { status: 400 });
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return NextResponse.json({ error: "CSV needs a header row plus at least one data row" }, { status: 400 });
  }

  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const specCols = headers
    .map((h, i) => ({ col: h, idx: i }))
    .filter(({ col }) => col && !FIXED_COLS.has(col));

  const idxOf = (col: string) => headers.indexOf(col);

  const summary = { created: 0, updated: 0, specsAdded: 0, categoriesCreated: 0, errors: [] as { row: number; error: string }[] };

  // Category cache
  const catCache = new Map<string, string>();
  async function getCategoryId(name: string): Promise<string | null> {
    const key = name.trim().toLowerCase();
    if (!key) return null;
    if (catCache.has(key)) return catCache.get(key)!;

    const slug = generateSlug(key);
    const { data: existing } = await supabase
      .from("categories").select("id").eq("slug", slug).maybeSingle();
    if (existing) { catCache.set(key, existing.id); return existing.id; }

    const { data: created, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug, kind: "practical" })
      .select("id").single();
    if (error || !created) return null;
    summary.categoriesCreated++;
    catCache.set(key, created.id);
    return created.id;
  }

  // Existing SKU index to make re-imports idempotent
  const skuMap = new Map<string, string>();
  {
    const { data: existingProducts } = await supabase.from("products").select("id, sku");
    (existingProducts ?? []).forEach((p: { id: string; sku: string | null }) => {
      if (p.sku) skuMap.set(p.sku.toUpperCase(), p.id);
    });
  }

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const get = (col: string) => {
      const i = idxOf(col);
      return i >= 0 && i < cells.length ? cells[i] : "";
    };

    try {
      const name = get("name");
      const priceRaw = get("price");
      if (!name || !priceRaw) {
        summary.errors.push({ row: r + 1, error: "Missing name or price" });
        continue;
      }

      const price = parseFloat(priceRaw.replace(/[^0-9.]/g, ""));
      if (!price || isNaN(price)) {
        summary.errors.push({ row: r + 1, error: `Invalid price "${priceRaw}"` });
        continue;
      }

      const salePriceRaw = get("sale_price");
      const salePrice = salePriceRaw ? parseFloat(salePriceRaw.replace(/[^0-9.]/g, "")) : null;
      const sku = get("sku") || null;
      const stockRaw = get("stock") || get("quantity");
      const stockQty = stockRaw ? parseInt(stockRaw.replace(/[^0-9]/g, ""), 10) : null;
      const description = get("description") || "";
      const imageUrl = get("image_url") || null;
      const status = ["draft", "published", "archived"].includes(get("status")) ? get("status") : "published";
      const tags = get("tags") ? get("tags").split(/[;|]/).map((t) => t.trim()).filter(Boolean) : [];

      const record: Record<string, unknown> = {
        name,
        slug: generateSlug(name),
        description,
        price,
        image_url: imageUrl,
        in_stock: stockQty === null || stockQty > 0,
        status,
        synced_at: new Date().toISOString(),
      };
      if (salePrice && !isNaN(salePrice)) record.sale_price = salePrice;
      if (sku) record.sku = sku;
      if (stockQty !== null && !isNaN(stockQty)) record.stock_quantity = stockQty;
      if (tags.length > 0) record.tags = tags;

      // Idempotency: update if SKU exists, else insert
      let productId: string;
      const existingId = sku ? skuMap.get(sku.toUpperCase()) : undefined;
      if (existingId) {
        const { error } = await supabase.from("products").update(record).eq("id", existingId);
        if (error) throw new Error(error.message);
        productId = existingId;
        summary.updated++;
      } else {
        const { data: inserted, error } = await supabase
          .from("products").insert(record).select("id").single();
        if (error) throw new Error(error.message);
        productId = inserted.id;
        if (sku) skuMap.set(sku.toUpperCase(), productId);
        summary.created++;
      }

      // Category link
      const categoryName = get("category");
      if (categoryName) {
        const catId = await getCategoryId(categoryName);
        if (catId) {
          await supabase
            .from("product_categories")
            .upsert(
              { product_id: productId, category_id: catId },
              { onConflict: "product_id,category_id" }
            );
        }
      }

      // Extra columns → product_specs
      for (const { col, idx } of specCols) {
        const value = cells[idx];
        if (!value) continue;
        const { error } = await supabase.from("product_specs").upsert(
          {
            product_id: productId,
            spec_key: col,
            spec_value: value.substring(0, 100),
            sort_order: idx,
          },
          { onConflict: "product_id,spec_key" }
        );
        if (!error) summary.specsAdded++;
      }
    } catch (err) {
      summary.errors.push({ row: r + 1, error: err instanceof Error ? err.message : String(err) });
    }
  }

  if (summary.created + summary.updated > 0) {
    await broadcast("products-imported", { created: summary.created, updated: summary.updated });
  }

  return NextResponse.json(summary);
}
