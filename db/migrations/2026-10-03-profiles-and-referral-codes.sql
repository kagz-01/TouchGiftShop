-- Migration: profiles table, signup trigger, referral_codes
-- Run this on production DB (Postgres)
--
-- The account page is entirely non-functional without this. /api/profile
-- selects from `profiles`, swallows the resulting error, then upserts — which
-- throws and returns 500. Every signed-in user sees a broken account page.
--
-- The route also comments that an `on_auth_user_created` trigger creates the
-- row for new signups; no such trigger existed. Add it, so a profile is
-- present the moment someone signs in rather than only after a lazy first GET.

BEGIN;

-- ── profiles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON profiles (lower(username)) WHERE username IS NOT NULL;

-- ── referral_codes ─────────────────────────────────────────────────────────
-- /api/referrals reads and writes this table; it was never created, so the
-- referral flow errored on every visit to a /ref/<code> link.
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  referrer_user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes (code);

-- ── create the profile on signup ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, phone, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- ── backfill existing users ────────────────────────────────────────────────
-- Run after the COMMIT above:
--
--   INSERT INTO public.profiles (id, username, full_name, phone, email, avatar_url)
--   SELECT u.id,
--          u.raw_user_meta_data ->> 'username',
--          COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
--          u.phone,
--          u.email,
--          COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
--   FROM auth.users u
--   ON CONFLICT (id) DO NOTHING;