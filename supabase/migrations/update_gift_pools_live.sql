DO $$ 
BEGIN
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS is_poll_mode BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS poll_options JSONB;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS milestone_25_sent BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS milestone_50_sent BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS milestone_75_sent BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS milestone_100_sent BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS ghost_mode_allowed BOOLEAN NOT NULL DEFAULT true;
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS over_target_behaviour TEXT NOT NULL DEFAULT 'wallet_credit';
  ALTER TABLE group_gifting_pools ADD COLUMN IF NOT EXISTS under_target_action TEXT;
  
  ALTER TABLE pool_contributions ADD COLUMN IF NOT EXISTS poll_vote_index INTEGER;
  ALTER TABLE pool_contributions ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT;
  ALTER TABLE pool_contributions ADD COLUMN IF NOT EXISTS is_ghost_mode BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE pool_contributions ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE pool_contributions ADD COLUMN IF NOT EXISTS split_parent_id UUID REFERENCES pool_contributions(id) ON DELETE SET NULL;
END $$;
