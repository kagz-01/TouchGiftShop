-- Migration: align profiles and referral_codes with db/schema.sql
-- Run this on production DB (Postgres)
--
-- The previous migration built these tables from a guess rather than from the
-- schema file. db/schema.sql already described both, and the running code
-- expects the schema.sql shape:
--
--   * referral_codes was created with `referrer_user_id`, but every query in
--     app/api/referrals uses `user_id`, so the referral flow errored on
--     "column user_id does not exist".
--   * profiles was missing the length limits, the username and phone CHECK
--     constraints, the indexes, the updated_at trigger and RLS, all of which
--     schema.sql specifies.

BEGIN;

-- ── referral_codes: match the app and schema.sql ───────────────────────────
-- Recreated rather than altered: it is empty, and renaming a primary key that
-- three call sites depend on is riskier than replacing the table.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'referral_codes'
       AND column_name = 'user_id'
  ) THEN
    RAISE NOTICE 'referral_codes already matches schema.sql; leaving as is';
  ELSE
    DROP TABLE IF EXISTS public.referral_codes CASCADE;
    CREATE TABLE public.referral_codes (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        code VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    RAISE NOTICE 'recreated referral_codes with user_id primary key';
  END IF;
END $$;

-- ── profiles: constraints, indexes, RLS ─────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'username_format' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT username_format
      CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,30}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'phone_format' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT phone_format
      CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{7,15}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone    ON public.profiles (phone);

-- Keep updated_at honest.
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Own-row only. Every read/write goes through app/api/profile using the service
-- role, which bypasses RLS, so this does not change behaviour — it just stops
-- the table being world-readable to anon/authenticated keys.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

COMMIT;