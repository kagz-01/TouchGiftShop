-- ================================================================
-- Migration: Fix group_gifting_pools RLS + add missing columns
-- Run this in your Supabase SQL editor
-- ================================================================

-- 1. Add missing columns (if they don't exist yet)
ALTER TABLE group_gifting_pools
  ADD COLUMN IF NOT EXISTS is_poll_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS poll_options JSONB DEFAULT NULL;

-- 2. Enable Row Level Security
ALTER TABLE group_gifting_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_contributions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "pools_select_public"        ON group_gifting_pools;
DROP POLICY IF EXISTS "pools_insert_authenticated" ON group_gifting_pools;
DROP POLICY IF EXISTS "pools_update_own"           ON group_gifting_pools;
DROP POLICY IF EXISTS "pools_delete_own"           ON group_gifting_pools;
DROP POLICY IF EXISTS "pools_service_role"         ON group_gifting_pools;

DROP POLICY IF EXISTS "contributions_select_public"  ON pool_contributions;
DROP POLICY IF EXISTS "contributions_insert_public"  ON pool_contributions;
DROP POLICY IF EXISTS "contributions_service_role"   ON pool_contributions;

-- 4. group_gifting_pools policies
-- Anyone can READ any pool (share links work for non-logged-in users)
CREATE POLICY "pools_select_public"
  ON group_gifting_pools FOR SELECT
  USING (true);

-- Authenticated users can CREATE a pool
CREATE POLICY "pools_insert_authenticated"
  ON group_gifting_pools FOR INSERT
  WITH CHECK (auth.uid() = organiser_user_id);

-- Organiser can UPDATE their own pool
CREATE POLICY "pools_update_own"
  ON group_gifting_pools FOR UPDATE
  USING (auth.uid() = organiser_user_id);

-- Organiser can DELETE their own pool
CREATE POLICY "pools_delete_own"
  ON group_gifting_pools FOR DELETE
  USING (auth.uid() = organiser_user_id);

-- Service role bypass (needed for IPN / payment webhooks)
CREATE POLICY "pools_service_role"
  ON group_gifting_pools FOR ALL
  USING (auth.role() = 'service_role');

-- 5. pool_contributions policies
-- Anyone can read contributions (for public pool pages)
CREATE POLICY "contributions_select_public"
  ON pool_contributions FOR SELECT
  USING (true);

-- Anyone can INSERT a contribution (payer may not be logged in)
CREATE POLICY "contributions_insert_public"
  ON pool_contributions FOR INSERT
  WITH CHECK (true);

-- Service role can do everything (for IPN webhook updates)
CREATE POLICY "contributions_service_role"
  ON pool_contributions FOR ALL
  USING (auth.role() = 'service_role');
