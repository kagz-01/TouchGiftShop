# TouchGift — Project Scaffold

This is the Stage-1 skeleton described in the implementation plan: every
route, tab, and API endpoint exists as a working placeholder, wired together
correctly, ready to be filled in chunk by chunk.

## What's here

```
app/                       Next.js App Router pages
  page.tsx                 Home tab
  gift-lab/                Gift Lab tab (Build a Hamper, Pool a Gift)
  orders/                  Orders tab
  reminders/                Reminders tab
  account/                 Account tab
  checkout/                Checkout flow (not a tab)
  product/[id]/            Product detail page
  wishlist/[slug]/         Public wishlist/registry page
  api/                     API route stubs (orders, pools, wishlist, mpesa)
components/
  layout/                  Header, BottomNav (the 5-tab structure)
  home/, checkout/, gift-lab/, orders/, ui/
lib/
  supabase.ts, mpesa.ts, types.ts, utils.ts
db/
  schema.sql                Core Postgres schema
public/
  manifest.json              PWA manifest (installable from day one)
```

## What's intentionally NOT here yet

Per the implementation plan's cut list: live video/streaming, WebRTC voice,
AI rider-location chat, video-collage stitching, anonymous-admirer reveal,
corporate Excel bulk upload, gamified tiers, 3D box canvas, and any native
(Capacitor/TWA) packaging. Those are Stage 3+ or explicitly deferred —
adding them now would be scaffolding for infrastructure that doesn't exist.

## Suggested build order (chunk by chunk)

1. `lib/supabase.ts` + `db/schema.sql` — stand up the real database first.
2. `app/api/products` + `components/home/ProductGrid.tsx` — real catalog.
3. `app/api/orders` + `lib/mpesa.ts` — real checkout + payment.
4. `app/orders/[id]` status updates — even manual, before automating.
5. Gift Lab: pools first (higher differentiation value) then hamper builder.
6. Reminders + wishlists.
7. Design pass (see `/mnt/skills/public/frontend-design/SKILL.md`) once the
   functional skeleton is proven — do not skip this before real users see it.

## Hosting: cPanel's actual role

- **cPanel DNS Zone Editor**: point the main domain's A/CNAME records at
  wherever this Next.js app is deployed (e.g. Vercel).
- **MX records**: leave these alone so `@yourdomain` email keeps working
  through cPanel's mail server regardless of where the website itself runs.

## Architecture: Supabase is the source of truth for products

WooCommerce was dropped entirely — there is no wp-admin, no webhook and no
sync. `lib/woocommerce.ts`, `lib/sync-product.ts` and
`app/api/sync/woocommerce/webhook` are gone.

Products live in the Supabase `products` table and arrive two ways:

```
promohub-catalog.csv  ── scripts/full_import.py / import_catalog.py ──┐
                 admin CSV import (app/api/admin/products/import)
                                                              ▼
                                                    Supabase `products`
                                                              │
 /admin/products  ── create / update / delete ────────────────┤
                                                              ▼
                                       revalidateCatalog() on every mutation
                                       → / , /shop, /sitemap.xml refresh ≤60s
```

Product images live in the `products` bucket of Supabase Storage and are
served through the on-demand render endpoint (`lib/image-url.ts`) — about 75%
fewer bytes than the original files, with no `/_next/image` in the path.

### Categories

`categories` and the `product_categories` join table are the old WooCommerce
taxonomy. `lib/category-map.ts` translates the friendly slugs used in links
(`flowers`, `birthday`) into the DB slugs the shop queries.

> **Known gap:** `product_categories` is empty, so every category filter
> currently returns nothing. Text search (`?q=`) and budget tiers
> (`?budget=`) work as expected.

### One-time setup

1. Fill `.env.local` with the Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`).
2. Upload the WebP image batch into the `products` bucket
   (`products/corporate/<SKU>.webp`).
3. Load the catalog from the supplier CSV:
   ```bash
   python3 scripts/full_import.py
   ```

### Legacy columns

`products.woocommerce_id` and `categories.woocommerce_id` are leftovers.
Nothing reads or writes them any more.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real Supabase + M-Pesa keys
# Run db/schema.sql against your Supabase project (SQL Editor → paste → run)
npm run dev
```
