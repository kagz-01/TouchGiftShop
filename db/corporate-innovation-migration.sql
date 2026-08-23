-- Corporate Innovation Migration — Phases 1-10
-- Run this in Supabase SQL Editor after all previous migrations
-- TouchGiftShop Production Schema Extension

-- ═══════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════
-- PHASE 1: Corporate Hamper Builder + Brand Studio + Templates
-- ═══════════════════════════════════════════════════════════

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
  default_payment_terms VARCHAR(50) DEFAULT 'pay_now', -- 'pay_now' | 'net_15' | 'net_30'
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
  category VARCHAR(50) NOT NULL, -- 'onboarding', 'client', 'event', 'holiday', 'milestone', 'premium'
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  item_count INTEGER DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{name, price, category, product_id}]
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
  gift_wrap VARCHAR(20) DEFAULT 'standard', -- 'standard' | 'premium' | 'branded'
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  hamper_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{product_id, name, price, quantity}]
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
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- link to individual order
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Budget rules for auto-fill
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

-- ═══════════════════════════════════════════════════════════
-- PHASE 2: Team Gift Pool (Corporate Kuchanga)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE corporate_gift_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  creator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status pool_status_enum DEFAULT 'active',

  -- Recipient
  recipient_name VARCHAR(100) NOT NULL,
  recipient_role VARCHAR(100),
  recipient_department VARCHAR(100),
  occasion VARCHAR(50) NOT NULL,

  -- Pool config
  target_amount DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) DEFAULT 0.00,
  min_contribution DECIMAL(10,2) DEFAULT 200.00,
  deadline TIMESTAMPTZ NOT NULL,

  -- Company matching
  company_match_enabled BOOLEAN DEFAULT FALSE,
  company_match_ratio DECIMAL(5,2) DEFAULT 1.00, -- 1:1 = 1.00, 1:0.5 = 0.50
  company_match_cap DECIMAL(10,2) DEFAULT 5000.00,
  company_match_used DECIMAL(10,2) DEFAULT 0.00,

  -- Privacy & experience
  show_leaderboard BOOLEAN DEFAULT TRUE,
  auto_reminders BOOLEAN DEFAULT TRUE,
  anonymous_contributions BOOLEAN DEFAULT FALSE,

  -- Tracking
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

-- ═══════════════════════════════════════════════════════════
-- PHASE 3: Corporate Gifting Calendar
-- ═══════════════════════════════════════════════════════════

CREATE TYPE calendar_event_status AS ENUM (
  'scheduled', 'pool_active', 'ordered', 'sent', 'delivered', 'cancelled'
);

CREATE TABLE corporate_calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type milestone_trigger_type NOT NULL,

  -- Recipient (can be employee or external)
  recipient_name VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(200),
  recipient_phone VARCHAR(20),
  department VARCHAR(100),
  role VARCHAR(100),

  -- Gift config
  gift_budget DECIMAL(10,2),
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  custom_message TEXT,

  -- Automation
  auto_order BOOLEAN DEFAULT FALSE,
  auto_pool BOOLEAN DEFAULT FALSE, -- auto-create gift pool
  pool_id UUID REFERENCES corporate_gift_pools(id) ON DELETE SET NULL,
  reminder_days_before INTEGER DEFAULT 7,

  -- Status
  status calendar_event_status DEFAULT 'scheduled',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- PHASE 4: WhatsApp Bot
-- ═══════════════════════════════════════════════════════════

CREATE TABLE whatsapp_bot_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'pool_invite', 'pool_reminder', 'birthday', 'anniversary', 'delivery', 'custom'
  trigger_config JSONB DEFAULT '{}'::jsonb, -- {days_before: 3, occasion: "birthday"}
  message_template TEXT NOT NULL, -- supports {variable} interpolation
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
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  external_message_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- PHASE 5: White-Label Portal
-- ═══════════════════════════════════════════════════════════

CREATE TABLE whitelabel_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name VARCHAR(200) NOT NULL,
  plan whitelabel_plan DEFAULT 'starter',
  commission_rate DECIMAL(5,2) DEFAULT 8.00, -- percentage

  -- Branding
  brand_name VARCHAR(200),
  brand_color VARCHAR(7) DEFAULT '#9B1B5A',
  logo_url TEXT,
  custom_domain VARCHAR(200),

  -- Limits
  monthly_order_limit INTEGER DEFAULT 50,
  monthly_orders_used INTEGER DEFAULT 0,

  -- Revenue
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  total_commission_earned DECIMAL(12,2) DEFAULT 0.00,
  pending_payout DECIMAL(12,2) DEFAULT 0.00,

  -- Status
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
  theme_config JSONB DEFAULT '{}'::jsonb, -- {primaryColor, logo, bannerImage, etc.}
  product_ids UUID[] DEFAULT '{}', -- products visible in this storefront
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- PHASE 6: Client Appreciation Network
-- ═══════════════════════════════════════════════════════════

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

  -- Relationship tracking
  relationship_strength INTEGER DEFAULT 50 CHECK (relationship_strength >= 0 AND relationship_strength <= 100),
  total_gifts_sent INTEGER DEFAULT 0,
  total_amount_spent DECIMAL(12,2) DEFAULT 0.00,
  last_gift_date DATE,

  -- Occasions
  birthday DATE,
  work_anniversary DATE,
  next_occasion VARCHAR(50),
  next_occasion_date DATE,

  -- Notes
  notes TEXT,
  preferences JSONB DEFAULT '{}'::jsonb, -- {preferred_categories, dietary, etc.}

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
  status VARCHAR(20) DEFAULT 'sent', -- 'scheduled' | 'sent' | 'delivered'
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
  recurrence_pattern VARCHAR(20) DEFAULT 'yearly', -- 'yearly' | 'quarterly' | 'monthly'
  gift_budget DECIMAL(10,2),
  auto_gift BOOLEAN DEFAULT FALSE,
  template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  last_triggered_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- PHASE 7: Corporate Impact Dashboard (materialized views)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE corporate_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Gift metrics
  total_gifts_sent INTEGER DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0.00,
  avg_gift_value DECIMAL(10,2) DEFAULT 0.00,

  -- Pool metrics
  pools_created INTEGER DEFAULT 0,
  pool_participation_rate DECIMAL(5,2) DEFAULT 0.00,
  total_pool_contributions INTEGER DEFAULT 0,

  -- Client metrics
  clients_served INTEGER DEFAULT 0,
  client_retention_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_relationship_strength DECIMAL(5,2) DEFAULT 0.00,

  -- Employee metrics
  employee_satisfaction_score DECIMAL(5,2) DEFAULT 0.00,
  milestone_gifts_sent INTEGER DEFAULT 0,

  -- WhatsApp metrics
  whatsapp_messages_sent INTEGER DEFAULT 0,
  whatsapp_response_rate DECIMAL(5,2) DEFAULT 0.00,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- PHASE 8: Virtual Showroom
-- ═══════════════════════════════════════════════════════════

CREATE TABLE showroom_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  product_ids UUID[] DEFAULT '{}',
  layout JSONB DEFAULT '{}'::jsonb, -- {columns, sortBy, filterDefaults}
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

-- ═══════════════════════════════════════════════════════════
-- PHASE 9: Automated Milestone Gifting
-- ═══════════════════════════════════════════════════════════

CREATE TABLE milestone_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_type milestone_trigger_type NOT NULL,

  -- Gift config
  gift_budget DECIMAL(10,2) NOT NULL,
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_template_id UUID REFERENCES hamper_templates(id) ON DELETE SET NULL,
  custom_message_template TEXT,

  -- Automation
  auto_order BOOLEAN DEFAULT FALSE,
  auto_pool BOOLEAN DEFAULT FALSE,
  notify_hr BOOLEAN DEFAULT TRUE,
  send_whatsapp BOOLEAN DEFAULT TRUE,

  -- Timing
  trigger_days_before INTEGER DEFAULT 0, -- 0 = on the day, 3 = 3 days before
  trigger_time TIME DEFAULT '09:00:00',

  -- Escalation (for work anniversaries)
  escalation_enabled BOOLEAN DEFAULT FALSE,
  escalation_tiers JSONB DEFAULT '[]'::jsonb, -- [{years: 1, budget: 2000}, {years: 5, budget: 5000}]

  -- Stats
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

  -- What was sent
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_amount DECIMAL(10,2),
  pool_id UUID REFERENCES corporate_gift_pools(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'triggered', -- 'triggered' | 'pool_created' | 'ordered' | 'sent' | 'delivered'
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  hr_notified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- PHASE 10: B2B2C Marketplace
-- ═══════════════════════════════════════════════════════════

CREATE TABLE marketplace_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  specialty VARCHAR(100),
  logo_url TEXT,
  banner_url TEXT,

  -- Verification
  status vendor_status DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  business_registration_number VARCHAR(50),
  tax_certificate_url TEXT,

  -- Ratings
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,

  -- Delivery
  delivery_time VARCHAR(50), -- 'same_day', '1-2 days', '3-5 days'
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  free_delivery_threshold DECIMAL(10,2),

  -- Financials
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

  -- Vendor settings
  is_active BOOLEAN DEFAULT TRUE,
  free_delivery BOOLEAN DEFAULT FALSE,
  handling_time VARCHAR(50) DEFAULT '1-2 days',

  -- Stats
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
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'processing' | 'paid' | 'failed'
  payment_method VARCHAR(20) DEFAULT 'mpesa',
  payment_ref VARCHAR(100),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES (all tables)
-- ═══════════════════════════════════════════════════════════

-- Corporate accounts
CREATE INDEX idx_corporate_accounts_user ON corporate_accounts(user_id);
CREATE INDEX idx_corporate_accounts_company ON corporate_accounts(company_name);

-- Brand profiles
CREATE INDEX idx_brand_profiles_account ON brand_profiles(corporate_account_id);

-- Hamper templates
CREATE INDEX idx_hamper_templates_category ON hamper_templates(category);
CREATE INDEX idx_hamper_templates_active ON hamper_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_hamper_template_items_template ON hamper_template_items(template_id);

-- Corporate orders
CREATE INDEX idx_corporate_orders_account ON corporate_orders(corporate_account_id);
CREATE INDEX idx_corporate_orders_user ON corporate_orders(user_id);
CREATE INDEX idx_corporate_orders_status ON corporate_orders(status);
CREATE INDEX idx_corporate_orders_created ON corporate_orders(created_at DESC);
CREATE INDEX idx_corporate_order_recipients_order ON corporate_order_recipients(corporate_order_id);

-- Budget rules
CREATE INDEX idx_budget_rules_account ON budget_rules(corporate_account_id);

-- Corporate gift pools
CREATE INDEX idx_corp_pools_account ON corporate_gift_pools(corporate_account_id);
CREATE INDEX idx_corp_pools_creator ON corporate_gift_pools(creator_user_id);
CREATE INDEX idx_corp_pools_slug ON corporate_gift_pools(slug);
CREATE INDEX idx_corp_pools_status ON corporate_gift_pools(status);
CREATE INDEX idx_corp_pools_deadline ON corporate_gift_pools(deadline);
CREATE INDEX idx_corp_pool_contributions_pool ON corporate_pool_contributions(pool_id);
CREATE INDEX idx_corp_pool_contributions_created ON corporate_pool_contributions(created_at DESC);

-- Calendar events
CREATE INDEX idx_calendar_events_account ON corporate_calendar_events(corporate_account_id);
CREATE INDEX idx_calendar_events_date ON corporate_calendar_events(event_date);
CREATE INDEX idx_calendar_events_type ON corporate_calendar_events(event_type);
CREATE INDEX idx_calendar_events_status ON corporate_calendar_events(status);

-- WhatsApp
CREATE INDEX idx_whatsapp_flows_account ON whatsapp_bot_flows(corporate_account_id);
CREATE INDEX idx_whatsapp_messages_account ON whatsapp_messages(corporate_account_id);
CREATE INDEX idx_whatsapp_messages_flow ON whatsapp_messages(flow_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_sent ON whatsapp_messages(sent_at DESC);

-- White-label
CREATE INDEX idx_whitelabel_user ON whitelabel_accounts(user_id);
CREATE INDEX idx_whitelabel_domain ON whitelabel_accounts(custom_domain);
CREATE INDEX idx_whitelabel_storefronts_account ON whitelabel_storefronts(whitelabel_account_id);
CREATE INDEX idx_whitelabel_storefronts_slug ON whitelabel_storefronts(slug);

-- Client profiles
CREATE INDEX idx_client_profiles_account ON client_profiles(corporate_account_id);
CREATE INDEX idx_client_profiles_tier ON client_profiles(tier);
CREATE INDEX idx_client_profiles_next_occasion ON client_profiles(next_occasion_date);
CREATE INDEX idx_client_gift_history_client ON client_gift_history(client_id);
CREATE INDEX idx_client_occasions_client ON client_occasions(client_id);

-- Analytics
CREATE INDEX idx_corporate_analytics_account ON corporate_analytics(corporate_account_id);
CREATE INDEX idx_corporate_analytics_period ON corporate_analytics(period_start, period_end);

-- Showroom
CREATE INDEX idx_showroom_config_account ON showroom_configurations(corporate_account_id);
CREATE INDEX idx_showroom_views_config ON showroom_views(configuration_id);
CREATE INDEX idx_showroom_views_product ON showroom_views(product_id);

-- Milestones
CREATE INDEX idx_milestone_rules_account ON milestone_rules(corporate_account_id);
CREATE INDEX idx_milestone_rules_trigger ON milestone_rules(trigger_type);
CREATE INDEX idx_milestone_trigger_log_rule ON milestone_trigger_log(rule_id);
CREATE INDEX idx_milestone_trigger_log_account ON milestone_trigger_log(corporate_account_id);
CREATE INDEX idx_milestone_trigger_log_date ON milestone_trigger_log(trigger_date);

-- Marketplace
CREATE INDEX idx_marketplace_vendors_user ON marketplace_vendors(user_id);
CREATE INDEX idx_marketplace_vendors_status ON marketplace_vendors(status);
CREATE INDEX idx_marketplace_vendors_rating ON marketplace_vendors(avg_rating DESC);
CREATE INDEX idx_marketplace_products_vendor ON marketplace_products(vendor_id);
CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX idx_marketplace_products_active ON marketplace_products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vendor_payouts_vendor ON vendor_payouts(vendor_id);
CREATE INDEX idx_vendor_payouts_status ON vendor_payouts(status);

-- ═══════════════════════════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE corporate_gift_pools;
ALTER PUBLICATION supabase_realtime ADD TABLE corporate_pool_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE corporate_calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE milestone_trigger_log;

-- ═══════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════

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

-- Recalculate corporate pool balance (idempotent)
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
