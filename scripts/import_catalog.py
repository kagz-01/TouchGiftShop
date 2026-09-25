#!/usr/bin/env python3
"""
TouchGift — Promohub Catalog Importer
======================================
Reads promohub-catalog.csv, maps images from public/products/
and upserts every product into Supabase.

Usage (run from project root):
  python3 scripts/import_catalog.py

Features:
  - Upserts by slug (safe to re-run multiple times)
  - Maps image_url to /products/<SKU>.webp if file exists
  - Maps extra images (ACC-014-01, ACC-014-02…) as JSONB array
  - Parses JSON-like columns (tags, color_variants, size_variants)
  - Skips rows with no name or slug
  - Prints a clean progress + summary report
"""

import csv
import json
import os
import re
import sys
from pathlib import Path

# ── env ─────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(".env.local")

SUPABASE_URL      = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_SERVICE  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

from supabase import create_client, Client
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE)

# ── Config ───────────────────────────────────────────────────────────────
CSV_FILE    = Path("promohub-catalog.csv")
IMAGES_DIR  = Path("public/products")           # where WebP files live
PUBLIC_PATH = "/products"                        # URL prefix served by Next.js

# ── Helpers ──────────────────────────────────────────────────────────────
def parse_json_field(value: str) -> list:
    """Parse a stringified JSON list safely, return [] on failure."""
    if not value or value.strip() in ("", "[]"):
        return []
    try:
        cleaned = value.strip()
        # CSV often double-quotes JSON strings — try a few normalizations
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        # Fallback: extract quoted items manually
        return re.findall(r'"([^"]+)"', value)

def to_bool(value: str) -> bool:
    return value.strip().lower() in ("true", "1", "yes")

def build_image_url(sku: str) -> str | None:
    """Return the public URL for the primary WebP image if it exists."""
    if not sku:
        return None
    webp = IMAGES_DIR / f"{sku}.webp"
    if webp.exists():
        return f"{PUBLIC_PATH}/{sku}.webp"
    return None

def build_images_array(sku: str) -> list[str]:
    """
    Find all variant images for a SKU:
      ACC-014.webp      → primary (not included here, that's image_url)
      ACC-014-01.webp   → extra image 1
      ACC-014-02.webp   → extra image 2
    """
    if not sku:
        return []
    extras = sorted(IMAGES_DIR.glob(f"{sku}-*.webp"))
    return [f"{PUBLIC_PATH}/{p.name}" for p in extras]

# ── Main ─────────────────────────────────────────────────────────────────
def main():
    if not CSV_FILE.exists():
        print(f"ERROR: {CSV_FILE} not found. Run from project root.")
        sys.exit(1)

    with open(CSV_FILE, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    total = len(rows)
    print(f"Importing {total} products from {CSV_FILE} ...\n")

    ok = skipped = errors = 0
    batch = []
    BATCH_SIZE = 50

    def flush(batch):
        if not batch:
            return 0, 0
        try:
            res = sb.table("products").upsert(
                batch,
                on_conflict="slug",
                returning="minimal"
            ).execute()
            return len(batch), 0
        except Exception as e:
            print(f"  BATCH ERROR: {e}")
            return 0, len(batch)

    for i, row in enumerate(rows, 1):
        name = row.get("name", "").strip()
        slug = row.get("slug", "").strip()

        if not name or not slug:
            skipped += 1
            print(f"  [{i:>3}/{total}] SKIP  (no name/slug)")
            continue

        sku = row.get("sku", "").strip()

        # Build images
        image_url = build_image_url(sku) or row.get("image_url", "").strip() or None
        images    = build_images_array(sku)

        # Parse prices
        try:
            price = float(row.get("price", 0) or 0)
        except ValueError:
            price = 0.0
        try:
            sale_price = float(row.get("selling price", 0) or 0)
            sale_price = sale_price if sale_price > 0 else None
        except ValueError:
            sale_price = None

        # Parse weight
        try:
            weight = float(row.get("weight_kg", 0) or 0) or None
        except ValueError:
            weight = None

        # Parse stock
        try:
            stock_qty = int(row.get("stock_quantity", 0) or 0)
        except ValueError:
            stock_qty = 0

        record = {
            "name":             name,
            "slug":             slug,
            "description":      row.get("description", "").strip() or None,
            "price":            price,
            "sale_price":       sale_price,
            "image_url":        image_url,
            "images":           images,
            "is_personalizable": to_bool(row.get("is_personalizable", "")),
            "in_stock":         to_bool(row.get("in_stock", "True")),
            "stock_quantity":   stock_qty,
            "sku":              sku or None,
            "status":           row.get("status", "published").strip() or "published",
            "weight_kg":        weight,
            "tags":             parse_json_field(row.get("tags", "")),
            "color_variants":   parse_json_field(row.get("color_variants", "")),
            "size_variants":    parse_json_field(row.get("size_variants", "")),
        }

        batch.append(record)
        print(f"  [{i:>3}/{total}] QUEUED  {slug}  (img: {image_url or 'none'}, extras: {len(images)})")

        if len(batch) >= BATCH_SIZE:
            b_ok, b_err = flush(batch)
            ok += b_ok; errors += b_err
            batch = []

    # Flush remaining
    b_ok, b_err = flush(batch)
    ok += b_ok; errors += b_err

    print(f"\n{'─'*60}")
    print(f"  Done!  {ok} upserted  |  {skipped} skipped  |  {errors} errors")
    print(f"  Supabase project: {SUPABASE_URL}")

if __name__ == "__main__":
    main()
