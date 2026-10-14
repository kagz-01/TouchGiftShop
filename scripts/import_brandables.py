#!/usr/bin/env python3
"""
TouchGift — Branded Corporate Gifts Import
================================================================
Loads catalog/brandables.csv (48 gift-first SKUs) into `products`, maps each
CSV category onto the real taxonomy slug, uploads any product imagery that
exists, then rebuilds category links.

Context: `coporate side.txt`. These are the ONLY branded products TouchGift
sells — things someone RECEIVES. Workwear, hi-vis, banners, gazebos and
uniforms stay off this platform and route to TouchLine (touchlineltd.co.ke).

Why this script exists: the CSV was never wired to anything. The corporate hero
and catalog both advertised categories and style counts that existed in neither
the CSV nor the database, and six of the catalog's nine slugs were absent from
the TAXONOMY set in lib/category-map.ts, so getDbSlugs() returned [] and those
filters silently showed the entire shop.

Usage:
    python3 scripts/import_brandables.py
    python3 scripts/import_brandables.py --dry-run
"""

import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(".env.local")

ROOT = Path(__file__).resolve().parent.parent
CSV_FILE   = ROOT / "catalog" / "brandables.csv"
# Optional. Drop `POL-001.webp` / `POL-001-1.webp` here to attach imagery —
# the CSV ships with empty image_url and images columns for all 48 rows.
IMAGES_DIR = ROOT / "catalog" / "brandables-images"
BUCKET     = "products"
FOLDER     = "corporate"
BATCH_SIZE = 50

# CSV category -> taxonomy slug. Must match lib/corporate-merch.ts exactly,
# otherwise a product lands in a bucket the UI has no link to.
CATEGORY_TO_SLUG = {
    "Branded Apparel":       "apparel",
    "Branded Accessories":   "accessories",
    "Branded Bags":          "bags",
    "Branded Outerwear":     "apparel",
    "Branded Headwear":      "accessories",
    "Home & Comfort Gifts":  "accessories",
    "Travel Gifts":          "accessories",
    "Desk Gifts":            "stationery-office",
}

# Slugs lib/category-map.ts actually recognises. Checked here rather than
# trusted, because an unknown slug drops the filter instead of erroring.
VALID_SLUGS = {
    "awards-trophies", "stationery-office", "drinkware", "bags", "clocks",
    "tech-gadgets", "accessories", "gift-sets", "apparel", "flowers",
    "perfumes", "fruits-edibles", "drinks",
}


def parse_json_list(value: str):
    if not value:
        return []
    try:
        parsed = json.loads(value.strip())
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return re.findall(r'"([^"]+)"', value)


def to_bool(value: str) -> bool:
    return str(value).strip().lower() in ("true", "1", "yes")


def storage_base(sb_url: str) -> str:
    return f"{sb_url}/storage/v1/object/public/{BUCKET}/{FOLDER}"


def build_image_url(sku: str, base: str) -> str | None:
    if not sku:
        return None
    webp = IMAGES_DIR / f"{sku}.webp"
    if webp.exists():
        return f"{base}/{sku}.webp"
    png = IMAGES_DIR / f"{sku}.png"
    if png.exists():
        return f"{base}/{sku}.png"
    return None


def build_images_array(sku: str, base: str) -> list[str]:
    if not sku or not IMAGES_DIR.exists():
        return []
    extras = sorted(
        p for p in IMAGES_DIR.glob(f"{sku}-*.*")
        if p.suffix.lower() in (".webp", ".png", ".jpg", ".jpeg")
    )
    return [f"{base}/{p.name}" for p in extras]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="parse and report without writing to Supabase")
    args = ap.parse_args()

    if not CSV_FILE.exists():
        print(f"ERROR: {CSV_FILE} not found")
        return 1

    with open(CSV_FILE, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    print(f"Read {len(rows)} rows from {CSV_FILE.name}")

    # ── Validate before touching the network ────────────────────────────
    seen_slugs, seen_skus = set(), set()
    problems: list[str] = []
    for row in rows:
        slug = (row.get("slug") or "").strip()
        sku = (row.get("sku") or "").strip()
        cat = (row.get("category") or "").strip()
        if not slug:
            problems.append(f"{sku or '?'}: missing slug")
        elif slug in seen_slugs:
            problems.append(f"{sku}: duplicate slug '{slug}'")
        seen_slugs.add(slug)
        if sku in seen_skus:
            problems.append(f"{sku}: duplicate SKU")
        seen_skus.add(sku)
        if cat not in CATEGORY_TO_SLUG:
            problems.append(f"{sku}: unknown CSV category '{cat}'")
        elif CATEGORY_TO_SLUG[cat] not in VALID_SLUGS:
            problems.append(f"{sku}: mapped slug '{CATEGORY_TO_SLUG[cat]}' is not in the taxonomy")

    by_cat: dict[str, int] = {}
    for row in rows:
        by_cat[(row.get("category") or "").strip()] = by_cat.get((row.get("category") or "").strip(), 0) + 1
    print("\nCategory breakdown (compare against lib/corporate-merch.ts):")
    for cat, n in sorted(by_cat.items(), key=lambda kv: -kv[1]):
        print(f"  {cat:24} {n:>3}  -> {CATEGORY_TO_SLUG.get(cat, '??')}")

    missing_img = sum(1 for r in rows if not (r.get("image_url") or "").strip())
    if missing_img:
        print(f"\nNOTE: {missing_img}/{len(rows)} rows have no image_url in the CSV.")
        print(f"      Add WebP/PNG files to {IMAGES_DIR}/<SKU>.webp and re-run to attach them.")

    if problems:
        print("\nVALIDATION PROBLEMS:")
        for p in problems:
            print(f"  - {p}")
        if args.dry_run:
            return 1

    if args.dry_run:
        print("\n--dry-run: nothing written.")
        return 0

    if problems:
        print("\nRefusing to import with validation problems. Fix the CSV first.")
        return 1

    # ── Connect ────────────────────────────────────────────────────────
    url     = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service:
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set")
        return 1

    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: pip install supabase")
        return 1

    sb = create_client(url, service)
    base = storage_base(url)

    # ── Upload imagery if present ──────────────────────────────────────
    if IMAGES_DIR.exists():
        files = [p for p in IMAGES_DIR.iterdir()
                 if p.suffix.lower() in (".webp", ".png", ".jpg", ".jpeg")]
        if files:
            print(f"\nUploading {len(files)} image(s) to {BUCKET}/{FOLDER}/ …")
            for p in files:
                try:
                    sb.storage.from_(BUCKET).upload(
                        f"{FOLDER}/{p.name}", p.read_bytes(),
                        {"content-type": "image/webp" if p.suffix == ".webp" else "image/png",
                         "upsert": "true"},
                    )
                except Exception as e:
                    print(f"  WARN {p.name}: {e}")
        else:
            print(f"\nNo imagery found in {IMAGES_DIR} — importing without product photos.")

    # ── Upsert products ────────────────────────────────────────────────
    print(f"\nUpserting {len(rows)} products …")
    ok = errors = 0
    batch: list[dict] = []

    def flush(batch):
        nonlocal ok, errors
        if not batch:
            return
        try:
            sb.table("products").upsert(batch, on_conflict="slug", returning="minimal").execute()
            ok += len(batch)
        except Exception as e:
            print(f"  BATCH ERROR ({len(batch)} rows): {e}")
            errors += len(batch)
        batch.clear()

    for i, row in enumerate(rows, 1):
        sku = (row.get("sku") or "").strip()
        cat = (row.get("category") or "").strip()
        slug = CATEGORY_TO_SLUG.get(cat)

        tags = parse_json_list(row.get("tags", ""))
        # Make the corporate-gift framing queryable from the storefront too.
        tags += ["corporate-gift", "branded-gift", "touchgift"]

        batch.append({
            "name":         (row.get("name") or "").strip(),
            "slug":         (row.get("slug") or "").strip(),
            "description":  (row.get("description") or "").strip(),
            # selling price is the customer price; price is our base cost
            "price":        float(row.get("selling price") or row.get("price") or 0),
            "cost_price":   float(row.get("price") or 0),
            "sku":          sku,
            "category":     slug,
            "image_url":    (row.get("image_url") or "").strip() or build_image_url(sku, base),
            "images":       parse_json_list(row.get("images", "")) or build_images_array(sku, base),
            "color_variants": parse_json_list(row.get("color_variants", "")),
            "size_variants":  parse_json_list(row.get("size_variants", "")),
            "is_personalizable": to_bool(row.get("is_personalizable", "true")),
            "in_stock":     to_bool(row.get("in_stock", "true")),
            "stock_quantity": int(float(row.get("stock_quantity") or 0)),
            "status":       (row.get("status") or "published").strip(),
            "weight_kg":    float(row.get("weight_kg") or 0),
            "tags":         tags,
        })

        if len(batch) >= BATCH_SIZE:
            flush(batch)
            print(f"  [{i:>3}/{len(rows)}] upserted ({ok} ok, {errors} errors)")

    flush(batch)
    print(f"\nDone: {ok} upserted, {errors} errors")

    # ── Rebuild category links ─────────────────────────────────────────
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        from link_categories import link_categories
        print("\nRebuilding category links …")
        link_categories()
    except Exception as e:
        print(f"  WARN link_categories failed: {e}")

    print(f"\nNext: upload product photos to {IMAGES_DIR}/ and re-run, then check")
    print(f"      /corporate and /corporate/catalog against lib/corporate-merch.ts counts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
