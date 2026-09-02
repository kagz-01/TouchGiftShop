-- TouchGift core schema — see implementation plan Section 7.
-- Add products/categories tables (standard e-commerce shape) before Stage 1
-- launch; omitted here since they're conventional and not the differentiated
-- part of the system.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE order_status_enum AS ENUM (
  'pending_payment', 'processing', 'wrapped', 'dispatched', 'delivered', 'failed'
);
CREATE TYPE pool_status_enum AS ENUM ('active', 'completed', 'expired', 'fulfilled', 'cancelled', 'refunded');

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
    rider_lat DECIMAL(10,7),
    rider_lng DECIMAL(10,7),
    rider_updated_at TIMESTAMPTZ,
    recipient_pin_requested BOOLEAN DEFAULT FALSE,
    pin_drop_token VARCHAR(64) UNIQUE,
    pin_drop_token_expires_at TIMESTAMPTZ,
    track_token TEXT UNIQUE,
    rider_token TEXT UNIQUE,
    delivery_time_window VARCHAR(50),
    pre_dispatch_photo_url TEXT,
    gift_note TEXT,
    engraving TEXT,
    customization_image_url TEXT,
    quantity INTEGER DEFAULT 1,
    points_redeemed INTEGER DEFAULT 0,
    points_discount DECIMAL(10,2) DEFAULT 0,
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
    -- V2 columns (gift-pool-migration)
    recipient_name VARCHAR(100),
    recipient_photo_url TEXT,
    occasion VARCHAR(50),
    description TEXT,
    gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    gift_name VARCHAR(200),
    gift_price DECIMAL(10,2),
    gift_image_url TEXT,
    min_contribution DECIMAL(10,2) DEFAULT 50.00,
    over_target_behaviour VARCHAR(20) DEFAULT 'wallet_credit',
    under_target_action VARCHAR(20),
    privacy_mode VARCHAR(10) DEFAULT 'named',
    surprise_mode BOOLEAN DEFAULT TRUE,
    ghost_mode_allowed BOOLEAN DEFAULT TRUE,
    voice_message_url TEXT,
    video_message_url TEXT,
    organiser_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_placed_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    milestone_25_sent BOOLEAN DEFAULT FALSE,
    milestone_50_sent BOOLEAN DEFAULT FALSE,
    milestone_75_sent BOOLEAN DEFAULT FALSE,
    milestone_100_sent BOOLEAN DEFAULT FALSE,
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
    -- V2 columns (gift-pool-migration)
    message TEXT,
    payment_method VARCHAR(20) DEFAULT 'pesapal',
    payment_ref VARCHAR(100),
    pesapal_tracking_id VARCHAR(100),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_ghost BOOLEAN DEFAULT FALSE,
    split_parent_id UUID REFERENCES pool_contributions(id) ON DELETE SET NULL,
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
CREATE UNIQUE INDEX idx_orders_track_token ON orders(track_token) WHERE track_token IS NOT NULL;
CREATE UNIQUE INDEX idx_orders_rider_token ON orders(rider_token) WHERE rider_token IS NOT NULL;
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
    sale_price DECIMAL(10,2),
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_personalizable BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER,
    sku VARCHAR(50),
    status VARCHAR(20) DEFAULT 'published',
    weight_kg DECIMAL(8,2),
    tags JSONB DEFAULT '[]'::jsonb,
    seo_title VARCHAR(200),
    seo_description TEXT,
    color_variants JSONB DEFAULT '[]'::jsonb,
    size_variants JSONB DEFAULT '[]'::jsonb,
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
    product_ids JSONB DEFAULT '[]'::jsonb,
    delivery_day VARCHAR(20),
    delivery_address TEXT,
    google_maps_link TEXT,
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
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  sender_name VARCHAR(100),
  recipient_name VARCHAR(100),
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(200),
  message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    send_date DATE,
  pin VARCHAR(16),
  merchant_ref VARCHAR(100),
  delivery_methods JSONB DEFAULT '[]'::jsonb,
  sent_at TIMESTAMPTZ,
    style JSONB,
    is_redeemed BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_recipient_email ON gift_cards(recipient_email);
CREATE INDEX idx_gift_cards_merchant_ref ON gift_cards(merchant_ref);

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

-- ---------------------------------------------------------------------
-- Phase 3 Intelligence Layer — user_metrics + wallet
-- ---------------------------------------------------------------------

CREATE TABLE user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  wallet_balance DECIMAL(12,2) DEFAULT 0.00,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  total_gifts_sent INTEGER DEFAULT 0,
  total_gifts_received INTEGER DEFAULT 0,
  pools_created INTEGER DEFAULT 0,
  pools_joined INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  source VARCHAR(50), -- 'pool_refund', 'pool_overage', 'gift_card', 'manual'
  reference_id UUID, -- pool_id, gift_card_id, etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_metrics_user ON user_metrics(user_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE user_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ---------------------------------------------------------------------
-- Corporate Innovation — Phase 1-10 (20 tables)
-- ---------------------------------------------------------------------

-- Enums for corporate features

CREATE TYPE corporate_order_status AS ENUM (
  'draft', 'pending_payment', 'processing', 'wrapped',
  'dispatched', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE pool_tier AS ENUM ('casual', 'standard', 'premium', 'luxury');

CREATE TYPE milestone_trigger_type AS ENUM (
  'birthday', 'work_anniversary', 'promotion',
  'new_hire', 'farewell', 'holiday', 'custom'
);

CREATE TYPE whitelabel_plan AS ENUM ('starter', 'professional', 'enterprise');

CREATE TYPE client_tier AS ENUM ('platinum', 'gold', 'silver');

CREATE TYPE vendor_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

CREATE TYPE calendar_event_status AS ENUM (
  'scheduled', 'pool_active', 'ordered', 'sent', 'delivered', 'cancelled'
);

-- ═══ Phase 1: Corporate Hamper Builder + Brand Studio + Templates ═══

CREATE TABLE corporate_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  company_email VARCHAR(200),
  company_phone VARCHAR(20),
  tax_id VARCHAR(50),
  industry VARCHAR(100),
  employee_count INTEGER,
  credit_limit DECIMAL(12,2) DEFAULT 0.00,
  credit_used DECIMAL(12,2) DEFAULT 0.00,
  default_payment_terms VARCHAR(50) DEFAULT 'pay_now',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#9B1B5A',
  secondary_color VARCHAR(7),
  custom_domain VARCHAR(200),
  tagline VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hamper_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  item_count INTEGER DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  occasions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hamper_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES hamper_templates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE corporate_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status corporate_order_status DEFAULT 'draft',
  company_name VARCHAR(200),
  sender_name VARCHAR(100) NOT NULL,
  sender_phone VARCHAR(20) NOT NULL,
  custom_message TEXT,
  gift_wrap VARCHAR(20) DEFAULT 'standard',
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  hamper_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipient_count INTEGER DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0.00,
  bulk_discount_percent DECIMAL(5,2) DEFAULT 0.00,
  bulk_discount_amount DECIMAL(12,2) DEFAULT 0.00,
  wrap_surcharge DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) DEFAULT 0.00,
  delivery_date DATE,
  payment_tracking_id VARCHAR(100),
  payment_merchant_ref VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE corporate_order_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_order_id UUID REFERENCES corporate_orders(id) ON DELETE CASCADE,
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  personal_note TEXT,
  status corporate_order_status DEFAULT 'draft',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budget_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  tier pool_tier NOT NULL,
  min_budget DECIMAL(10,2) NOT NULL,
  max_budget DECIMAL(10,2) NOT NULL,
  preferred_categories TEXT[] DEFAULT '{}',
  excluded_product_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 2: Team Gift Pool (Corporate Kuchanga) ═══

CREATE TABLE corporate_gift_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  creator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status pool_status_enum DEFAULT 'active',
  recipient_name VARCHAR(100) NOT NULL,
  recipient_role VARCHAR(100),
  recipient_department VARCHAR(100),
  occasion VARCHAR(50) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) DEFAULT 0.00,
  min_contribution DECIMAL(10,2) DEFAULT 200.00,
  deadline TIMESTAMPTZ NOT NULL,
  company_match_enabled BOOLEAN DEFAULT FALSE,
  company_match_ratio DECIMAL(5,2) DEFAULT 1.00,
  company_match_cap DECIMAL(10,2) DEFAULT 5000.00,
  company_match_used DECIMAL(10,2) DEFAULT 0.00,
  show_leaderboard BOOLEAN DEFAULT TRUE,
  auto_reminders BOOLEAN DEFAULT TRUE,
  anonymous_contributions BOOLEAN DEFAULT FALSE,
  contributor_count INTEGER DEFAULT 0,
  milestone_25_sent BOOLEAN DEFAULT FALSE,
  milestone_50_sent BOOLEAN DEFAULT FALSE,
  milestone_75_sent BOOLEAN DEFAULT FALSE,
  milestone_100_sent BOOLEAN DEFAULT FALSE,
  order_placed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE corporate_pool_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID REFERENCES corporate_gift_pools(id) ON DELETE CASCADE,
  contributor_name VARCHAR(100) NOT NULL,
  contributor_phone VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  message TEXT,
  payment_method VARCHAR(20) DEFAULT 'mpesa',
  payment_ref VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  company_matched_amount DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 3: Corporate Gifting Calendar ═══

CREATE TABLE corporate_calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type milestone_trigger_type NOT NULL,
  recipient_name VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(200),
  recipient_phone VARCHAR(20),
  department VARCHAR(100),
  role VARCHAR(100),
  gift_budget DECIMAL(10,2),
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  custom_message TEXT,
  auto_order BOOLEAN DEFAULT FALSE,
  auto_pool BOOLEAN DEFAULT FALSE,
  pool_id UUID REFERENCES corporate_gift_pools(id) ON DELETE SET NULL,
  reminder_days_before INTEGER DEFAULT 7,
  status calendar_event_status DEFAULT 'scheduled',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 4: WhatsApp Bot ═══

CREATE TABLE whatsapp_bot_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  total_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  flow_id UUID REFERENCES whatsapp_bot_flows(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(100),
  message_text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  external_message_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 5: White-Label Portal ═══

CREATE TABLE whitelabel_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name VARCHAR(200) NOT NULL,
  plan whitelabel_plan DEFAULT 'starter',
  commission_rate DECIMAL(5,2) DEFAULT 8.00,
  brand_name VARCHAR(200),
  brand_color VARCHAR(7) DEFAULT '#9B1B5A',
  logo_url TEXT,
  custom_domain VARCHAR(200),
  monthly_order_limit INTEGER DEFAULT 50,
  monthly_orders_used INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  total_commission_earned DECIMAL(12,2) DEFAULT 0.00,
  pending_payout DECIMAL(12,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whitelabel_storefronts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whitelabel_account_id UUID REFERENCES whitelabel_accounts(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  custom_domain VARCHAR(200),
  theme_config JSONB DEFAULT '{}'::jsonb,
  product_ids UUID[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 6: Client Appreciation Network ═══

CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  role VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(20),
  location VARCHAR(100),
  tier client_tier DEFAULT 'silver',
  relationship_strength INTEGER DEFAULT 50 CHECK (relationship_strength >= 0 AND relationship_strength <= 100),
  total_gifts_sent INTEGER DEFAULT 0,
  total_amount_spent DECIMAL(12,2) DEFAULT 0.00,
  last_gift_date DATE,
  birthday DATE,
  work_anniversary DATE,
  next_occasion VARCHAR(50),
  next_occasion_date DATE,
  notes TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_gift_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  corporate_order_id UUID REFERENCES corporate_orders(id) ON DELETE SET NULL,
  gift_name VARCHAR(200) NOT NULL,
  gift_amount DECIMAL(10,2) NOT NULL,
  occasion VARCHAR(50),
  occasion_date DATE,
  status VARCHAR(20) DEFAULT 'sent',
  recipient_feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_occasions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  occasion_type VARCHAR(50) NOT NULL,
  occasion_date DATE NOT NULL,
  recurring BOOLEAN DEFAULT TRUE,
  recurrence_pattern VARCHAR(20) DEFAULT 'yearly',
  gift_budget DECIMAL(10,2),
  auto_gift BOOLEAN DEFAULT FALSE,
  template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  last_triggered_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 7: Corporate Impact Dashboard ═══

CREATE TABLE corporate_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_gifts_sent INTEGER DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0.00,
  avg_gift_value DECIMAL(10,2) DEFAULT 0.00,
  pools_created INTEGER DEFAULT 0,
  pool_participation_rate DECIMAL(5,2) DEFAULT 0.00,
  total_pool_contributions INTEGER DEFAULT 0,
  clients_served INTEGER DEFAULT 0,
  client_retention_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_relationship_strength DECIMAL(5,2) DEFAULT 0.00,
  employee_satisfaction_score DECIMAL(5,2) DEFAULT 0.00,
  milestone_gifts_sent INTEGER DEFAULT 0,
  whatsapp_messages_sent INTEGER DEFAULT 0,
  whatsapp_response_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 8: Virtual Showroom ═══

CREATE TABLE showroom_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  product_ids UUID[] DEFAULT '{}',
  layout JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE showroom_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  configuration_id UUID REFERENCES showroom_configurations(id) ON DELETE CASCADE,
  viewer_ip INET,
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  view_duration_seconds INTEGER,
  viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 9: Automated Milestone Gifting ═══

CREATE TABLE milestone_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_type milestone_trigger_type NOT NULL,
  gift_budget DECIMAL(10,2) NOT NULL,
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  custom_message_template TEXT,
  auto_order BOOLEAN DEFAULT FALSE,
  auto_pool BOOLEAN DEFAULT FALSE,
  notify_hr BOOLEAN DEFAULT TRUE,
  send_whatsapp BOOLEAN DEFAULT TRUE,
  trigger_days_before INTEGER DEFAULT 0,
  trigger_time TIME DEFAULT '09:00:00',
  escalation_enabled BOOLEAN DEFAULT FALSE,
  escalation_tiers JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  total_triggered INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE milestone_trigger_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES milestone_rules(id) ON DELETE CASCADE,
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20),
  trigger_type milestone_trigger_type NOT NULL,
  trigger_date DATE NOT NULL,
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_amount DECIMAL(10,2),
  pool_id UUID REFERENCES corporate_gift_pools(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'triggered',
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  hr_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Phase 10: B2B2C Marketplace ═══

CREATE TABLE marketplace_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  specialty VARCHAR(100),
  logo_url TEXT,
  banner_url TEXT,
  status vendor_status DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  business_registration_number VARCHAR(50),
  tax_certificate_url TEXT,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  delivery_time VARCHAR(50),
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  free_delivery_threshold DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  pending_payout DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  bulk_price DECIMAL(10,2),
  bulk_min_quantity INTEGER,
  category VARCHAR(50),
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  free_delivery BOOLEAN DEFAULT FALSE,
  handling_time VARCHAR(50) DEFAULT '1-2 days',
  total_sold INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  orders_included INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(20) DEFAULT 'mpesa',
  payment_ref VARCHAR(100),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Indexes — all tables
-- ---------------------------------------------------------------------

-- Existing tables (original)
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_woocommerce_id ON products(woocommerce_id);
CREATE INDEX idx_reminders_user_date ON reminders(user_id, occasion_date);
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_review_media_review_id ON review_media(review_id);
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);

-- Pool v2 indexes
CREATE INDEX idx_pools_organiser ON group_gifting_pools(organiser_user_id);
CREATE INDEX idx_pools_status ON group_gifting_pools(status);
CREATE INDEX idx_pools_expires ON group_gifting_pools(expires_at);
CREATE INDEX idx_contributions_pool ON pool_contributions(pool_id);
CREATE INDEX idx_contributions_created ON pool_contributions(created_at DESC);

-- Corporate Phase 1
CREATE INDEX idx_corporate_accounts_user ON corporate_accounts(user_id);
CREATE INDEX idx_corporate_accounts_company ON corporate_accounts(company_name);
CREATE INDEX idx_brand_profiles_account ON brand_profiles(corporate_account_id);
CREATE INDEX idx_hamper_templates_category ON hamper_templates(category);
CREATE INDEX idx_hamper_templates_active ON hamper_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_hamper_template_items_template ON hamper_template_items(template_id);
CREATE INDEX idx_corporate_orders_account ON corporate_orders(corporate_account_id);
CREATE INDEX idx_corporate_orders_user ON corporate_orders(user_id);
CREATE INDEX idx_corporate_orders_status ON corporate_orders(status);
CREATE INDEX idx_corporate_orders_created ON corporate_orders(created_at DESC);
CREATE INDEX idx_corporate_order_recipients_order ON corporate_order_recipients(corporate_order_id);
CREATE INDEX idx_budget_rules_account ON budget_rules(corporate_account_id);

-- Corporate Phase 2
CREATE INDEX idx_corp_pools_account ON corporate_gift_pools(corporate_account_id);
CREATE INDEX idx_corp_pools_creator ON corporate_gift_pools(creator_user_id);
CREATE INDEX idx_corp_pools_slug ON corporate_gift_pools(slug);
CREATE INDEX idx_corp_pools_status ON corporate_gift_pools(status);
CREATE INDEX idx_corp_pools_deadline ON corporate_gift_pools(deadline);
CREATE INDEX idx_corp_pool_contributions_pool ON corporate_pool_contributions(pool_id);
CREATE INDEX idx_corp_pool_contributions_created ON corporate_pool_contributions(created_at DESC);

-- Corporate Phase 3
CREATE INDEX idx_calendar_events_account ON corporate_calendar_events(corporate_account_id);
CREATE INDEX idx_calendar_events_date ON corporate_calendar_events(event_date);
CREATE INDEX idx_calendar_events_type ON corporate_calendar_events(event_type);
CREATE INDEX idx_calendar_events_status ON corporate_calendar_events(status);

-- Corporate Phase 4
CREATE INDEX idx_whatsapp_flows_account ON whatsapp_bot_flows(corporate_account_id);
CREATE INDEX idx_whatsapp_messages_account ON whatsapp_messages(corporate_account_id);
CREATE INDEX idx_whatsapp_messages_flow ON whatsapp_messages(flow_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_sent ON whatsapp_messages(sent_at DESC);

-- Corporate Phase 5
CREATE INDEX idx_whitelabel_user ON whitelabel_accounts(user_id);
CREATE INDEX idx_whitelabel_domain ON whitelabel_accounts(custom_domain);
CREATE INDEX idx_whitelabel_storefronts_account ON whitelabel_storefronts(whitelabel_account_id);
CREATE INDEX idx_whitelabel_storefronts_slug ON whitelabel_storefronts(slug);

-- Corporate Phase 6
CREATE INDEX idx_client_profiles_account ON client_profiles(corporate_account_id);
CREATE INDEX idx_client_profiles_tier ON client_profiles(tier);
CREATE INDEX idx_client_profiles_next_occasion ON client_profiles(next_occasion_date);
CREATE INDEX idx_client_gift_history_client ON client_gift_history(client_id);
CREATE INDEX idx_client_occasions_client ON client_occasions(client_id);

-- Corporate Phase 7
CREATE INDEX idx_corporate_analytics_account ON corporate_analytics(corporate_account_id);
CREATE INDEX idx_corporate_analytics_period ON corporate_analytics(period_start, period_end);

-- Corporate Phase 8
CREATE INDEX idx_showroom_config_account ON showroom_configurations(corporate_account_id);
CREATE INDEX idx_showroom_views_config ON showroom_views(configuration_id);
CREATE INDEX idx_showroom_views_product ON showroom_views(product_id);

-- Corporate Phase 9
CREATE INDEX idx_milestone_rules_account ON milestone_rules(corporate_account_id);
CREATE INDEX idx_milestone_rules_trigger ON milestone_rules(trigger_type);
CREATE INDEX idx_milestone_trigger_log_rule ON milestone_trigger_log(rule_id);
CREATE INDEX idx_milestone_trigger_log_account ON milestone_trigger_log(corporate_account_id);
CREATE INDEX idx_milestone_trigger_log_date ON milestone_trigger_log(trigger_date);

-- Corporate Phase 10
CREATE INDEX idx_marketplace_vendors_user ON marketplace_vendors(user_id);
CREATE INDEX idx_marketplace_vendors_status ON marketplace_vendors(status);
CREATE INDEX idx_marketplace_vendors_rating ON marketplace_vendors(avg_rating DESC);
CREATE INDEX idx_marketplace_products_vendor ON marketplace_products(vendor_id);
CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX idx_marketplace_products_active ON marketplace_products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vendor_payouts_vendor ON vendor_payouts(vendor_id);
CREATE INDEX idx_vendor_payouts_status ON vendor_payouts(status);

-- ---------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE group_gifting_pools;
ALTER PUBLICATION supabase_realtime ADD TABLE pool_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE corporate_gift_pools;
ALTER PUBLICATION supabase_realtime ADD TABLE corporate_pool_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE corporate_calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE milestone_trigger_log;

-- ---------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
  UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = review_id_param;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrement_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
  UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = review_id_param;
$$ LANGUAGE sql;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corporate_accounts_updated_at
  BEFORE UPDATE ON corporate_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corporate_orders_updated_at
  BEFORE UPDATE ON corporate_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corporate_gift_pools_updated_at
  BEFORE UPDATE ON corporate_gift_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corporate_calendar_events_updated_at
  BEFORE UPDATE ON corporate_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_bot_flows_updated_at
  BEFORE UPDATE ON whatsapp_bot_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whitelabel_accounts_updated_at
  BEFORE UPDATE ON whitelabel_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_rules_updated_at
  BEFORE UPDATE ON milestone_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_vendors_updated_at
  BEFORE UPDATE ON marketplace_vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at
  BEFORE UPDATE ON marketplace_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Corporate pool balance recalculation
CREATE OR REPLACE FUNCTION recalculate_corporate_pool_balance(pool_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO new_balance
  FROM corporate_pool_contributions
  WHERE pool_id = pool_uuid AND is_verified = TRUE;

  UPDATE corporate_gift_pools
  SET current_balance = new_balance,
      contributor_count = (
        SELECT COUNT(DISTINCT contributor_phone)
        FROM corporate_pool_contributions
        WHERE pool_id = pool_uuid AND is_verified = TRUE
      )
  WHERE id = pool_uuid;

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Auto-complete pool when target is hit
CREATE OR REPLACE FUNCTION check_corporate_pool_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_verified = TRUE AND NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    PERFORM recalculate_corporate_pool_balance(NEW.pool_id);

    UPDATE corporate_gift_pools
    SET status = 'completed'
    WHERE id = NEW.pool_id
      AND status = 'active'
      AND current_balance >= target_amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_corporate_pool_completion
  AFTER UPDATE ON corporate_pool_contributions
  FOR EACH ROW EXECUTE FUNCTION check_corporate_pool_completion();

-- ---------------------------------------------------------------------
-- Consumer Platform Phase B: Referrals, Addresses, Delivery Slots
-- ---------------------------------------------------------------------

-- Referral program
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    referrer_bonus DECIMAL(10,2) DEFAULT 500.00,
    referred_bonus DECIMAL(10,2) DEFAULT 500.00,
    referrer_bonus_credited BOOLEAN DEFAULT FALSE,
    referred_bonus_credited BOOLEAN DEFAULT FALSE,
    first_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    converted_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);

-- Saved addresses / address book
CREATE TABLE saved_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home',
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Nairobi',
    county VARCHAR(100),
    postal_code VARCHAR(10),
    landmark TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_addresses_user ON saved_addresses(user_id);

-- Delivery time slots
CREATE TABLE delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_name VARCHAR(100) NOT NULL,
    slot_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    start_hour INTEGER NOT NULL,
    end_hour INTEGER NOT NULL,
    extra_fee DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    max_orders_per_day INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Delivery slot orders (tracking which slots are booked)
CREATE TABLE delivery_slot_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID REFERENCES delivery_slots(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL,
    booked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(slot_id, order_id)
);

CREATE INDEX idx_slot_bookings_date ON delivery_slot_bookings(delivery_date);
CREATE INDEX idx_slot_bookings_slot ON delivery_slot_bookings(slot_id);

-- Referral credits wallet
CREATE TABLE referral_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'referral',
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_in_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referral_credits_user ON referral_credits(user_id);
CREATE INDEX idx_referral_credits_unused ON referral_credits(user_id) WHERE is_used = FALSE;

-- Seed default delivery slots
INSERT INTO delivery_slots (slot_name, slot_key, description, start_hour, end_hour, extra_fee) VALUES
    ('Same-Day Express', 'same_day_express', 'Order before 2 PM for delivery today (2-6 PM)', 14, 18, 0.00),
    ('Morning Delivery', 'morning', 'Next-day morning delivery (8 AM - 12 PM)', 8, 12, 0.00),
    ('Afternoon Delivery', 'afternoon', 'Next-day afternoon delivery (12 PM - 5 PM)', 12, 17, 0.00),
    ('Evening Delivery', 'evening', 'Next-day evening delivery (5 PM - 9 PM)', 17, 21, 100.00),
    ('Weekend Delivery', 'weekend', 'Saturday/Sunday delivery (10 AM - 4 PM)', 10, 16, 200.00)
ON CONFLICT (slot_key) DO NOTHING;

-- ---------------------------------------------------------------------
-- Consumer Platform Phase C: Subscriptions, Social Moments, Marketplace
-- ---------------------------------------------------------------------

-- AI Gift Subscriptions (SaaS)
CREATE TABLE gift_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL DEFAULT 'basic',
    status VARCHAR(20) DEFAULT 'active',
    monthly_price DECIMAL(10,2) NOT NULL,
    recipient_count INTEGER DEFAULT 1,
    max_recipients INTEGER DEFAULT 5,
    next_billing_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gift_subscriptions_user ON gift_subscriptions(user_id);

-- Subscription recipients (who the AI auto-gifts for)
CREATE TABLE subscription_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES gift_subscriptions(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20),
    relationship VARCHAR(50),
    occasion VARCHAR(50),
    occasion_month INTEGER,
    occasion_day INTEGER,
    budget_range VARCHAR(20) DEFAULT '2000-5000',
    preferences TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_gifted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_recipients_sub ON subscription_recipients(subscription_id);

-- Social delivery moments
CREATE TABLE delivery_moments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    photo_url TEXT,
    video_url TEXT,
    caption TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_moments_order ON delivery_moments(order_id);
CREATE INDEX idx_delivery_moments_public ON delivery_moments(is_public) WHERE is_public = TRUE;

-- Social moment likes
CREATE TABLE moment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moment_id UUID REFERENCES delivery_moments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(moment_id, user_id)
);

-- Corporate crossover tracking
CREATE TABLE corporate_crossover_funnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    source_page VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(200),
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crossover_user ON corporate_crossover_funnels(user_id);

-- Marketplace vendor reviews
CREATE TABLE vendor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);

-- Loyalty points ledger
CREATE TABLE loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id);

-- Gift card redemptions log
CREATE TABLE gift_card_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gift_card_redemptions_card ON gift_card_redemptions(gift_card_id);

-- Referral codes lookup (faster than listing all auth users)
CREATE TABLE referral_codes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);

-- Corporate brand configs (logo + color per user)
CREATE TABLE corporate_brand_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    logo_url TEXT,
    brand_color VARCHAR(7) DEFAULT '#9B1B5A',
    company_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_corporate_brand_configs_user ON corporate_brand_configs(user_id);

-- Hamper builds (server-side hamper records)
CREATE TABLE hamper_builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref_code VARCHAR(30) UNIQUE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    box_size VARCHAR(10) NOT NULL,
    box_price DECIMAL(10,2) NOT NULL,
    items_total DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending_payment',
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hamper_builds_ref ON hamper_builds(ref_code);

-- ---------------------------------------------------------------------
-- Product Specs — attributes like volume, ABV, age, origin (PDF-style)
-- ---------------------------------------------------------------------

CREATE TABLE product_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    spec_key VARCHAR(50) NOT NULL,
    spec_value VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    UNIQUE(product_id, spec_key)
);

CREATE INDEX idx_product_specs_product ON product_specs(product_id);

-- ---------------------------------------------------------------------
-- Hamper Bundles — pre-made gift hampers (e.g. "Whisky Lovers Hamper")
-- ---------------------------------------------------------------------

CREATE TABLE hamper_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    regular_price DECIMAL(10,2) NOT NULL,
    bundle_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    occasions TEXT[] DEFAULT '{}',
    item_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_coming_soon BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hamper_bundles_category ON hamper_bundles(category);
CREATE INDEX idx_hamper_bundles_active ON hamper_bundles(is_active, is_featured);

CREATE TABLE hamper_bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES hamper_bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hamper_bundle_items_bundle ON hamper_bundle_items(bundle_id);

-- ---------------------------------------------------------------------
-- User Profiles — editable account details (name, username, phone, email)
-- ---------------------------------------------------------------------

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE,
    full_name VARCHAR(120),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,30}$'),
    CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{7,15}$')
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_phone ON profiles(phone);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Auto-create a profile whenever a new auth user signs up,
-- seeding from their auth metadata/identity data.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, phone, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.phone,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
