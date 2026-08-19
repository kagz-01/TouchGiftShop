-- Phase 3 Migration (Intelligence Layer)

-- 1. Wallet & Trust Score
CREATE TABLE IF NOT EXISTS user_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  trust_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transaction History
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id UUID REFERENCES group_gifting_pools(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Poll Options / Voting
-- Using JSONB in group_gifting_pools is more efficient than a separate table for a simple MVP
ALTER TABLE group_gifting_pools
  ADD COLUMN IF NOT EXISTS poll_options JSONB, -- Array of { id: string, name: string, price: number, image: string }
  ADD COLUMN IF NOT EXISTS is_poll_mode BOOLEAN DEFAULT FALSE;

ALTER TABLE pool_contributions
  ADD COLUMN IF NOT EXISTS poll_vote_id VARCHAR(50); -- References an ID inside poll_options

-- 3. Enable realtime for wallet_transactions if needed
ALTER PUBLICATION supabase_realtime ADD TABLE user_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;
