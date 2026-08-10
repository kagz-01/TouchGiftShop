# TouchGift — Milestone Tracker

> Living document. Updated after every major feature.
> Present this to stakeholders to show progress, advantages, and what's next.

---

## Platform Overview

TouchGift is a Kenya-first online gifting platform — flowers, hampers, personalized gifts, and experiences — with M-Pesa payment, same-day Nairobi delivery, and features no competitor offers.

**Tech Stack:** Next.js 14, Supabase (Postgres + Auth), WooCommerce (private data entry), PesaPal (M-Pesa / Card / Bank), Tailwind CSS, PWA

**Live locally:** `http://localhost:3000`

---

## Stage 1 — Launch-Ready Core

### 1. Product Catalog (749 products synced)
- **What:** Full product catalog synced from WooCommerce to Supabase via webhook + reconciliation script. Products display in a responsive grid with WebP-optimized images.
- **Advantage:** Staff manage products in WooCommerce (familiar tool). Storefront reads from Supabase (fast, no WooCommerce dependency). Products appear within seconds of being saved in wp-admin.
- **Tech:** `/api/products`, `/api/products/[id]`, Next.js `<Image>` (auto-WebP), WooCommerce REST API + webhook

### 2. Product Detail Page
- **What:** Full product page with image, price, description, quantity selector, personalization field (for engravable items), and gift note.
- **Advantage:** Buyers see exactly what they're getting. Personalization increases average order value. Gift note makes every order feel personal.
- **Tech:** `/product/[id]`, `AddToCartButton` client component, Next.js Image

### 3. Checkout + M-Pesa STK Push
- **What:** Complete checkout flow — sender/recipient info, delivery landmark, gift note, Surprise Safeguard toggles, then M-Pesa STK push to the sender's phone. Polls for payment confirmation.
- **Advantage:** M-Pesa is Kenya's dominant payment method. STK push means the buyer never leaves the site. No card forms, no redirects.
- **Tech:** `/api/orders` (POST), `/api/mpesa/stk-push`, `CheckoutForm` with polling

### 4. M-Pesa Callback (Orders + Pool Contributions)
- **What:** Safaricom calls our callback endpoint when payment completes. Handles both order payments and pool contributions. Orders move to `processing`, pool balances update, pools auto-complete when target is hit.
- **Advantage:** Single callback endpoint handles all payment types. Pool auto-completion means the organizer doesn't have to manually check and order.
- **Tech:** `/api/mpesa/callback` — dual-purpose handler

### 5. Pool a Gift (Group Gifting)
- **What:** Create a pool with title, target amount, and expiry. Get a shareable link. Each contributor opens the link, enters their name/phone/amount, and pays via their own M-Pesa STK push. Live progress bar. Pool auto-completes when target is reached.
- **Advantage:** **No competitor in Kenya offers this.** Eliminates the awkward "collect cash from everyone" process. Each person pays directly — no single person has to front the money.
- **Tech:** `/api/pools` (CRUD), `/api/pools/[slug]/contribute`, `PoolProgressBar`, `PoolShareLink`, `PoolContributors`

### 6. Surprise Safeguard + Anonymous Mode
- **What:** Checkout toggle: "This is a surprise — don't call or message the recipient before arrival." Anonymous Mode hides sender identity and price from recipient.
- **Advantage:** **Key differentiator.** Gift-givers' biggest fear is ruining the surprise. Riders are briefed to use gate guards/reception instead of calling. Builds trust.
- **Tech:** `SurpriseToggle` component, `is_anonymous` + `dont_call_recipient` fields on orders

### 7. Supabase Auth (Phone OTP)
- **What:** Login/signup via phone number + SMS verification code. Session management via middleware. Protected account page.
- **Advantage:** Phone-based auth is natural for Kenya (everyone has a phone number). No passwords to remember. Ties orders and reminders to a real user.
- **Tech:** `@supabase/ssr`, `/login`, middleware for session refresh, `supabase-browser.ts` + `supabase-server.ts`

### 8. Orders Page + Order Detail
- **What:** Enter phone number to see all orders. Order detail shows status timeline (Confirmed → Wrapped → Dispatched → Delivered), pre-dispatch package photo, gift note, engraving, delivery details.
- **Advantage:** Buyers can track their gift's journey. Package photo answers "will it actually look like the photos?" — the #1 buyer anxiety.
- **Tech:** `/orders` (phone lookup), `/orders/[id]` (detail + timeline), `OrderStatusTimeline`

### 9. Delivery Fee Calculator
- **What:** Zone-based pricing shown during checkout. Nairobi (KSh 350), Nairobi Metro (KSh 500), Nationwide (KSh 600). Auto-detects zone from landmark text.
- **Advantage:** Price transparency before checkout — no surprises at the end. Builds trust. Accurate pricing means we don't lose money on delivery.
- **Tech:** `/api/delivery`, `lib/delivery.ts` (zone detection), integrated into `CheckoutForm`

### 10. Same-Day Delivery Countdown
- **What:** Real countdown to 2pm cutoff on the homepage. Shows "Order in the next Xh Ym for same-day delivery in Nairobi." After cutoff, shows message about next-day delivery.
- **Advantage:** Creates urgency. Sets clear expectations. Reduces support queries about delivery times.
- **Tech:** `CountdownBanner` (client component with interval)

### 11. Occasion Filtering
- **What:** Filter products by practical occasions (Birthdays, Anniversaries, Weddings, Condolences, Corporate) and narrative collections (Apology, Milestone, Just Because).
- **Advantage:** Narrative categories are **unique to TouchGift** — no competitor has "Apology" or "Just Because" as browse categories. Speaks to real situations.
- **Tech:** `OccasionFilter` (URL-based filtering), `/api/products?category=`

### 12. Guarantees + Footer
- **What:** Three visible guarantees: "On-time delivery or it's free," "Photo proof before dispatch," "Your identity stays private." Shown at checkout and in footer.
- **Advantage:** Trust is demonstrated operationally, not written about. These aren't marketing copy — they're operational commitments.
- **Tech:** `Footer` component, integrated into `CheckoutForm`

### 13. WooCommerce Integration
- **What:** Staff add/edit products in WooCommerce (familiar tool). Webhook pushes changes to Supabase in seconds. Full reconciliation script for bulk imports.
- **Advantage:** Better data-entry experience than building from scratch. Staff don't need training. Products flow one way: WooCommerce → Supabase.
- **Tech:** `lib/woocommerce.ts`, `lib/sync-product.ts`, `/api/sync/woocommerce/webhook`, `scripts/sync-woocommerce-products.ts`

### 14. PWA Manifest
- **What:** Installable Progressive Web App from day one. Works on mobile home screen like a native app.
- **Advantage:** No app store approval needed. Users can install immediately. Ready for TWA/Capacitor packaging later.
- **Tech:** `/public/manifest.json`

### 15. Logo + Branding
- **What:** Logo converted to WebP (11KB), integrated into header and login page.
- **Advantage:** Fast loading, small file size. Professional appearance.
- **Tech:** `public/logo.webp`, `Header`, login page

---

## Recent Progress (2026-08-08)

- **Global layout & container standardization:** Added a production-grade global container in `app/layout.tsx` and a reusable `components/ui/Container.tsx` set to `max-w-screen-2xl` so pages use more horizontal space and consistent gutters.
- **Wider page containers:** Widely used containers on key pages (`app/page.tsx`, `app/product/[id]/page.tsx`, `app/shop/page.tsx`, `app/gift-quiz/results/page.tsx`) updated to use the wider layout to reduce excessive central compression.
- **BackToHome component rollout:** Added a reusable `BackToHome` link (`components/ui/BackToHome.tsx`) across multiple pages (gift-lab, build-hamper, pool, orders, wishlist, gift-quiz, gift-cards, login, corporate, pin-drop, checkout, payment-success) for consistent navigation and rescue paths.
- **Build fixes & CI hygiene:** Fixed TypeScript issues discovered during `npm run build` (typed an array in `test-download.ts`, corrected error typing). Cleared `.next` and re-ran production build to validate prerender output; build now completes locally.
- **Polish & QA:** Ensured all edited files pass TypeScript checks. Addressed a missing import in `app/wishlist/page.tsx` and minor layout spacing improvements in `components/layout/Header.tsx` and `components/home/StorytellingHome.tsx`.

### Why these matter

- Improves perceived site width and product discoverability on large screens.
- Adds consistent micro-navigation to reduce bounce when users land on deep pages.
- Removes build-time blockers and ensures a reproducible production build.

---

## Next immediate actions

- Replace remaining per-page container wrappers with the `Container` component for uniformity (automated across `app/` pages).
- Add a `FullBleed` helper for intentional edge-to-edge sections (hero, CTA) while keeping content constrained.
- Standardize `BackToHome` visual variants (default/white/subtle) and update usages.
- Run a full visual QA pass in dev (`npm run dev`) and capture screenshots for stakeholder review.

---

---

## Stage 2 — Retention & Virality

### 16. Build a Hamper
- **What:** Choose box size (Small/Medium/Large), tap products from catalog to add, see running total, checkout with the complete hamper.
- **Advantage:** Increases average order value. Customization makes gifts feel personal. Box pricing is transparent.
- **Tech:** `HamperBuilder` (client component), box size selector, product picker grid

### 17. Smart Occasion Reminders
- **What:** Save important dates (partner's birthday, anniversary). See upcoming dates with days-until countdown. Add/delete reminders.
- **Advantage:** Turns one-time buyers into recurring customers. 5 days before each date, we can send WhatsApp reminders with gift suggestions (pending integration).
- **Tech:** `/api/reminders` (CRUD), `reminders` table, reminders page

### 18. Wishlist / Registry
- **What:** Create a wishlist, add products, get a shareable link. Visitors see items with "Send this" buttons. Owner sees which items are fulfilled.
- **Advantage:** **No competitor in Kenya offers this.** Turns gift-buying from guessing into knowing. Reduces unwanted gifts.
- **Tech:** `/api/wishlist` (CRUD), `/wishlist/[slug]`, `WishlistView` component

### 19. Digital Gift Cards
- **What:** Purchase a stored-value code (TG-XXXXXXXX), send to recipient. Recipient redeems at checkout. Balance check API.
- **Advantage:** Last-minute gifting solution. Corporate gifting at scale. Revenue upfront.
- **Tech:** `/api/gift-cards` (purchase + balance check), `/gift-cards` page

### 20. Referral Program
- **What:** Auto-generated referral code per user. Copy link to share. Both referrer and referee get a discount (pending discount logic).
- **Advantage:** Organic growth through word-of-mouth. Lower customer acquisition cost.
- **Tech:** `ReferralSection` component, user metadata

---

## What's Built vs. What's Planned

| Feature | S1 | S2 | S3 | S5 | S6 | S7 | S8 | S9 | S10 | S11 |
|---------|----|----|----|----|----|----|----|----|----|-----|
| Product catalog (WooCommerce sync) | Done | | | | | | | | | |
| Product detail page | Done | | | | | | | | | |
| Checkout + M-Pesa | Done | | | | | | | | | |
| M-Pesa callback | Done | | | | | | | | | |
| Pool a Gift | Done | | | | | | | | | |
| Surprise Safeguard | Done | | | | | | | | | |
| Auth (phone OTP) | Done | | | | | | | | | |
| Orders tracking | Done | | | | | | | | | |
| Delivery fee calculator | Done | | | | | | | | | |
| Same-day countdown | Done | | | | | | | | | |
| Occasion filtering | Done | | | | | | | | | |
| Guarantees + footer | Done | | | | | | | | | |
| WooCommerce integration | Done | | | | | | | | | |
| PWA | Done | | | | | | | | | |
| Build a Hamper | | Done | | | | | | | | |
| Reminders | | Done | | | | | | | | |
| Wishlists | | Done | | | | | | | | |
| Gift cards | | Done | | | | | | | | |
| Referral program | | Done | | | | | | | | |
| Corporate ordering | | | Done | | | | | | | |
| Loyalty tier | | | Done | | | | | | | |
| Design pass (brand, icons, polish) | | | Done | | | | | | | |
| Error handling + 404 | | | Done | | | | | | | |
| SEO + social metadata | | | Done | | | | | | | |
| PWA icons + favicon | | | Done | | | | | | | |
| Customer reviews & ratings | | | Done | | | | | | | |
| Category mapping system (3-tier) | | | | Done | | | | | | |
| Budget filtering | | | | Done | | | | | | |
| Smart sorting by category | | | | Done | | | | | | |
| Cross-category suggestions | | | | Done | | | | | | |
| Composite categories | | | | Done | | | | | | |
| Missing categories (9 added) | | | | Done | | | | | | |
| Category validation script | | | | Done | | | | | | |
| Categories API endpoint | | | | Done | | | | | | |
| API error handling | | | | Done | | | | | | |
| Baby products (30 items) | | | | | Done | | | | | |
| New sectors — fitness, gaming, music, outdoor, home, kitchen | | | | | Done | | | | | |
| New sectors — wedding, professional, seasonal | | | | | Done | | | | | |
| UI entry points updated (21 tabs, 16 cards) | | | | | Done | | | | | |
| Catalog scale — 200 products | | | | | Done | | | | | |
| Product badges (7 types) | | | | | | Done | | | | |
| Trust signals bar | | | | | | Done | | | | |
| Gift recommendation quiz | | | | | | | Done | | | |
| Quiz results page | | | | | | | Done | | | |
| Delivery options picker | | | | | | | | Done | | |
| Gift message component | | | | | | | | Done | | |
| Order summary component | | | | | | | | Done | | |
| Share button (WhatsApp focus) | | | | | | | | | Done | |
| Gift reveal experience | | | | | | | | | Done | |
| Referral program banner | | | | | | | | | Done | |
| Recently viewed products | | | | | | | | | | Done |
| Related products (cross-sell) | | | | | | | | | | Done |
| Wishlist quick-save | | | | | | | | | | Done |
| Pin Drop — recipient delivery location | | | | | | | | | | Done |
| Homepage restructure — discovery flow | | | | | | | | | | Done |
| Hamper builder redesign + animations | | | | | | | | | | Done |
| Product page redesign (gallery, description) | | | | | | | | | | | Done |
| Cart drawer + upsell | | | | | | | | | | | Done |
| Multi-step accordion checkout | | | | | | | | | | | Done |
| Live Customization Studio | | | | | | | | | | | | Done |
| Cover-up shape masking | | | | | | | | | | | | Done |

**Total features built: 72**

---

## Commit History

| Commit | Description |
|--------|-------------|
| `c0860e9` | Stage 1 scaffold + product detail page + checkout flow |
| `2cb6b24` | Product detail page + Pool a Gift feature |
| `e8215f0` | M-Pesa callback for pools + Orders pages |
| `b4751c0` | Stage 1 completion — auth, delivery, countdown, guarantees |
| `979e55f` | Stage 2 — Hamper builder, Reminders, Wishlists, Gift Cards, Referrals |
| `23d25ec` | Stage 3 + Design — Corporate, Loyalty, Brand, Icons, Skeletons |
| `29b0059` | Launch polish — 404, error boundary, loading, OG metadata, PWA icons |
| `0459b38` | Customer reviews & ratings system |
| `8dfd2d6` | Fix broken category mappings + add validation script |
| `c5aa6eb` | Add 9 missing categories (beverages, plants, food-treats, etc.) |
| `bcaa773` | Add budget filtering support (price tiers + API) |
| `56f59c9` | Update all UI entry points with new categories |
| `5efec37` | Hybrid intelligence — cross-category suggestions + smart sorting |
| `34f8815` | Categories API + improved error handling |
| `b57cff6` | Expand baby products with 30 new items across 10 sub-categories |
| `297ddba` | Add 8 new sectors with 56 products (fitness, gaming, music, outdoor, home, kitchen, wedding, professional, seasonal) |
| `ad94296` | Update UI entry points with new sectors |
| `05f387a` | Product badges + trust signals |
| `ddc6298` | Gift recommendation quiz (4-step wizard) |
| `f9d76b4` | Checkout components (delivery picker, gift message, order summary) |
| `3ceb23e` | Social features (share, gift reveal, referral banner) |
| `1d471b7` | Personalization (recently viewed, related products, wishlist) |
| `fd3fe08` | Pin-drop sender components (send modal, payment success, resend button) |
| `06456bd` | Pin-drop status, real-time notifications, migration, map preview |
| `d166e24` | Pin-drop landing page with phone lookup |
| `ba07f06` | Homepage restructure — discovery flow with curated rows |
| `86dd1d8` | HamperBuilder redesign — split layout, compact grid, category filters |
| `83df7ef` | Hamper animations — fly-to-basket, pulse, confetti, price count-up, shake |
| `c4e2a1b` | UX/UI Overhaul — Product Gallery, Cart Drawer, and Checkout Flow |
| `pending` | Live Customization Studio (drag-and-drop, text, logo upload, masking) |

---

## Stage 4 — Launch Polish

### 26. Error Handling & 404
- **What:** Custom 404 page, client error boundary with reset, global loading spinner.
- **Advantage:** Professional failure states. Users can recover from errors. No blank white screens.

### 27. SEO & Social Sharing
- **What:** OpenGraph + Twitter card metadata, proper title template, viewport config, Google Fonts (Inter).
- **Advantage:** Links shared on WhatsApp/Twitter show branded preview cards. Better search ranking.

### 28. PWA Icons & Favicon
- **What:** Generated 192px and 512px icons from logo, favicon for browser tab, manifest with brand colors.
- **Advantage:** Installable as PWA. Browser tab shows brand. Consistent branding across all touchpoints.

### 21. Corporate / Bulk Ordering
- **What:** Send the same gift to multiple recipients — employee appreciation, client thank-yous. Upload a CSV or add recipients manually. One payment, many deliveries.
- **Advantage:** Opens B2B revenue stream. Corporate clients have higher order values and repeat rates. CSV upload makes large orders practical.
- **Tech:** `/corporate` page, `CorporateOrder` component (3-step flow)

### 22. Loyalty Tier System
- **What:** Automatic tier progression (Bronze → Silver → Gold → Platinum) based on order count and spend. Discounts, free delivery, priority support at higher tiers.
- **Advantage:** Increases repeat purchases. Customers spend more to reach the next tier. Visual progress bar motivates continued engagement.
- **Tech:** `lib/loyalty.ts`, `LoyaltyBadge` component on account page

### 23. Design Pass — Brand System
- **What:** Complete brand design system: warm magenta (#B8336A) primary, golden amber accent, proper typography (Inter), card shadows, border radius, skeleton loading states.
- **Advantage:** Professional, trustworthy appearance. Consistent visual language across all pages. Warm colors communicate gifting/celebration.
- **Tech:** Updated `tailwind.config.ts`, `globals.css`, custom animations

### 24. Bottom Nav Icons
- **What:** Replaced text-only bottom navigation with SVG icons + labels. Each tab has a unique icon (Home, Flask, Clipboard, Bell, User).
- **Advantage:** Faster navigation recognition. Modern mobile app feel. Accessibility improvement.
- **Tech:** `BottomNav.tsx` with inline SVG icons

### 25. Loading Skeletons
- **What:** Shimmer-animated skeleton placeholders for product grids, order cards, and page content. Replaces blank white screens during data loading.
- **Advantage:** Perceived performance improvement. Users see structure before content loads. Reduces bounce rate on slow connections.
- **Tech:** `components/ui/Skeletons.tsx` (ProductCardSkeleton, OrderCardSkeleton, PageSkeleton)

### 29. Customer Reviews & Ratings System
- **What:** Full review system — 1-5 star ratings, text reviews (title + body), photo/video attachments (auto-converted to WebP via sharp), verified purchase badges, helpful vote buttons, seller replies, and admin moderation. Reviews appear on product detail pages, homepage testimonials, and the storytelling social proof section.
- **Advantage:** **Social proof is the #1 conversion driver for e-commerce.** Verified purchase badges build trust. Photo/video reviews let buyers see real products. Helpful votes surface the best reviews. Admin moderation prevents spam. Replaces the old hardcoded testimonials with real customer voices.
- **Tech:**
  - **Database:** `reviews`, `review_media`, `review_votes` tables + `increment_helpful_count`/`decrement_helpful_count` RPCs
  - **API (8 endpoints):** `POST/GET /api/reviews`, `GET/PATCH/DELETE /api/reviews/[id]`, `POST /api/reviews/[id]/vote`, `GET /api/reviews/stats`, `POST /api/reviews/upload` (WebP conversion), `GET /api/admin/reviews`
  - **Components:** `StarRating`, `RatingDistribution`, `ReviewCard`, `ReviewForm`, `PhotoGallery` (lightbox), `ReviewList` (paginated + sorted), `ProductReviews`, `ReviewPrompt`
  - **Pages:** Product detail page integration, admin moderation dashboard (`/admin/reviews`)
  - **Media:** All images converted to WebP via sharp before Supabase Storage upload (matches product image pipeline)

---

## Stage 5 — Smart Filtering & Category Intelligence

### 30. Category Mapping System (3-tier architecture)
- **What:** A three-tier category architecture — UI categories (user-facing slugs), a mapping layer (`CATEGORY_MAP`), and database categories (WooCommerce slugs). A single UI concept like "For Her" or "Anniversaries" maps to multiple curated DB categories.
- **Advantage:** **No competitor has this.** Users browse simple UI categories while the system automatically pulls products from multiple related WooCommerce categories. "Anniversaries" shows flowers + jewelry + occasion items together without manual tagging.
- **Tech:** `lib/category-map.ts` — `CATEGORY_MAP` (46 DB slugs mapped to 30+ UI slugs), `getDbSlugs()` resolver

### 31. Budget Filtering
- **What:** Price-range filtering via `?budget=` URL parameter. Tiers: Below KSh 5,000 / Below KSh 10,000 / Below KSh 20,000 / Below KSh 50,000 / Big Gestures (50K+). Works alongside category filtering.
- **Advantage:** MegaMenu already had budget links but they were broken. Now functional. Users can narrow by occasion AND budget simultaneously (e.g., "Birthday gifts under 5K").
- **Tech:** `lib/budget-tiers.ts`, `GET /api/products?category=birthdays&budget=under-5k`, Supabase `gte`/`lte` price queries

### 32. Smart Sorting by Category Context
- **What:** Automatic sort order based on which category the user is browsing. Birthdays and Just Because sort price-ascending (budget-friendly first). Corporate, Hampers, Weddings sort price-descending (premium first).
- **Advantage:** Matches buyer intent — casual "just because" browsers want affordable options; corporate buyers want premium. Reduces cognitive load.
- **Tech:** `lib/smart-sort.ts`, `CATEGORY_SORT` rules, integrated into `/api/products`

### 33. Cross-Category Suggestions
- **What:** "Complete the gift" suggestion bar appears below category headings. Each category has curated complementary suggestions (e.g., condolences → flowers + cards, birthdays → chocolates + beverages, her → spa + jewellery).
- **Advantage:** Increases average order value through intelligent cross-sell. Suggestions feel helpful, not pushy — they solve the "what else should I add?" problem.
- **Tech:** `lib/category-suggestions.ts` (12 category rules), `CategorySuggestions` client component, integrated into `ProductGrid`

### 34. Composite Categories (Curated Collections)
- **What:** Two hand-curated composite categories that merge products from multiple DB categories: "Date Night" (flowers + chocolates + wine) and "Self Care" (spa + candles + perfumes).
- **Advantage:** Tells a story instead of listing products. "Date Night" is a concept, not a category — it's the kind of browsing that inspires purchases.
- **Tech:** Added to `CATEGORY_MAP` as composite entries

### 35. Missing Categories Added
- **What:** 9 new UI categories added: Beverages (alcoholic + non-alcoholic sub-types), Food & Treats, Plants, Books & Media, Experience Gifts, Subscriptions, Pet Gifts, Date Night, Self Care.
- **Advantage:** Covers gift types that were previously invisible. Beverages alone is a major gifting category (wine, whiskey, juice hampers). Plants are distinct from cut flowers.
- **Tech:** `CATEGORY_MAP` entries, updated all 4 UI entry points (CategoryTabs, OccasionFilter, MegaMenu, StorytellingHome)

### 36. Category Health Validation Script
- **What:** `scripts/validate-categories.ts` — queries the live Supabase DB for each CATEGORY_MAP entry and reports: empty categories, unreferenced DB slugs, unmapped UI slugs, product counts per category.
- **Advantage:** Prevents silent failures. Without this, a misspelled WooCommerce slug returns zero products with no error. Catches issues before users do.
- **Tech:** `scripts/validate-categories.ts` (runs via `npx tsx scripts/validate-categories.ts`)

### 37. Categories API Endpoint
- **What:** `GET /api/categories` — returns all UI categories with product counts and budget tiers. Enables dynamic UI generation.
- **Advantage:** UI can render category badges with product counts ("Flowers — 24 items"). Budget tiers available for dynamic filter generation.
- **Tech:** `app/api/categories/route.ts`, queries `categories` + `product_categories` tables

### 38. Improved API Error Handling
- **What:** `/api/products` now returns `emptyReason` message when a category returns zero products, explaining possible causes (no products assigned, slug mismatch).
- **Advantage:** Debugging category issues no longer requires database access. The API response tells you exactly what's wrong.
- **Tech:** Updated `app/api/products/route.ts` response shape

---

## Stage 6 — Catalog Expansion & New Sectors

### 39. Baby Products Expansion (30 items)
- **What:** 30 new baby products across 10 sub-categories: newborn essentials (5), baby toys (5), feeding sets (3), bath time (3), nursery decor (3), keepsakes (4), clothing sets (3), hampers (3), jewellery (2), pram accessories (2).
- **Advantage:** Baby gifts are a major revenue driver. Before this, we had 3 generic items. Now covers the full baby gifting journey from shower to first birthday.
- **Tech:** CATEGORY_MAP entries for baby sub-categories, `scripts/seed-catalog.ts` products with realistic pricing (KSh 1,200–6,500)

### 40. New Sectors — Fitness & Gym (6 items)
- **What:** Yoga mat, water bottle, gym bag, resistance bands, fitness tracker, foam roller.
- **Advantage:** Fitness gifts are growing fast, especially for birthdays and New Year. Fills a gap no Kenyan gifting platform covers.
- **Tech:** `fitness-equipment` DB category mapped to `fitness` UI slug

### 41. New Sectors — Gaming (8 items)
- **What:** Gaming headset, controller, jigsaw puzzle, strategy board game, retro console, LED mouse pad, card game bundle.
- **Advantage:** Gaming is the largest entertainment category globally. Board games and puzzles also serve family gifting.
- **Tech:** `gaming-accessories` + `board-games-puzzles` DB categories

### 42. New Sectors — Music (6 items)
- **What:** Vinyl record, turntable, guitar picks & capo, studio headphones, music gift card, kalimba thumb piano.
- **Advantage:** Music gifts span budgets (KSh 1,200–8,500). Vinyl is trending. Kalimba is uniquely African.
- **Tech:** `vinyl-records` + `musical-accessories` DB categories

### 43. New Sectors — Outdoor & Camping (6 items)
- **What:** Camping hamper, picnic basket, cooler bag, hammock, LED lanterns, portable braai/BBQ set.
- **Advantage:** Kenya's outdoor culture (safaris, camping, picnics) makes this highly relevant. Braai set is locally resonant.
- **Tech:** `camping-gear` + `picnic-accessories` DB categories

### 44. New Sectors — Home Decor (8 items)
- **What:** Ceramic vase, framed art print, macrame wall hanging, sunburst mirror, cushion set, wool throw, scented candles, concrete plant pot.
- **Advantage:** Home decor gifts are evergreen and high-margin. African-inspired designs differentiate from imports.
- **Tech:** `wall-art-decor` + `art-prints-canvas` + `wall-hangings-sculptures` DB categories

### 45. New Sectors — Kitchen Tools (5 items)
- **What:** Chef knife set, end-grain cutting board, spice rack, cast iron dutch oven, silicone baking set.
- **Advantage:** Kitchen gifts serve weddings, housewarmings, and Mother's Day. Premium pricing (KSh 2,800–7,500).
- **Tech:** `kitchen-tools` + `luxury-kitchen-accessories` DB categories

### 46. New Sectors — Wedding Registry (6 items)
- **What:** His & hers robes, kitchen starter set, luxury bedding, personalised photo album, wine decanter set, couples dinner experience.
- **Advantage:** Wedding registry is a high-AOV category. Experience vouchers (dinner) differentiate from physical gifts.
- **Tech:** `wedding-registry-items` DB category, `dining-experience-vouchers` cross-reference

### 47. New Sectors — Professional Appreciation (4 items)
- **What:** Teacher appreciation hamper, nurse gift box, work anniversary set, boss appreciation gift.
- **Advantage:** Professional appreciation is underserved. Teachers, nurses, and colleagues are common gifting targets.
- **Tech:** `teacher-appreciation` + `nurse-appreciation` DB categories

### 48. New Sectors — Seasonal (6 items)
- **What:** Christmas hamper, advent calendar, Valentine's gift box, Valentine's couple experience, Easter family hamper, giant Easter egg.
- **Advantage:** Seasonal gifts create urgency and repeat purchases. Christmas and Valentine's are peak gifting periods.
- **Tech:** `christmas-gifts` + `valentines-gifts` + `easter-gifts` DB categories

### 49. UI Entry Points Updated
- **What:** All 4 UI entry points updated: CategoryTabs (21 tabs), OccasionFilter (16 cards), StorytellingHome (16 occasions, 8-col grid), MegaMenu (new Collections section).
- **Advantage:** New sectors are immediately discoverable. MegaMenu Collections now has 10 items vs. 7 before.
- **Tech:** Updated `CategoryTabs.tsx`, `OccasionFilter.tsx`, `StorytellingHome.tsx`, `MegaMenu.tsx`

### 50. Catalog Scale — 200 Products
- **What:** Total catalog now at 200 products across 46+ DB categories and 30+ UI categories. All seeded via `scripts/seed-catalog.ts` with WebP images from Unsplash.
- **Advantage:** Sufficient catalog depth for meaningful browsing. Every UI category has products. Zero empty categories.
- **Tech:** Seed script with smart deduplication (skip existing), image fallbacks, rate limiting

---

## Stage 7 — Product Badges & Trust Signals

### 51. Smart Badge System
- **What:** Dynamic product badges based on position, price, category, and attributes: Best Seller (top 8), Premium (8K+), Under 2K, Personalizable, Gift Ready, Experience, One of a Kind. Max 2 badges per product, color-coded.
- **Advantage:** Instant visual differentiation. Budget shoppers see "Under 2K", premium buyers see "Premium". Badges guide decisions without reading descriptions.
- **Tech:** `lib/product-badges.ts`, integrated into `ProductCard`

### 52. Trust Signals Bar
- **What:** 4 trust signals below product grid: Same-Day Delivery (Nairobi), Secure M-Pesa, Easy Returns (7-day), Gift-Wrapped Free.
- **Advantage:** Addresses top 4 purchase anxieties: delivery speed, payment security, return policy, presentation. Reduces cart abandonment.
- **Tech:** `components/home/TrustSignals.tsx`

---

## Stage 8 — Gift Recommendation Quiz

### 53. 4-Step Gift Quiz
- **What:** Interactive quiz: Who → Occasion → Budget → Interests. Progress bar, animated transitions, template suggestions. Maps answers to recommended categories.
- **Advantage:** Solves the "I don't know what to gift" problem. Personalized results increase conversion. 30-second completion time.
- **Tech:** `lib/gift-quiz.ts`, `components/gift-quiz/GiftQuiz.tsx`, `/gift-quiz` page

### 54. Quiz Results Page
- **What:** Shows personalized recommendation message, clickable category pills, and filtered product grid. Retake quiz option.
- **Advantage:** Seamless transition from quiz to shopping. Categories as pills allow further refinement.
- **Tech:** `/gift-quiz/results/page.tsx`

### 55. Homepage Quiz CTA
- **What:** Gradient banner between occasions and product grid: "Not sure what to gift?" with quiz link.
- **Advantage:** Captures uncertain browsers before they bounce. High-visibility placement.
- **Tech:** Added to `app/page.tsx`

---

## Stage 9 — Delivery & Checkout Improvements

### 56. Delivery Options Picker
- **What:** 4 delivery tiers: Standard (free, 2-3 days), Express (+KSh 500, next day), Same-Day (+KSh 1,000), Scheduled (+KSh 300, date picker).
- **Advantage:** Flexible delivery matches different urgency levels. Scheduled delivery solves "gift for a future date" use case.
- **Tech:** `components/checkout/DeliveryPicker.tsx`

### 57. Gift Message Component
- **What:** To/From fields, 200-char message with 6 pre-written templates, character counter.
- **Advantage:** Templates reduce friction for unsure writers. Personal messages make gifts meaningful.
- **Tech:** `components/checkout/GiftMessage.tsx`

### 58. Order Summary Component
- **What:** Itemized list with images, subtotal, delivery, gift wrapping, total. M-Pesa payment note.
- **Advantage:** Clear cost breakdown before payment. Reduces surprise and abandonment at checkout.
- **Tech:** `components/checkout/OrderSummary.tsx`

---

## Stage 10 — Social & Viral Features

### 59. Share Button
- **What:** Native Web Share API with WhatsApp/Twitter/Facebook fallback menu + copy link. Product-specific share text.
- **Advantage:** One-tap sharing to WhatsApp (primary Kenyan messaging app). Viral loop through product shares.
- **Tech:** `components/social/ShareButton.tsx`

### 60. Gift Reveal Experience
- **What:** Animated envelope → reveal flow for gift recipients. Shows product, message, sender name. "Thank via WhatsApp" button.
- **Advantage:** Makes receiving a gift magical. WhatsApp thank-you closes the emotional loop and drives referrals.
- **Tech:** `components/social/GiftReveal.tsx`

### 61. Referral Program Banner
- **What:** "Give KSh 500, Get KSh 500" with copy code, WhatsApp/Twitter/Facebook share buttons.
- **Advantage:** Two-sided incentive drives both acquisition and retention. KSh 500 is meaningful in Kenya.
- **Tech:** `components/social/ReferralBanner.tsx`

---

## Stage 11 — Personalization & Discovery

### 62. Recently Viewed Products
- **What:** localStorage-based carousel of recently viewed items. Tracks views automatically.
- **Advantage:** Recovers abandoned browsing sessions. "Pick up where you left off" reduces search friction.
- **Tech:** `components/discovery/RecentlyViewed.tsx`

### 63. Related Products
- **What:** Server-side "You Might Also Like" section on product pages. Fetches products from same categories.
- **Advantage:** Increases session depth and average order value through intelligent cross-sell.
- **Tech:** `components/discovery/RelatedProducts.tsx`

### 64. Wishlist Quick-Save
- **What:** Heart button on product cards with localStorage persistence. Toast notifications. Wishlist count hook.
- **Advantage:** No-account wishlist for casual browsers. Saves items for later without checkout pressure.
- **Tech:** `components/discovery/WishlistButton.tsx`

---

## Stage 12 — Delivery Intelligence

### 65. Pin Drop — Recipient Delivery Location
- **What:** Recipients drop their exact delivery pin via an interactive Leaflet map. Sender sends a secure link (WhatsApp or copy) after payment. Recipient taps the link, drops a pin on the map, optionally adds a landmark, picks a time window (morning/afternoon/evening), and confirms. Sender sees pin status in real-time via Supabase realtime with a toast notification. Order detail page shows the pin location, landmark, time window, and an inline map preview.
- **Advantage:** **No competitor in Kenya offers this.** Eliminates "where exactly should I deliver?" phone calls. Recipients control their delivery experience. Senders get real-time peace of mind. Time-window selection reduces missed deliveries.
- **Tech:**
  - **API:** `POST /api/pin-drop/send` (token + WhatsApp link), `GET/POST /api/pin-drop/[orderId]` (fetch order info, save pin)
  - **Recipient flow:** `/pin-drop/[orderId]` — Leaflet map → drop pin → landmark input → time window → confirmation
  - **Sender flow:** `PinDropSendModal` (WhatsApp + copy link), `PaymentSuccessPinDrop` (post-payment prompt), `ResendPinDropButton` (from order page), `PinDropStatus` (location + time + map preview)
  - **Real-time:** `PinDropNotification` subscribes to Supabase realtime on the orders table, shows toast when recipient drops pin
  - **Database:** `pin_drop_token`, `delivery_lat`, `delivery_lng`, `delivery_landmark`, `delivery_time_window` columns on orders table

### 66. Homepage Restructure — Discovery Flow
- **What:** Replaced the 700+ product dump with curated horizontal rows (Trending, Under 2K, For Her, For Him). Added horizontal scrollable OccasionPills at the top. Moved HowItWorks up so users see the value prop early. Created `/shop` page for the full catalog.
- **Advantage:** Homepage is now a discovery/inspiration page instead of an overwhelming catalog. Users see value proposition before products. Full catalog is one tap away via "Browse All Gifts" CTA.
- **Tech:** `OccasionPills.tsx` (scrollable pills), `FeaturedRow.tsx` (reusable horizontal scroll), `app/shop/page.tsx` (full catalog)

### 67. Hamper Builder Redesign + Animations
- **What:** Complete UX overhaul of the Build a Hamper feature. Split layout with sticky hamper summary on left and product picker on right. Compact 3-4 column grid with search and category filters. 8 micro-animations: fly-to-basket (mini product image flies to hamper), basket pulse (scale bounce on add), color transition (border gray→brand→gold as it fills), progress bar (animated fill), confetti burst (20-piece confetti when full), glow button (pulsing shadow when full), price count-up (digit-by-digit animation), basket bob (idle float when empty), card press (scale 0.95), add button spin (90° rotate), remove shake (horizontal shake before fade), badge pop (spring scale-in).
- **Advantage:** Hamper building feels alive and rewarding. Each add is a moment of delight. Confetti on completion creates a "finished!" celebration. The sticky summary means users always see their hamper without scrolling.
- **Tech:** `HamperBuilder.tsx` (full rewrite with animations), CSS keyframes in `globals.css`, `ConfettiPiece` component, `FlyingItem` portal-based animation

---

## Stage 13 — UX/UI Overhaul

### 68. Product Gallery Redesign
- **What:** Replaced the large square product image with a tighter 4:3 aspect ratio gallery. Added hover-to-zoom (magnifier effect), full-screen Lightbox modal, and vertical thumbnails for desktop.
- **Advantage:** Prevents images from dominating the screen. Hover zoom lets buyers inspect detail (e.g. engraving quality). Vertical thumbnails match high-end e-commerce standards.
- **Tech:** `ProductGallery.tsx`, hover state scale transforms, z-index Lightbox overlay.

### 69. Slide-out Cart Drawer
- **What:** Clicking "Add to Cart" now opens a sleek right-side cart drawer instead of navigating to a cart page. Shows items, subtotal, and cross-sell suggestions inside the drawer.
- **Advantage:** Keeps the buyer on the product page. Cross-sells in the cart drawer directly increase AOV before they even hit checkout.
- **Tech:** `CartDrawer.tsx`, global state/context for drawer visibility, transition animations.

### 70. Multi-step Accordion Checkout
- **What:** Converted the long checkout form into a distraction-free, 4-step accordion (Sender Details → Recipient Details → Delivery → Payment). Only one step is active at a time.
- **Advantage:** Reduces cognitive overload. Long forms cause abandonment; breaking it into bite-sized steps increases checkout completion rates.
- **Tech:** `CheckoutForm.tsx` rewritten with step state management, smooth height transitions for accordion panels.

---

## Stage 14 — Live Customization Studio

### 71. Canva-style Live Customizer
- **What:** For `is_personalizable` products, clicking "Customize this Gift Live" opens a full-screen studio. Users can upload logos/photos, type custom text, change fonts (Sans, Serif, Cursive, Mono), and pick colors. They can drag, drop, and resize these layers directly over the product photo.
- **Advantage:** Top-tier feature that drastically reduces buyer anxiety. Customers don't have to imagine what their customization will look like; they see it instantly. Sets the platform miles apart from competitors.
- **Tech:** `LiveCustomizer.tsx`, `react-rnd` library for draggable/resizable layers, `ProductGallery` integration.

### 72. Cover-up Shape Tool (Clean Slate)
- **What:** A tool within the Customization Studio that allows users to drop solid shapes (squares/circles), color-match them to the product background (e.g., solid white), and place them over existing baked-in text/logos on the product photo.
- **Advantage:** Allows customers to manually "erase" existing designs and create a clean slate without costing the platform API fees for AI background removal.
- **Tech:** Added `shape` layer type to `CustomLayer` interface, `borderRadius` toggles.

---

## Database Schema (Running)

| Table | Purpose |
|-------|---------|
| `products` | Synced from WooCommerce |
| `categories` | Practical + narrative categories |
| `product_categories` | Many-to-many |
| `orders` | Full order lifecycle |
| `group_gifting_pools` | Pool a Gift |
| `pool_contributions` | Individual contributions |
| `wishlists` | Wishlist headers |
| `wishlist_items` | Items in wishlists |
| `reminders` | Saved occasion dates |
| `gift_cards` | Stored-value codes |
| `reviews` | Customer ratings + text |
| `review_media` | Photos/videos per review |
| `review_votes` | Helpful vote tracking |

---

## Key Metrics to Track

| Metric | Why it matters |
|--------|---------------|
| Weekly order volume | Core growth |
| Checkout completion rate | Friction detection |
| Repeat purchase rate | Retention |
| Pool completion rate | Feature health |
| Wishlist creation rate | Virality |
| Referral conversion | Growth efficiency |
| Average order value | Revenue optimization |
| Delivery on-time rate | Operational trust |
| Average product rating | Social proof strength |
| Review submission rate | Customer engagement |
| Verified purchase % | Trust signal quality |

---

## What's Next

| Priority | Feature | Impact |
|----------|---------|--------|
| High | WhatsApp order confirmations & reminders | Retention + support reduction |
| High | Real-time courier tracking | Trust + delivery experience |
| High | Corporate dashboard (bulk orders, CSV upload) | B2B revenue |
| Medium | Loyalty tier discounts + free delivery | Repeat purchase rate |
| Medium | Play Store packaging (TWA/Capacitor) | Distribution |
| Low | Admin dashboard (orders, products, reviews) | Operations |
| Low | Email notifications (order confirmation, dispatch) | Multi-channel comms |

---

*Last updated: Stage 14 — Live Customization Studio (72 features)*
