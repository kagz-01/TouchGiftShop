# TouchGift
### Complete Implementation Plan

---

## 1. Vision

TouchGift is an online gifting platform for Kenya — flowers, hampers, personalized gifts, and gift experiences, ordered on the web or via a mobile app, paid for with M-Pesa, and delivered same-day in Nairobi / next-day nationwide.

The gifting category has two categories of problem: **operational** (can you actually source, wrap, and deliver a good gift reliably) and **experiential** (does the buying process reduce or increase the buyer's anxiety about getting it right). TouchGift's job is to be excellent at both — matching the delivery reliability of established players, while removing two specific frictions nobody in the market has solved: **not knowing the recipient's exact address**, and **splitting the cost of a gift among a group of people**.

---

## 2. Table-Stakes Features (Must Have, No Debate)

Every credible player in this market — Purpink Gifts, DnD Gifts, and the wider field of Kenyan gift shops — already offers these. TouchGift launches with all of them; none of these are "innovation," they're the price of entry:

- **Same-day delivery in Nairobi (order-by cutoff time), next-day delivery nationwide**
- **Curated catalog by occasion**: birthdays, anniversaries, weddings, condolences, graduations, corporate/employee gifts, Valentine's/Mother's Day/Father's Day seasonal collections
- **Personalization**: custom engraving, names/messages on select items
- **Gift wrapping and presentation** as a visible part of the product, not an afterthought
- **M-Pesa payment** as the default and most prominent payment method, card payment as a secondary option
- **A written delivery/shipping policy** (timelines, coverage areas, what happens if something goes wrong)
- **Phone and WhatsApp contact channels** — buyers expect to be able to reach a human quickly
- **A gift note/message** attached to every order
- **Delivery fee calculator by area**, shown before checkout, not as a surprise at the end
- **Order confirmation and basic status updates** (even if just "confirmed" → "out for delivery" → "delivered")
- **Corporate/bulk gifting** as a named service, not just a filter

None of this needs innovation — it needs to be executed cleanly, fast, and mobile-first from day one, since none of the incumbents are particularly fast or modern in their actual UI.

---

## 3. What Makes TouchGift Different

These are the features that don't exist elsewhere in this market and are the actual reason to choose TouchGift over an established competitor:

### 3.1 M-Pesa Group Gifting ("Pool a Gift")
Anyone can start a group gift pool for a wedding, baby shower, office send-off, or birthday: set a title, a target amount, and a deadline. TouchGift generates a shareable link. Each contributor opens the link, enters their name and amount, and pays via their own M-Pesa STK push — no single person has to collect cash from everyone and place the order themselves. A live progress bar shows the pool filling up, and the gift is automatically ordered once the target is hit (or the organizer can dispatch early at partial funding).

### 3.2 Recipient-Led Delivery ("They Drop the Pin")
The buyer often doesn't know — or doesn't want to awkwardly ask for — the recipient's exact address. Instead of a manual address form, the buyer only enters the recipient's phone number. TouchGift sends the recipient a private link to drop their own delivery pin and preferred time window, with pricing hidden. This removes the single most common point of friction and embarrassment in gift-sending.

### 3.3 The Surprise Safeguard
A prominent checkout toggle: *"This is a surprise. Do not call or message the recipient before arrival."* Riders are briefed to use gate guards, reception, or building landmarks instead. Paired with an **Anonymous Mode** that hides the sender's identity and the price from the recipient by default.

### 3.4 Recipient Wishlist / Registry
A sender (or the recipient themselves) can create a short wishlist of things they'd actually like — for birthdays, weddings, baby showers, or "just because" — and share the link. This turns gift-buying from *guessing* into *knowing*, which is the actual root of most gift-buying anxiety. No competitor in this market currently offers this.

### 3.5 Delivery Proof, Not Just a Tracking Number
Once a gift is packed, staff attach one photo of the sealed, finished package to the order before it leaves the warehouse — visible to the buyer on their order page. It's a simple operational step that directly answers the buyer's biggest fear: *"Will it actually look like the photos?"*

### 3.6 Smart Occasion Reminders
Buyers save important dates (a partner's birthday, an anniversary, a parent's retirement). Five days before each one, TouchGift sends a WhatsApp or push reminder with 2–3 curated gift suggestions matched to that relationship — turning a one-time purchase into a recurring habit, and bypassing the need to re-attract the buyer through search or ads each time.

### 3.7 Narrative Categories, Layered on Practical Ones
Alongside standard "For Him / For Her / Corporate" filters, TouchGift adds a few honest, locally resonant categories that speak to real situations: an Apology collection, a Milestone collection, a "Just Because" collection. These sit *alongside* the practical filters, not instead of them — buyers who want to browse fast by occasion still can.

### 3.8 Digital Gift Cards
A stored-value code, purchased and sent instantly, redeemable at checkout. Useful for last-minute gifting, corporate senders, or when the buyer genuinely doesn't know what the recipient would want and would rather let them choose.

### 3.9 Guarantees Instead of Corporate Filler
No "About Us" essay, no fabricated text testimonials. Instead, three visible guarantees at checkout and in the footer: **on-time delivery or it's free**, **photo proof before dispatch**, and **your identity stays private unless you choose to reveal it**. Trust is demonstrated operationally, not written about.

---

## 4. App Structure (Navigation)

A 5-tab structure, consistent across mobile web, desktop (as a top nav), and the eventual Play Store app:

| Tab | Contents |
|---|---|
| **Home** | Search-first discovery. Occasion filters + narrative collections (Apology, Milestone, Just Because). Featured/seasonal picks. Delivery-cutoff countdown for same-day orders. |
| **Gift Lab** | Two paths: **Build a Hamper** (choose a box size, tap items to add) and **Pool a Gift** (start or join a group funding pool with live progress tracking). |
| **Orders** | Active and past orders, each with a status timeline (Confirmed → Wrapped → Dispatched → Delivered), pre-dispatch photo, and courier tracking once available. |
| **Reminders** | Saved dates, upcoming occasion nudges, and a wishlist/registry manager. |
| **Account** | Saved addresses/landmarks, saved phone numbers, digital gift card balance, Anonymous Mode default toggle, and a direct WhatsApp support link. |

Cart and checkout are a flow launched from Home or Gift Lab, not a persistent tab.

---

## 5. Technical Approach

TouchGift is two systems with a strict, mostly one-way boundary between them — not a single monolith, and not a "headless WooCommerce store" either.

### 5.1 Architecture Map

| Concern | System | Notes |
|---|---|---|
| Product/category data entry, stock counts | **WooCommerce** (private, e.g. `admin.touchgift.co.ke`) | Staff-facing only. Never seen by buyers. Not the storefront. |
| Product catalog the storefront actually reads | **Supabase** (`products`, `categories` tables) | A synced copy, kept current by a webhook the moment staff save a change in wp-admin |
| Customer accounts | **Supabase Auth** | Not WooCommerce customer accounts — those stay unused, since checkout never happens on WooCommerce |
| Orders, group gifting pools, wishlists, reminders | **Supabase** (Postgres) | Custom logic with no WooCommerce equivalent |
| Application code, all business logic | **Next.js API routes**, version-controlled in **GitHub**, deployed on push (e.g. to Vercel) | The only system that talks to Supabase, Daraja, WhatsApp, and WooCommerce |
| Payments | **Safaricom Daraja**, called directly from Next.js | Never touches WooCommerce |
| Delivery status / messaging | **WhatsApp Business API**, courier partner API | Called from Next.js |

### 5.2 The sync boundary

Products flow **WooCommerce → Supabase** via a signed webhook (product saved in wp-admin → live on the storefront within seconds) plus a full-reconciliation script that can be re-run any time.

The one deliberate exception to "WooCommerce is read-only": once an order is confirmed paid, TouchGift writes a stock decrement back to WooCommerce, so staff aren't looking at stale stock counts in wp-admin for sales that happened entirely outside it. This is the only write path in either direction — everything else about orders, payments, and customers stays exclusively in Supabase.

### 5.3 Stack summary

- **Frontend:** Next.js + Tailwind, installable PWA from day one.
- **Backend/data:** Supabase (Postgres + Auth + Storage).
- **Product data entry:** WooCommerce, private, sync-only — not customer-facing.
- **Payments:** M-Pesa STK Push via Safaricom Daraja.
- **Messaging:** WhatsApp Business API.
- **Maps:** Google Maps/Places API.
- **Code hosting/deploy:** GitHub → Vercel (or equivalent).
- **Mobile app (later stage):** TWA or Capacitor wrapping the same PWA once web traction justifies it.

---

## 6. Build Order

**Stage 1 — Launch-ready core**
Home, Cart & Checkout, Orders, Account. Full catalog synced from WooCommerce, M-Pesa checkout, recipient-led pin-drop, Surprise Safeguard, Anonymous Mode, pre-dispatch photo, WhatsApp support, guarantees at checkout, real customer accounts via Supabase Auth. This alone is already differentiated from every competitor on the address-friction and trust fronts.

**Stage 2 — Retention and virality features**
Gift Lab (Build a Hamper + Pool a Gift), Reminders tab (saved dates + wishlist/registry), digital gift cards, referral program.

**Stage 3 — Scale and native presence**
Real-time courier tracking via 3PL integration, lightweight multi-recipient corporate ordering, loyalty tier, Play Store packaging.

---

## 7. Core Database Schema

Customer accounts use **Supabase Auth** (`auth.users`), referenced by the `user_id` foreign keys below — not WooCommerce customer accounts, which stay unused since checkout never happens on WooCommerce. `products`/`categories` are populated by the WooCommerce sync described in Section 5.2, not entered directly.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE order_status_enum AS ENUM (
  'pending_payment', 'processing', 'wrapped', 'dispatched', 'delivered', 'failed'
);
CREATE TYPE pool_status_enum AS ENUM ('active', 'completed', 'expired');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0.00,
    status order_status_enum DEFAULT 'pending_payment',
    sender_name VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    dont_call_recipient BOOLEAN DEFAULT FALSE,
    delivery_lat DECIMAL(10,8),
    delivery_lng DECIMAL(11,8),
    delivery_landmark TEXT,
    recipient_pin_requested BOOLEAN DEFAULT FALSE,
    pre_dispatch_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_gifting_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status pool_status_enum DEFAULT 'active',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pool_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID REFERENCES group_gifting_pools(id) ON DELETE CASCADE,
    contributor_name VARCHAR(100) NOT NULL,
    contributor_phone VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    mpesa_receipt_number VARCHAR(50) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    note TEXT,
    is_fulfilled BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_orders_recipient_phone ON orders(recipient_phone);
CREATE INDEX idx_group_pools_slug ON group_gifting_pools(slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_wishlists_slug ON wishlists(slug);
```

---

## 8. Compliance & Operations

- **Business registration** and an approved **M-Pesa paybill/till** (start the Safaricom approval process early — it has its own timeline).
- **Data Protection Act (Kenya) compliance**: TouchGift stores phone numbers, GPS pins, and photos belonging to recipients who never directly signed up — confirm ODPC registration obligations before launch.
- **Written refund/damage policy** for perishable items (flowers, food hampers), published before launch.
- **Privacy policy** accessible in-app and on the site, matching what's actually collected.
- **Formal agreements** with suppliers/florists and the chosen courier/3PL partner before scaling order volume.

---

## 9. Success Metrics by Stage

- **Stage 1:** consistent weekly order volume, checkout completion rate, repeat-purchase rate.
- **Stage 2:** share of orders coming from group pools, wishlist link creation rate, reminder-driven repeat purchases.
- **Stage 3:** retention lift from push notifications vs. WhatsApp-only, corporate order volume, referral-driven acquisition cost vs. paid ads.
