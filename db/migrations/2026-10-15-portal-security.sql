-- ─────────────────────────────────────────────────────────────────────────────
-- Portal security: RLS backstop and an audit trail
--
-- Everything under /corporate/portal reads through the service-role key, which
-- bypasses RLS entirely — the scoping is done in application code. That is fine
-- as long as the application is right, every time, which is a lot to ask of a
-- codebase this size. These policies are the backstop: if a route is ever
-- changed to use the anon key, a mistake returns no rows instead of another
-- company's rows.
--
-- The audit table is the other half. Customer emails, phone numbers and free
-- text are readable in the portal; the rule is that someone looking should be
-- able to show that they looked.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper ───────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so a policy on one corporate table can ask "which accounts
-- is this user a member of?" without recursing through that table's own RLS.
CREATE OR REPLACE FUNCTION corporate_account_ids_for_user()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT m.corporate_account_id
  FROM corporate_account_members m
  JOIN auth.users u ON u.id = auth.uid()
  WHERE m.status <> 'revoked'
    AND (m.user_id = u.id OR lower(m.email) = lower(u.email));
$$;

REVOKE ALL ON FUNCTION corporate_account_ids_for_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION corporate_account_ids_for_user() TO authenticated;

-- ── corporate_orders ─────────────────────────────────────────────────────────
ALTER TABLE corporate_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages corporate orders" ON corporate_orders;
CREATE POLICY "Service role manages corporate orders" ON corporate_orders
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own corporate orders" ON corporate_orders;
CREATE POLICY "Members read own corporate orders" ON corporate_orders
  FOR SELECT TO authenticated
  USING (corporate_account_id IN (SELECT corporate_account_ids_for_user()));

-- ── corporate_order_recipients ───────────────────────────────────────────────
ALTER TABLE corporate_order_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages corporate order recipients" ON corporate_order_recipients;
CREATE POLICY "Service role manages corporate order recipients" ON corporate_order_recipients
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own corporate order recipients" ON corporate_order_recipients;
CREATE POLICY "Members read own corporate order recipients" ON corporate_order_recipients
  FOR SELECT TO authenticated
  USING (
    corporate_order_id IN (
      SELECT co.id FROM corporate_orders co
      WHERE co.corporate_account_id IN (SELECT corporate_account_ids_for_user())
    )
  );

-- ── corporate_accounts ────────────────────────────────────────────────────────
-- Finance-sensitive: a viewer must not read credit limits through a policy.
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages corporate accounts" ON corporate_accounts;
CREATE POLICY "Service role manages corporate accounts" ON corporate_accounts
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Owners read own account" ON corporate_accounts;
CREATE POLICY "Owners read own account" ON corporate_accounts
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT corporate_account_ids_for_user())
    AND EXISTS (
      SELECT 1 FROM corporate_account_members m
      JOIN auth.users u ON u.id = auth.uid()
      WHERE m.corporate_account_id = corporate_accounts.id
        AND m.status <> 'revoked'
        AND m.role = 'owner'
        AND (m.user_id = u.id OR lower(m.email) = lower(u.email))
    )
  );

-- ── client_profiles ──────────────────────────────────────────────────────────
-- The CRM carries internal scoring (notes, relationship_strength). Those are
-- our read on a person, not the company's, so the policy is row-scoped only —
-- column hiding is enforced by the allowlist in the portal's select.
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages client profiles" ON client_profiles;
CREATE POLICY "Service role manages client profiles" ON client_profiles
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own client profiles" ON client_profiles;
CREATE POLICY "Members read own client profiles" ON client_profiles
  FOR SELECT TO authenticated
  USING (corporate_account_id IN (SELECT corporate_account_ids_for_user()));

-- ── corporate_gift_pools ─────────────────────────────────────────────────────
-- Pools are public by design — that is the point of a share link — but the
-- *account* link is not, and it is what ties a pool to a company.
ALTER TABLE corporate_gift_pools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages corporate pools" ON corporate_gift_pools;
CREATE POLICY "Service role manages corporate pools" ON corporate_gift_pools
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own pools" ON corporate_gift_pools;
CREATE POLICY "Members read own pools" ON corporate_gift_pools
  FOR SELECT TO authenticated
  USING (corporate_account_id IN (SELECT corporate_account_ids_for_user()));

-- ── corporate_pool_contributions ─────────────────────────────────────────────
ALTER TABLE corporate_pool_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages pool contributions" ON corporate_pool_contributions;
CREATE POLICY "Service role manages pool contributions" ON corporate_pool_contributions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own pool contributions" ON corporate_pool_contributions;
CREATE POLICY "Members read own pool contributions" ON corporate_pool_contributions
  FOR SELECT TO authenticated
  USING (
    pool_id IN (
      SELECT p.id FROM corporate_gift_pools p
      WHERE p.corporate_account_id IN (SELECT corporate_account_ids_for_user())
    )
  );

-- ── Audit ────────────────────────────────────────────────────────────────────
-- No customer content is stored here. Who looked, at what, from where, and when.
CREATE TABLE IF NOT EXISTS corporate_portal_audit (
  id BIGSERIAL PRIMARY KEY,
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  actor_user_id UUID,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_ref TEXT,
  outcome TEXT NOT NULL DEFAULT 'ok',
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_audit_account ON corporate_portal_audit (corporate_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portal_audit_actor ON corporate_portal_audit (actor_email, created_at DESC);

ALTER TABLE corporate_portal_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role writes portal audit" ON corporate_portal_audit;
CREATE POLICY "Service role writes portal audit" ON corporate_portal_audit
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

/* Nobody reads the audit log through the client. It is for us, not for a
   curious client with an admin token. */
DROP POLICY IF EXISTS "No client read of portal audit" ON corporate_portal_audit;
CREATE POLICY "No client read of portal audit" ON corporate_portal_audit
  FOR SELECT TO anon, authenticated USING (false);