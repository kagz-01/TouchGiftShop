#!/usr/bin/env python3
"""
TouchGift — build the shop taxonomy and link products to categories
===================================================================
The catalog (promohub-catalog.csv) carries no category column; taxonomy
comes from SKU prefixes plus the product `tags`. This script:

  1. Deletes the legacy category rows (WooCommerce + older imports)
  2. Inserts the current top-level shop categories
  3. Links every product into its category(s) — many-to-many, so a flask
     set is both `drinkware` and `gift-sets`

Idempotent: safe to re-run. `scripts/full_import.py` calls this at the
end of every import so links are rebuilt automatically.

Run from project root:
  python3 scripts/link_categories.py
"""

import os
import re
import sys
from collections import Counter, defaultdict

from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_SERVICE = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

from supabase import create_client, Client

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE)

# ── The taxonomy ────────────────────────────────────────────────────────
# slug → display name. Slugs are permanent: they appear in every
# /shop?category=<slug> link, so rename the *name*, never the slug.
CATEGORIES = [
    ("Awards & Trophies", "awards-trophies"),
    ("Stationery & Office", "stationery-office"),
    ("Drinkware", "drinkware"),
    ("Bags", "bags"),
    ("Clocks & Timepieces", "clocks"),
    ("Tech & Gadgets", "tech-gadgets"),
    ("Accessories", "accessories"),
    ("Gift Sets & Hampers", "gift-sets"),
    ("Wearables & Apparel", "apparel"),
    ("Flowers", "flowers"),
    ("Fragrances", "perfumes"),
    ("Drinks & Spirits", "drinks"),
    ("Fruits & Edibles", "fruits"),
]

# SKU prefix → slugs. Prefixes are the most reliable signal: they are
# stable per product line (SET-48 sets, AWD-42 awards, ...).
PREFIX_TO_SLUG = {
    "SET": ["gift-sets"],
    "BOX": ["gift-sets"],
    "AWD": ["awards-trophies"],
    "ACC": ["accessories"],
    "DEC": ["accessories"],
    "NBK": ["stationery-office"],
    "PEN": ["stationery-office"],
    "FLK": ["drinkware"],
    "HPF": ["drinkware"],
    "BOT": ["drinkware"],
    "MUG": ["drinkware"],
    "BAG": ["bags"],
    "CLK": ["clocks"],
    "TCH": ["tech-gadgets"],
}

# Product tag → slug. Used in addition to the SKU prefix so products pick
# up second and third categories (a tumbler set is drinkware + gift-sets).
TAG_TO_SLUG = {
    # Awards
    "award": "awards-trophies",
    "trophy": "awards-trophies",
    "crystal": "awards-trophies",
    "recognition": "awards-trophies",
    "plaque": "awards-trophies",
    # Stationery & office
    "notebook": "stationery-office",
    "pen": "stationery-office",
    "stationery": "stationery-office",
    "writing": "stationery-office",
    "desk": "stationery-office",
    "office": "stationery-office",
    "organiser": "stationery-office",
    # Drinkware
    "drinkware": "drinkware",
    "mug": "drinkware",
    "flask": "drinkware",
    "hipflask": "drinkware",
    "insulated": "drinkware",
    "thermal": "drinkware",
    "tumbler": "drinkware",
    "bottle": "drinkware",
    "straw": "drinkware",
    # Bags
    "bag": "bags",
    "carrier bag": "bags",
    "gift bag": "bags",
    # Clocks
    "clock": "clocks",
    "timepiece": "clocks",
    "wall clock": "clocks",
    # Tech & gadgets
    "tech": "tech-gadgets",
    "gadget": "tech-gadgets",
    "bluetooth": "tech-gadgets",
    "speaker": "tech-gadgets",
    "charger": "tech-gadgets",
    "powerbank": "tech-gadgets",
    "portable charger": "tech-gadgets",
    "mousepad": "tech-gadgets",
    "smart": "tech-gadgets",
    # Accessories
    "accessory": "accessories",
    "keyring": "accessories",
    "wallet": "accessories",
    "cardholder": "accessories",
    "lapel pin": "accessories",
    "badge": "accessories",
    "magnet": "accessories",
    "coaster": "accessories",
    # Gift sets
    "gift set": "gift-sets",
    "ensemble": "gift-sets",
    "gift box": "gift-sets",
    "presentation": "gift-sets",
    "packaging": "gift-sets",
    "gift": "gift-sets",
    "filler": "gift-sets",
    # Future categories — matches as soon as such products are imported
    "apparel": "apparel",
    "hoodie": "apparel",
    "t-shirt": "apparel",
    "cap": "apparel",
    "overall": "apparel",
    "wearable": "apparel",
    "flowers": "flowers",
    "bouquet": "flowers",
    "perfume": "perfumes",
    "fragrance": "perfumes",
    "drinks": "drinks",
    "wine": "drinks",
    "whiskey": "drinks",
    "alcohol": "drinks",
    "edible": "fruits",
    "fruit": "fruits",
}

SLUGS = {slug for _, slug in CATEGORIES}
BATCH = 500


def chunks(items, size):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def slugs_for(product) -> set:
    slugs = set()
    # SKUs are PREFIX-NNN (AWD-004, SET-048, FLK-259, ...)
    m = re.match(r"[A-Za-z]+", (product.get("sku") or "").strip())
    if m:
        for s in PREFIX_TO_SLUG.get(m.group(0).upper(), []):
            slugs.add(s)
    for tag in product.get("tags") or []:
        s = TAG_TO_SLUG.get(str(tag).strip().lower())
        if s:
            slugs.add(s)
    return slugs & SLUGS


def link_categories() -> Counter:
    """Rebuild `categories` + `product_categories`. Returns per-category counts."""
    print("\n── Rebuilding taxonomy ──")

    # 1. Legacy categories (WooCommerce + older imports)
    try:
        old = sb.table("categories").select("id, slug").limit(5000).execute().data or []
    except Exception as e:
        print(f"  ❌  could not read categories: {e}")
        sys.exit(1)
    if old:
        sb.table("product_categories").delete().neq(
            "category_id", "00000000-0000-0000-0000-000000000000"
        ).execute()
        for c in chunks([r["id"] for r in old], BATCH):
            sb.table("categories").delete().in_("id", c).execute()
        print(f"  ✅  removed {len(old)} legacy categories")

    # 2. Fresh rows
    inserted = []
    for name, slug in CATEGORIES:
        res = (
            sb.table("categories")
            .insert({"name": name, "slug": slug, "kind": "practical"})
            .execute()
            .data
        )
        inserted.append({"slug": slug, "id": res[0]["id"]})
    by_slug = {r["slug"]: r["id"] for r in inserted}
    print(f"  ✅  created {len(inserted)} categories")

    # 3. Link products
    products = (
        sb.table("products").select("id, sku, tags").limit(5000).execute().data or []
    )
    rows, orphaned, counts = [], [], Counter()
    for p in products:
        slugs = slugs_for(p)
        if not slugs:
            orphaned.append(p.get("sku") or p.get("id"))
            continue
        for s in slugs:
            rows.append({"product_id": p["id"], "category_id": by_slug[s]})
            counts[s] += 1

    for c in chunks(rows, BATCH):
        sb.table("product_categories").upsert(c, on_conflict="product_id,category_id").execute()
    print(f"  ✅  linked {len(rows)} product↔category edges across {len(products)} products")

    if orphaned:
        print(f"  ⚠️  {len(orphaned)} products matched no category: {', '.join(orphaned)}")
    for _, slug in CATEGORIES:
        print(f"     {slug:<20} {counts[slug]}")
    return counts


if __name__ == "__main__":
    link_categories()
    print("\nDone.")
