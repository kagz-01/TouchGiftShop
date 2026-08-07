# TouchGift — Milestone Tracker

> Living document. Updated after every major feature.
> Present this to stakeholders to show progress, advantages, and what's next.

---

## Platform Overview

TouchGift is a Kenya-first online gifting platform — flowers, hampers, personalized gifts, and experiences — with M-Pesa payment, same-day Nairobi delivery, and features no competitor offers.

**Tech Stack:** Next.js 14, Supabase (Postgres + Auth), WooCommerce (private data entry), M-Pesa Daraja, Tailwind CSS, PWA

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

| Feature | Stage 1 | Stage 2 | Stage 3 |
|---------|---------|---------|---------|
| Product catalog (WooCommerce sync) | Done | | |
| Product detail page | Done | | |
| Checkout + M-Pesa | Done | | |
| M-Pesa callback | Done | | |
| Pool a Gift | Done | | |
| Surprise Safeguard | Done | | |
| Auth (phone OTP) | Done | | |
| Orders tracking | Done | | |
| Delivery fee calculator | Done | | |
| Same-day countdown | Done | | |
| Occasion filtering | Done | | |
| Guarantees + footer | Done | | |
| WooCommerce integration | Done | | |
| PWA | Done | | |
| Build a Hamper | | Done | |
| Reminders | | Done | |
| Wishlists | | Done | |
| Gift cards | | Done | |
| Referral program | | Done | |
| Recipient pin drop (Google Maps) | | | Planned |
| Real-time courier tracking | | | Planned |
| Corporate ordering | | | Done |
| Loyalty tier | | | Done |
| Design pass (brand, icons, polish) | | | Done |
| Error handling + 404 | | | Done |
| SEO + social metadata | | | Done |
| PWA icons + favicon | | | Done |
| Customer reviews & ratings | | | Done |
| Recipient pin drop (Google Maps) | | | Planned |
| Real-time courier tracking | | | Planned |
| Play Store packaging | | | Planned |
| WhatsApp order confirmations | | | Planned |

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

*Last updated: Launch polish complete*
