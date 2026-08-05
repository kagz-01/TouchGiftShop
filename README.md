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

## Hosting: cPanel/wp-admin's actual role

- **cPanel DNS Zone Editor**: point the main domain's A/CNAME records at
  wherever this Next.js app is deployed (e.g. Vercel).
- **MX records**: leave these alone so `@yourdomain` email keeps working
  through cPanel's mail server regardless of where the website itself runs.
- **wp-admin**: this is where WooCommerce actually lives now — see the
  architecture section below. Put it on a subdomain (e.g.
  `admin.touchgift.co.ke`) rather than the main domain, since it's a private
  staff tool, not the public storefront.

## Architecture: WooCommerce for data entry, everything else custom

Product/inventory data entry uses **WooCommerce running privately** (e.g.
at `admin.touchgift.co.ke`) — staff add and edit products there using
WooCommerce's normal product form, which is a better data-entry experience
than anything worth building from scratch at this stage.

**WooCommerce is not the storefront and does not touch checkout.** The
public site, checkout, M-Pesa payment, order status, group gifting pools,
wishlists, and the Surprise Safeguard are all still the custom Next.js +
Supabase system already in this repo — none of that fits WooCommerce's
single-payer order model anyway.

Products flow one way, WooCommerce → Supabase:

```
wp-admin (staff add/edit a product)
        │
        ▼  webhook, signed with WOOCOMMERCE_WEBHOOK_SECRET
app/api/sync/woocommerce/webhook   →  lib/sync-product.ts  →  Supabase `products`
        ▲
        │  full reconciliation, safe to re-run any time
scripts/sync-woocommerce-products.ts
```

### One-time setup

1. Install WordPress + WooCommerce on the private admin subdomain (this is
   what the wp-admin access is actually for).
2. WooCommerce → Settings → Advanced → REST API → generate a key with
   **Read** permissions. Put it in `.env.local` as `WOOCOMMERCE_CONSUMER_KEY`
   / `WOOCOMMERCE_CONSUMER_SECRET`.
3. WooCommerce → Settings → Advanced → Webhooks → new webhook:
   - Topic: **Product updated** (add a second one for **Product created**)
   - Delivery URL: `https://<your-domain>/api/sync/woocommerce/webhook`
   - Secret: any string, matching `WOOCOMMERCE_WEBHOOK_SECRET` in `.env.local`
4. Run the initial full sync so existing products show up immediately:
   ```bash
   npx tsx scripts/sync-woocommerce-products.ts
   ```
5. Seed the TouchGift-only narrative categories (Apology, Milestone, Just
   Because) — these have no WooCommerce equivalent:
   ```bash
   npx tsx scripts/seed-narrative-categories.ts
   ```

After that, editing a product in wp-admin updates the live TouchGift site
within seconds via the webhook — no manual re-sync needed. Re-run the full
sync script any time you want to reconcile everything at once (e.g. after
bulk-importing products via WooCommerce's own CSV importer).

### What doesn't come from WooCommerce

- `is_personalizable` has no WooCommerce equivalent yet — defaults to
  `false`. Set it manually in Supabase for now, or extend the sync to read
  a WooCommerce product tag once staff start using one.
- Narrative categories, seeded separately (above) since WooCommerce has no
  concept of "Apology" or "Just Because" as a taxonomy that needs to exist
  on their side.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real Supabase + M-Pesa keys
# Run db/schema.sql against your Supabase project (SQL Editor → paste → run)
npm run dev
```
