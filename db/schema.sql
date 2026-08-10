-- TouchGift core schema — see implementation plan Section 7.
-- Add products/categories tables (standard e-commerce shape) before Stage 1
-- launch; omitted here since they're conventional and not the differentiated
-- part of the system.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE order_status_enum AS ENUM (
  'pending_payment', 'processing', 'wrapped', 'dispatched', 'delivered', 'failed'
);
CREATE TYPE pool_status_enum AS ENUM ('active', 'completed', 'expired');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
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
    pin_drop_token VARCHAR(64) UNIQUE,
    delivery_time_window VARCHAR(50),
    pre_dispatch_photo_url TEXT,
    gift_note TEXT,
    engraving TEXT,
    quantity INTEGER DEFAULT 1,
    mpesa_checkout_request_id VARCHAR(50) UNIQUE,
    mpesa_receipt_number VARCHAR(50),
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

-- ---------------------------------------------------------------------
-- Catalog tables (added once product data entry became the next chunk)
-- ---------------------------------------------------------------------

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'practical' -- 'practical' | 'narrative'
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_personalizable BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_products_slug ON products(slug);

-- ---------------------------------------------------------------------
-- WooCommerce sync support (products/categories are entered in
-- WooCommerce; this is how they arrive here — see lib/woocommerce.ts)
-- ---------------------------------------------------------------------

ALTER TABLE products ADD COLUMN woocommerce_id INTEGER UNIQUE;
ALTER TABLE products ADD COLUMN synced_at TIMESTAMPTZ;

ALTER TABLE categories ADD COLUMN woocommerce_id INTEGER UNIQUE;

CREATE INDEX idx_products_woocommerce_id ON products(woocommerce_id);

-- ---------------------------------------------------------------------
-- Reminders (Stage 2 — saved occasion dates + nudge scheduling)
-- ---------------------------------------------------------------------

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    occasion_date DATE,
    occasion_type VARCHAR(50),
    is_subscription BOOLEAN DEFAULT FALSE,
    frequency VARCHAR(50),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    delivery_day VARCHAR(20),
    delivery_address TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_user_date ON reminders(user_id, occasion_date);

-- ---------------------------------------------------------------------
-- Digital gift cards (Stage 2)
-- ---------------------------------------------------------------------

CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    initial_amount DECIMAL(10,2) NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    sender_name VARCHAR(100),
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    message TEXT,
    is_redeemed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);

-- ---------------------------------------------------------------------
-- Reviews system (ratings, text, photos/videos, helpful votes)
-- ---------------------------------------------------------------------

CREATE TYPE review_status_enum AS ENUM ('pending', 'approved', 'flagged', 'rejected');

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    body TEXT,
    reviewer_name VARCHAR(100) NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    status review_status_enum DEFAULT 'approved',
    seller_reply TEXT,
    seller_replied_at TIMESTAMPTZ,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    voter_ip INET NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, voter_ip)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_review_media_review_id ON review_media(review_id);
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);

-- Helper RPCs for helpful vote toggling
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
  UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = review_id_param;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrement_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
  UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = review_id_param;
$$ LANGUAGE sql;
