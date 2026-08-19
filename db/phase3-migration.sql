-- Phase 3 Migration (Intelligence Layer)

-- 1. Split with Friend
-- We already added `split_parent_id` in the previous migration.

-- 2. Wallet & Trust Score
CREATE TABLE IF NOT EXISTS user_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  trust_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Poll Options / Voting
ALTER TABLE group_gifting_pools
  ADD COLUMN IF NOT EXISTS poll_options JSONB, -- Array of { id, name, price, image }
  ADD COLUMN IF NOT EXISTS is_poll_mode BOOLEAN DEFAULT FALSE;

ALTER TABLE pool_contributions
  ADD COLUMN IF NOT EXISTS poll_vote_id VARCHAR(50); -- References an ID inside poll_options

