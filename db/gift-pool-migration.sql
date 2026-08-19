-- Gift Pool v2 Migration
-- Run this in Supabase SQL Editor

-- 1. Extend pool status enum
ALTER TYPE pool_status_enum ADD VALUE IF NOT EXISTS 'fulfilled';
ALTER TYPE pool_status_enum ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE pool_status_enum ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE pool_status_enum ADD VALUE IF NOT EXISTS 'expired';

-- 2. Extend group_gifting_pools with full feature set
ALTER TABLE group_gifting_pools
  -- Recipient info
  ADD COLUMN IF NOT EXISTS recipient_name       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS recipient_photo_url  TEXT,
  ADD COLUMN IF NOT EXISTS occasion             VARCHAR(50),
  ADD COLUMN IF NOT EXISTS description          TEXT,

  -- Gift info (pinned gift from catalogue)
  ADD COLUMN IF NOT EXISTS gift_product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gift_name            VARCHAR(200),
  ADD COLUMN IF NOT EXISTS gift_price           DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS gift_image_url       TEXT,

  -- Pool settings
  ADD COLUMN IF NOT EXISTS min_contribution     DECIMAL(10,2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS over_target_behaviour VARCHAR(20) DEFAULT 'wallet_credit', -- 'wallet_credit' | 'gift_upgrade'
  ADD COLUMN IF NOT EXISTS under_target_action  VARCHAR(20), -- 'refund' | 'extend' | 'downgrade' — set at close time

  -- Privacy
  ADD COLUMN IF NOT EXISTS privacy_mode         VARCHAR(10) DEFAULT 'named', -- 'named' | 'anonymous'
  ADD COLUMN IF NOT EXISTS surprise_mode        BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ghost_mode_allowed   BOOLEAN DEFAULT TRUE,

  -- Organiser media
  ADD COLUMN IF NOT EXISTS voice_message_url    TEXT,
  ADD COLUMN IF NOT EXISTS video_message_url    TEXT,

  -- Tracking
  ADD COLUMN IF NOT EXISTS organiser_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_placed_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS milestone_25_sent    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS milestone_50_sent    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS milestone_75_sent    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS milestone_100_sent   BOOLEAN DEFAULT FALSE;

-- 3. Extend pool_contributions with full feature set
ALTER TABLE pool_contributions
  ADD COLUMN IF NOT EXISTS message              TEXT,
  ADD COLUMN IF NOT EXISTS payment_method       VARCHAR(20) DEFAULT 'pesapal', -- 'mpesa' | 'card' | 'airtel' | 'pesapal'
  ADD COLUMN IF NOT EXISTS payment_ref          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_anonymous         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_ghost             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS split_parent_id      UUID REFERENCES pool_contributions(id) ON DELETE SET NULL;

-- 4. Enable Realtime on pool tables (for live contribution feed)
ALTER PUBLICATION supabase_realtime ADD TABLE group_gifting_pools;
ALTER PUBLICATION supabase_realtime ADD TABLE pool_contributions;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_pools_organiser ON group_gifting_pools(organiser_user_id);
CREATE INDEX IF NOT EXISTS idx_pools_status ON group_gifting_pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_expires ON group_gifting_pools(expires_at);
CREATE INDEX IF NOT EXISTS idx_contributions_pool ON pool_contributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_contributions_created ON pool_contributions(created_at DESC);
