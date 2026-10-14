-- ═══════════════════════════════════════════════════════════════════════════
-- Corporate Quote Requests — Phase 1 "close the quote loop" columns
-- Roadmap: TouchGift-Corporate-Complete-Roadmap.md §3 Phase 1
--
-- Adds the ops fields the dashboard needs but which did not previously exist:
--   assignee        who in ops owns this quote
--   internal_notes  ops-only notes (distinct from customer-facing `notes`)
--   quoted_amount   the number ops actually quoted (vs the customer's slider
--                   estimate in total_estimate — these routinely differ)
--   valid_until     quote expiry
--   category        enables the required category filter; product_name is free
--                   text and cannot be filtered on
--   phone           WhatsApp deep link (1.1 "copy WhatsApp deep link") has no
--                   number to work from without this
--   moq_tier        the bulk price tier that was quoted
--   design_payload  Studio fulfillment JSON from the Customization Studio, so a
--                   design travels with the quote instead of living in the
--                   customer's head
--   design_preview_url  rendered PNG from /api/customizations/upload
--
-- corporate_account_id is Phase 2 (2.3) — added now as a nullable FK so Phase 2
-- does not need another table rewrite.
--
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE corporate_quote_requests
  ADD COLUMN IF NOT EXISTS assignee            text,
  ADD COLUMN IF NOT EXISTS internal_notes      text,
  ADD COLUMN IF NOT EXISTS quoted_amount       numeric(12,2),
  ADD COLUMN IF NOT EXISTS valid_until         timestamptz,
  ADD COLUMN IF NOT EXISTS category            text,
  ADD COLUMN IF NOT EXISTS phone               text,
  ADD COLUMN IF NOT EXISTS moq_tier            text,
  ADD COLUMN IF NOT EXISTS design_payload      jsonb,
  ADD COLUMN IF NOT EXISTS design_preview_url  text,
  ADD COLUMN IF NOT EXISTS updated_at          timestamptz NOT NULL DEFAULT now();

-- Phase 2: tie quotes to a company brain so the second order is faster.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'corporate_quote_requests'
      AND column_name = 'corporate_account_id'
  ) THEN
    ALTER TABLE corporate_quote_requests
      ADD COLUMN corporate_account_id uuid REFERENCES corporate_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ops filters are all now real columns, so give them indexes. Without these the
-- dashboard's status + date + category + text search degrades to a seq scan
-- once the table passes a few thousand rows.
CREATE INDEX IF NOT EXISTS idx_corp_quotes_assignee   ON corporate_quote_requests (assignee);
CREATE INDEX IF NOT EXISTS idx_corp_quotes_category   ON corporate_quote_requests (category);
CREATE INDEX IF NOT EXISTS idx_corp_quotes_account    ON corporate_quote_requests (corporate_account_id);

-- Keep updated_at honest. The dashboard writes assignee/notes/quoted_amount
-- through PATCH, and ops will filter on "what changed recently".
CREATE OR REPLACE FUNCTION touch_corporate_quote_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_corp_quotes_updated_at ON corporate_quote_requests;
CREATE TRIGGER trg_corp_quotes_updated_at
  BEFORE UPDATE ON corporate_quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION touch_corporate_quote_updated_at();
