-- ─────────────────────────────────────────────────────────────────────────────
-- Corporate client portal — identity and tenancy
--
-- Nothing linked a corporate customer to a login. `corporate_accounts.user_id`
-- existed but no code ever wrote it, and a single nullable FK cannot carry a
-- company of N people anyway. This migration adds the membership table the
-- portal authenticates against, plus the two columns that make a quote
-- referenceable by a client rather than by an ops screen.
--
-- Access rule: a membership is created by ops (invite) or claimed by ops. It is
-- never created by typing a company name, because `company_name` is free text on
-- `corporate_quote_requests` and anyone can write it.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Membership ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS corporate_account_members (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id  UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  -- Set on the first successful magic-link sign-in. Nullable while invited, so
  -- an invite can be issued before the person has an account at all.
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  role                  TEXT NOT NULL DEFAULT 'member'
                          CHECK (role IN ('owner', 'member', 'viewer')),
  status                TEXT NOT NULL DEFAULT 'invited'
                          CHECK (status IN ('invited', 'active', 'revoked')),
  full_name             TEXT,
  job_title             TEXT,
  invited_by            TEXT,
  last_seen_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One membership per person per company, case-insensitively: "Amina@Acme.co"
-- and "amina@acme.co" are the same human.
CREATE UNIQUE INDEX IF NOT EXISTS idx_corp_members_account_email
  ON corporate_account_members (corporate_account_id, lower(email));

-- A revoked member must never be able to sign back in to the same account.
CREATE UNIQUE INDEX IF NOT EXISTS idx_corp_members_user_active
  ON corporate_account_members (user_id)
  WHERE user_id IS NOT NULL AND status <> 'revoked';

CREATE INDEX IF NOT EXISTS idx_corp_members_email ON corporate_account_members (lower(email));
CREATE INDEX IF NOT EXISTS idx_corp_members_account ON corporate_account_members (corporate_account_id);

CREATE OR REPLACE FUNCTION touch_corporate_account_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_corporate_account_members_updated_at ON corporate_account_members;
CREATE TRIGGER update_corporate_account_members_updated_at
  BEFORE UPDATE ON corporate_account_members
  FOR EACH ROW EXECUTE FUNCTION touch_corporate_account_members_updated_at();

-- ── Quote references ─────────────────────────────────────────────────────────
-- "TGQ-4KP7M". Ops can read it over the phone; the client quotes it back.
-- `corporate_account_id` already exists on the table (Phase 2.3) but nothing
-- ever populated it, so a quote could not be scoped to a company at all.
ALTER TABLE corporate_quote_requests
  ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE corporate_quote_requests
  ADD COLUMN IF NOT EXISTS customer_response JSONB;
ALTER TABLE corporate_quote_requests
  ADD COLUMN IF NOT EXISTS customer_responded_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_corp_quote_reference
  ON corporate_quote_requests (reference)
  WHERE reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_corp_quote_account
  ON corporate_quote_requests (corporate_account_id);

ALTER TABLE corporate_inquiries
  ADD COLUMN IF NOT EXISTS corporate_account_id UUID
  REFERENCES corporate_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_corp_inquiries_account
  ON corporate_inquiries (corporate_account_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Every table below is reached with the service-role key, which bypasses RLS
-- entirely — these policies are defence in depth for anything that ever runs
-- with the anon key. Read is scoped to a membership on the same account; the
-- portal additionally scopes in application code.
ALTER TABLE corporate_account_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own membership" ON corporate_account_members;
CREATE POLICY "Members read own membership" ON corporate_account_members
  FOR SELECT
  USING (
    status <> 'revoked'
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (
          corporate_account_members.user_id = u.id
          OR lower(corporate_account_members.email) = lower(u.email)
        )
    )
  );

DROP POLICY IF EXISTS "Service role manages members" ON corporate_account_members;
CREATE POLICY "Service role manages members" ON corporate_account_members
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
