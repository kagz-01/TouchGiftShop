-- ============================================================================
-- DIGITAL GIFT POOLS (GROUP GIFTING)
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_gifting_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  organiser_user_id UUID NOT NULL, -- The organiser (auth.users)
  creator_id UUID NOT NULL,
  
  recipient_name TEXT NOT NULL,
  recipient_photo_url TEXT,
  occasion TEXT,
  
  title TEXT NOT NULL,
  description TEXT,
  
  gift_product_id UUID, -- nullable FK to products
  gift_name TEXT,
  gift_price NUMERIC,
  gift_image_url TEXT,
  
  target_amount NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  min_contribution NUMERIC NOT NULL DEFAULT 50,
  
  over_target_behaviour TEXT NOT NULL DEFAULT 'wallet_credit',
  under_target_action TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  
  privacy_mode TEXT NOT NULL DEFAULT 'named',
  surprise_mode BOOLEAN NOT NULL DEFAULT true,
  ghost_mode_allowed BOOLEAN NOT NULL DEFAULT true,
  
  is_poll_mode BOOLEAN NOT NULL DEFAULT false,
  poll_options JSONB,
  
  status TEXT NOT NULL DEFAULT 'active', -- active, closed, cancelled, fulfilled
  
  milestone_25_sent BOOLEAN NOT NULL DEFAULT false,
  milestone_50_sent BOOLEAN NOT NULL DEFAULT false,
  milestone_75_sent BOOLEAN NOT NULL DEFAULT false,
  milestone_100_sent BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pool_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES group_gifting_pools(id) ON DELETE CASCADE,
  
  contributor_user_id UUID, -- optional, if they are logged in
  contributor_name TEXT,
  contributor_phone TEXT NOT NULL,
  
  amount NUMERIC NOT NULL,
  message TEXT,
  
  payment_method TEXT NOT NULL,
  payment_ref TEXT NOT NULL,
  pesapal_tracking_id TEXT,
  
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_ghost_mode BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  
  poll_vote_index INTEGER,
  
  split_parent_id UUID REFERENCES pool_contributions(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
