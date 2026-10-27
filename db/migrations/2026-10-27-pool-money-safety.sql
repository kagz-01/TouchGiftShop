-- Migration: pool money safety — a real ledger and real refunds
-- Applies to: Pool a Gift (group_gifting_pools + pool_contributions)
--             and corporate pools (corporate_gift_pools + corporate_pool_contributions)
--
-- Three problems this fixes:
--
--   1. There is no ledger. A pool balance is recomputed by summing
--      `pool_contributions.amount` for verified rows, and a refund is a
--      console.log — so there is no record of money in vs money out, and no way
--      to tell a contribution from its reversal.
--   2. The IPN credits `contribution.amount` without ever looking at what
--      PesaPal says it received, so an underpayment (or a replayed IPN) could
--      move the balance to a figure no bank holds.
--   3. `pool_contributions.pesapal_tracking_id` is stored at checkout but
--      never used — it is exactly the confirmation code PesaPal's RefundRequest
--      needs, and close-action said "in a real system, trigger PesaPal refunds
--      here".
--
-- Idempotency is enforced in the database: `(contribution_id, entry_type)` is
-- unique, so a replayed IPN cannot post a second credit and a retried refund
-- cannot post a second debit.

BEGIN;

-- ── What we actually received, and what happened to it ──────────────────────
ALTER TABLE pool_contributions
  ADD COLUMN IF NOT EXISTS paid_amount   DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS refund_status TEXT,
  ADD COLUMN IF NOT EXISTS refund_message TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at   TIMESTAMPTZ;

COMMENT ON COLUMN pool_contributions.paid_amount IS
  'What PesaPal reported as received. Balance is credited from this, not from the requested amount.';
COMMENT ON COLUMN pool_contributions.refund_status IS
  'null | completed | failed | unsupported — mirrors orders.refund_status.';

ALTER TABLE corporate_pool_contributions
  ADD COLUMN IF NOT EXISTS refund_status TEXT,
  ADD COLUMN IF NOT EXISTS refund_message TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_pool_contrib_refund_status
  ON pool_contributions (refund_status)
  WHERE refund_status IS NOT NULL;

-- ── The ledger ──────────────────────────────────────────────────────────────
-- One row per money movement per contribution. No FKs: pool_id and
-- contribution_id may point at either the consumer or the corporate pair of
-- tables, and neither table can reference the other. pool_kind disambiguates.
CREATE TABLE IF NOT EXISTS pool_ledger_entries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id             UUID NOT NULL,
  pool_kind           TEXT NOT NULL CHECK (pool_kind IN ('consumer', 'corporate')),
  contribution_id     UUID NOT NULL,
  entry_type          TEXT NOT NULL CHECK (entry_type IN ('contribution', 'refund')),
  direction           TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  amount              DECIMAL(12,2) NOT NULL,
  psp_amount          DECIMAL(12,2),
  status              TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'failed')),
  payment_ref         TEXT,
  pesapal_tracking_id TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- The whole point: a replayed IPN or a retried refund can write once.
-- Both columns are NOT NULL, so this index is inferrable by ON CONFLICT
-- (contribution_id, entry_type) and usable by PostgREST's upsert.
CREATE UNIQUE INDEX IF NOT EXISTS pool_ledger_entry_once
  ON pool_ledger_entries (contribution_id, entry_type);

CREATE INDEX IF NOT EXISTS idx_pool_ledger_pool
  ON pool_ledger_entries (pool_id, created_at);

CREATE INDEX IF NOT EXISTS idx_pool_ledger_psp
  ON pool_ledger_entries (pesapal_tracking_id)
  WHERE pesapal_tracking_id IS NOT NULL;

-- Service role only: the ledger is money, it is read back through our own API
-- (which already scopes by pool), never by anonymous RLS on a share link.
ALTER TABLE pool_ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pool_ledger_service_role" ON pool_ledger_entries;
CREATE POLICY "pool_ledger_service_role"
  ON pool_ledger_entries FOR ALL
  USING (auth.role() = 'service_role');

-- ── Backfill: money already recorded before the ledger existed ──────────────
-- Every previously verified contribution becomes one posted credit, so the
-- balance reads the same before and after this migration. on-conlict keeps
-- the migration re-runnable.

INSERT INTO pool_ledger_entries (
  pool_id, pool_kind, contribution_id, entry_type, direction,
  amount, psp_amount, status, payment_ref, pesapal_tracking_id,
  notes, created_at
)
SELECT
  c.pool_id, 'consumer', c.id, 'contribution', 'credit',
  COALESCE(c.paid_amount, c.amount), c.paid_amount, 'posted',
  c.payment_ref, c.pesapal_tracking_id,
  'backfilled from a previously verified contribution', c.created_at
FROM pool_contributions c
WHERE c.is_verified = TRUE
ON CONFLICT (contribution_id, entry_type) DO NOTHING;

INSERT INTO pool_ledger_entries (
  pool_id, pool_kind, contribution_id, entry_type, direction,
  amount, psp_amount, status, payment_ref, notes, created_at
)
SELECT
  c.pool_id, 'corporate', c.id, 'contribution', 'credit',
  COALESCE(c.amount, 0), NULL, 'posted',
  c.payment_ref, 'backfilled from a previously verified contribution', c.created_at
FROM corporate_pool_contributions c
WHERE c.is_verified = TRUE
ON CONFLICT (contribution_id, entry_type) DO NOTHING;

-- A contribution refunded through close-action before this migration still has
-- no PesaPal record of it — do not backfill refunds we cannot substantiate.
-- Those stay visible on the contribution row via refund_status, set manually.

COMMIT;
