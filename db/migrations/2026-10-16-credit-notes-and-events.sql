-- ─────────────────────────────────────────────────────────────────────────────
-- Credit notes and an invoice you can actually withdraw
--
-- An invoice you cannot cancel is a document you will regret. Two things were
-- missing:
--
--   · Void. The `status` enum already had 'void', but nothing wrote it and
--     nothing could write it. A wrongly-priced quote that has already gone out
--     needs a way to withdraw it, with a recorded reason, keeping its number.
--
--   · Credit note. Voiding an invoice after the client has paid does not give
--     them their money back — it only removes the charge. A credit note is a
--     separate document for the refund or the adjustment, and it has to be able
--     to stand alone, which is why it snapshots the seller's details rather
--     than reading them off the invoice it corrects.
--
-- Credit note numbers come from their own sequence for the same reason invoice
-- numbers do: never reused, never reset.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS corporate_credit_note_seq START 1;

CREATE OR REPLACE FUNCTION next_corporate_credit_note_number()
RETURNS BIGINT
LANGUAGE sql
VOLATILE
AS $$
  SELECT nextval('corporate_credit_note_seq');
$$;

CREATE TABLE IF NOT EXISTS corporate_credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  credit_note_number TEXT NOT NULL UNIQUE,
  fiscal_year        SMALLINT NOT NULL,

  invoice_id         UUID NOT NULL REFERENCES corporate_invoices(id) ON DELETE CASCADE,
  corporate_order_id UUID REFERENCES corporate_orders(id) ON DELETE SET NULL,
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'issued'
            CHECK (status IN ('draft', 'issued', 'applied')),
  reason TEXT NOT NULL
            CHECK (reason IN ('duplicate', 'incorrect_amount', 'goods_returned',
                              'service_not_delivered', 'other')),
  reason_note TEXT,

  currency      CHAR(3) NOT NULL DEFAULT 'KES',
  vat_registered BOOLEAN NOT NULL DEFAULT FALSE,
  vat_rate      NUMERIC(5,2) NOT NULL DEFAULT 0,
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Snapshot of the lines being credited, so the note stands alone years later.
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Seller and buyer snapshots again: this document goes to the same finance
  -- team as the invoice, possibly years later, and must not change with them.
  seller_name       TEXT NOT NULL,
  seller_pin        TEXT,
  seller_vat_number TEXT,
  seller_address    TEXT,
  buyer_name        TEXT NOT NULL,
  buyer_tax_id      TEXT,
  buyer_address     TEXT,
  buyer_email       TEXT,

  -- Which later invoice absorbed this credit, once one exists.
  applied_to_invoice_id UUID REFERENCES corporate_invoices(id) ON DELETE SET NULL,
  applied_at       TIMESTAMPTZ,

  issued_by TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON corporate_credit_notes (invoice_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_notes_account ON corporate_credit_notes (corporate_account_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON corporate_credit_notes (status);

ALTER TABLE corporate_credit_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages credit notes" ON corporate_credit_notes;
CREATE POLICY "Service role manages credit notes" ON corporate_credit_notes
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own credit notes" ON corporate_credit_notes;
CREATE POLICY "Members read own credit notes" ON corporate_credit_notes
  FOR SELECT TO authenticated
  USING (
    corporate_account_id IN (SELECT corporate_account_ids_for_user())
    AND status <> 'draft'
  );

-- ── Operational trail ────────────────────────────────────────────────────────
-- Invoicing is now automatic on dispatch, so "why does this order have an
-- invoice" needs an answer that is not a log line. One row per event, with the
-- actor, survives the code that produced it.
CREATE TABLE IF NOT EXISTS corporate_invoice_events (
  id BIGSERIAL PRIMARY KEY,
  corporate_order_id UUID REFERENCES corporate_orders(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES corporate_invoices(id) ON DELETE CASCADE,
  credit_note_id UUID REFERENCES corporate_credit_notes(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  actor TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_events_order ON corporate_invoice_events (corporate_order_id, created_at DESC);

ALTER TABLE corporate_invoice_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role writes invoice events" ON corporate_invoice_events;
CREATE POLICY "Service role writes invoice events" ON corporate_invoice_events
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "No client read of invoice events" ON corporate_invoice_events;
CREATE POLICY "No client read of invoice events" ON corporate_invoice_events
  FOR SELECT TO anon, authenticated USING (false);