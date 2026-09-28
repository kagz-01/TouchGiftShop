#!/usr/bin/env python3
"""
TouchGift — DB Purge + Supabase Storage Upload + Catalog Import
================================================================
Steps:
  1. Purge existing products from Supabase DB
  2. Create 'products' storage bucket (if not exists)
  3. Upload all WebP images from public/products/ to products/corporate/
  4. Upsert all products from promohub-catalog.csv with Supabase Storage URLs

Run from project root:
  python3 scripts/full_import.py
"""

import csv
import json
import os
import re
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(".env.local")

SUPABASE_URL     = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_SERVICE = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

from supabase import create_client, Client
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE)

# Taxonomy rebuild runs after the import (see link_categories.py)
sys.path.insert(0, str(Path(__file__).resolve().parent))
from link_categories import link_categories  # noqa: E402

# ── Config ──────────────────────────────────────────────────────────────
CSV_FILE    = Path("promohub-catalog.csv")
IMAGES_DIR  = Path("public/products")
BUCKET      = "products"
FOLDER      = "corporate"          # subfolder for this supplier batch
BATCH_SIZE  = 50

# SKUs with no source image on disk (public/products/{SKU}.webp is missing), so
# they render the placeholder card. Dropped from the import until a catalog that
# includes their images lands.
NO_IMAGE_SKUS = {
    "PEN-233", "PEN-234", "PEN-235",
    "NBK-224", "NBK-245", "NBK-247",
    "SET-105", "BAG-115", "ACC-118", "HPF-155",
}

# Public URL prefix for this bucket/folder
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{FOLDER}"

# ── Step 1: Purge ────────────────────────────────────────────────────────
def purge_products():
    print("\n── Step 1: Purging existing products ──")
    try:
        # Delete product_categories first (FK constraint)
        sb.table("product_categories").delete().neq("product_id", "00000000-0000-0000-0000-000000000000").execute()
        # Delete products
        sb.table("products").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("  ✅  products table cleared")
    except Exception as e:
        print(f"  ❌  Purge failed: {e}")
        sys.exit(1)

# ── Step 2: Ensure bucket exists ────────────────────────────────────────
def ensure_bucket():
    print(f"\n── Step 2: Ensuring storage bucket '{BUCKET}' ──")
    try:
        buckets = sb.storage.list_buckets()
        names = [b.name for b in buckets]
        if BUCKET not in names:
            sb.storage.create_bucket(BUCKET, options={"public": True})
            print(f"  ✅  Bucket '{BUCKET}' created (public)")
        else:
            print(f"  ✅  Bucket '{BUCKET}' already exists")
    except Exception as e:
        print(f"  ❌  Bucket check failed: {e}")
        sys.exit(1)

# ── Step 3: Upload images ────────────────────────────────────────────────
def upload_images():
    print(f"\n── Step 3: Uploading images to {BUCKET}/{FOLDER}/ ──")
    webp_files = sorted(IMAGES_DIR.glob("*.webp"))
    total = len(webp_files)
    print(f"  Found {total} WebP files to upload\n")

    ok = skipped = errors = 0

    for i, path in enumerate(webp_files, 1):
        dest_path = f"{FOLDER}/{path.name}"
        try:
            with open(path, "rb") as f:
                data = f.read()
            sb.storage.from_(BUCKET).upload(
                path=dest_path,
                file=data,
                file_options={
                    "content-type": "image/webp",
                    "upsert": "true",      # overwrite if exists
                    "cache-control": "3600",
                }
            )
            ok += 1
            if i % 50 == 0 or i == total:
                print(f"  [{i:>4}/{total}] Uploaded {path.name}")
        except Exception as e:
            err_msg = str(e)
            if "already exists" in err_msg or "Duplicate" in err_msg:
                skipped += 1
            else:
                errors += 1
                print(f"  [{i:>4}/{total}] ERROR {path.name}: {e}")

    print(f"\n  Done uploading: {ok} uploaded | {skipped} skipped | {errors} errors")
    return ok + skipped  # total available in storage

# ── Step 4: Import catalog ───────────────────────────────────────────────
def parse_json_field(value: str, as_objects: bool = False) -> list:
    if not value or value.strip() in ("", "[]"):
        return []
    
    parsed_list = []
    try:
        parsed = json.loads(value.strip())
        parsed_list = parsed if isinstance(parsed, list) else []
    except Exception:
        parsed_list = re.findall(r'"([^"]+)"', value)
        
    if as_objects and parsed_list and isinstance(parsed_list[0], str):
        return [{"name": item} for item in parsed_list]
    return parsed_list

def to_bool(value: str) -> bool:
    return value.strip().lower() in ("true", "1", "yes")

def build_image_url(sku: str) -> str | None:
    if not sku:
        return None
    webp = IMAGES_DIR / f"{sku}.webp"
    if webp.exists():
        return f"{STORAGE_BASE}/{sku}.webp"
    return None

def build_images_array(sku: str) -> list[str]:
    if not sku:
        return []
    extras = sorted(IMAGES_DIR.glob(f"{sku}-*.webp"))
    return [f"{STORAGE_BASE}/{p.name}" for p in extras]

def import_catalog():
    print(f"\n── Step 4: Importing catalog from {CSV_FILE} ──")

    with open(CSV_FILE, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    total = len(rows)
    print(f"  {total} products to import\n")

    ok = skipped = errors = 0
    batch = []

    def flush(batch):
        if not batch:
            return 0, 0
        try:
            sb.table("products").upsert(batch, on_conflict="slug", returning="minimal").execute()
            return len(batch), 0
        except Exception as e:
            print(f"  BATCH ERROR: {e}")
            return 0, len(batch)

    for i, row in enumerate(rows, 1):
        name = row.get("name", "").strip()
        slug = row.get("slug", "").strip()
        if not name or not slug:
            skipped += 1
            continue

        sku = row.get("sku", "").strip()

        if sku in NO_IMAGE_SKUS:
            skipped += 1
            continue

        # Customers pay the CSV's "selling price" — that column is the retail
        # figure. The "price" column is the supplier number (always half of it)
        # and must never surface, so there is no sale_price to derive.
        selling = row.get("selling price", "").strip()
        supplier = row.get("price", "").strip()
        try:
            price = float(selling) if selling else float(supplier or 0)
        except ValueError:
            price = 0.0
        sale_price = None
        try:
            weight = float(row.get("weight_kg", 0) or 0) or None
        except ValueError:
            weight = None
        try:
            stock_qty = int(row.get("stock_quantity", 0) or 0)
        except ValueError:
            stock_qty = 0

        record = {
            "name":              name,
            "slug":              slug,
            "description":       row.get("description", "").strip() or None,
            "price":             price,
            "sale_price":        sale_price,
            "image_url":         build_image_url(sku),
            "images":            build_images_array(sku),
            "is_personalizable": to_bool(row.get("is_personalizable", "")),
            "in_stock":          to_bool(row.get("in_stock", "True")),
            "stock_quantity":    stock_qty,
            "sku":               sku or None,
            "status":            row.get("status", "published").strip() or "published",
            "weight_kg":         weight,
            "tags":              parse_json_field(row.get("tags", "")),
            "color_variants":    parse_json_field(row.get("color_variants", ""), as_objects=True),
            "size_variants":     parse_json_field(row.get("size_variants", ""), as_objects=True),
        }

        batch.append(record)

        if len(batch) >= BATCH_SIZE:
            b_ok, b_err = flush(batch)
            ok += b_ok; errors += b_err
            batch = []
            print(f"  [{i:>3}/{total}] Batch upserted ({BATCH_SIZE} products)")

    b_ok, b_err = flush(batch)
    ok += b_ok; errors += b_err

    print(f"\n  Done importing: {ok} upserted | {skipped} skipped | {errors} errors")

# ── Run all steps ────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  TouchGift — Full Catalog Import")
    print("=" * 60)

    purge_products()
    ensure_bucket()
    upload_images()
    import_catalog()
    link_categories()

    print("\n" + "=" * 60)
    print("  All done! Products are live in Supabase.")
    print(f"  Images at: {STORAGE_BASE}/")
    print("=" * 60)
