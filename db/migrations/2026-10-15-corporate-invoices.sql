-- ─────────────────────────────────────────────────────────────────────────────
-- Corporate invoices
--
-- A corporate payment and a corporate invoice are different documents, and
-- conflating them is the problem this solves:
--
--   • PesaPal returns a *payment receipt* — proof that money moved. It is not a
--     commercial invoice: it has no line items, no tax, no buyer, no payment
--     terms, and it names the payment gateway rather than the seller.
--   • A client's finance department rejects anything that is not a proper
--     invoice. Today all they can do is email us and ask, because the portal
--     only offers a "Request an invoice" mailto.
--
-- Three rules shape the design:
--
--   1. An invoice is a snapshot, not a view. Buyer, seller, tax registration
--      and prices are copied onto the invoice at issue time. If the account is
--      renamed next month, last month's invoice must not change underneath the
--      finance team that already filed it.
--   2. Numbers are never reused. They come from a sequence, they carry the
--      fiscal year, and a voided invoice keeps its number. Gaps are normal;
--      duplicates are an audit finding.
--   3. Tax is explicit. A corporate document states net, VAT and gross
--      separately, because that is the format KRA expects — the consumer
--      storefront's "inclusive of all taxes" is not a tax invoice.
-- ─────────────────────────────────────────────────────────────────────────────

-- One sequence for every invoice, ever. Deliberately not reset per year: a
-- reset sequence is how duplicate numbers get issued across a year boundary.
CREATE SEQUENCE IF NOT EXISTS corporate_invoice_number_seq START 1001;

-- Numbers are drawn from Postgres, not from the application: an application
-- counter resets on deploy, races under concurrency, and repeats after a
-- rollback. nextval() is exactly the primitive this needs.
CREATE OR REPLACE FUNCTION next_corporate_invoice_number()
RETURNS BIGINT
LANGUAGE sql
VOLATILE
AS $$
  SELECT nextval('corporate_invoice_number_seq');
$$;

CREATE TABLE IF NOT EXISTS corporate_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- TINY-0001 style: prefix, fiscal year, sequence. Unique, never reused.
  invoice_number   TEXT NOT NULL UNIQUE,
  fiscal_year      SMALLINT NOT NULL,

  corporate_order_id   UUID NOT NULL REFERENCES corporate_orders(id) ON DELETE CASCADE,
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,

  -- draft    — ops is still assembling it
  -- issued   — sent to the client, payable, counted for tax
  -- paid     — settled against a PesaPal transaction
  -- void     — cancelled after issue; keeps its number forever
  status TEXT NOT NULL DEFAULT 'draft'
            CHECK (status IN ('draft', 'issued', 'paid', 'void')),

  currency      CHAR(3) NOT NULL DEFAULT 'KES',

  -- ── Seller snapshot ───────────────────────────────────────────────────────
  -- Taken from config at issue time. Never from a hardcoded literal: the
  -- registered entity name, KRA PIN and VAT number are the thing that makes an
  -- invoice a legal document, and they differ from the trading brand.
  seller_name        TEXT NOT NULL,
  seller_pin         TEXT,
  seller_vat_number  TEXT,
  seller_address     TEXT,
  seller_email       TEXT,

  -- ── Buyer snapshot ────────────────────────────────────────────────────────
  -- `buyer_*_override` is how ops records what the client's finance team
  -- actually requires, which is routinely not what we hold on the account.
  buyer_name          TEXT NOT NULL,
  buyer_tax_id        TEXT,
  buyer_address       TEXT,
  buyer_email         TEXT,
  buyer_override      JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- ── Money ─────────────────────────────────────────────────────────────────
  -- `vat_registered` false means this document is NOT a tax invoice and must
  -- say so on its face; better an honest invoice than one that claims VAT the
  -- business cannot account for.
  vat_registered  BOOLEAN NOT NULL DEFAULT FALSE,
  vat_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,

  payment_terms_days SMALLINT NOT NULL DEFAULT 0,
  due_at             TIMESTAMPTZ,

  -- ── Settlement ────────────────────────────────────────────────────────────
  psp_reference  TEXT,             -- PesaPal receipt number
  paid_at        TIMESTAMPTZ,

  -- ── Lifecycle ─────────────────────────────────────────────────────────────
  issued_at  TIMESTAMPTZ,
  sent_at    TIMESTAMPTZ,
  sent_to    TEXT,
  voided_at  TIMESTAMPTZ,
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Line items ───────────────────────────────────────────────────────────────
-- An invoice without lines is a receipt with nicer typography. A hamper order
-- is several items at different unit prices; a single total is not an invoice.
CREATE TABLE IF NOT EXISTS corporate_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES corporate_invoices(id) ON DELETE CASCADE,
  line_no    SMALLINT NOT NULL,
  description TEXT NOT NULL,
  quantity   NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  is_discount BOOLEAN NOT NULL DEFAULT FALSE,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_corporate_invoices_order ON corporate_invoices (corporate_order_id);
CREATE INDEX IF NOT EXISTS idx_corporate_invoices_account ON corporate_invoices (corporate_account_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_corporate_invoices_status ON corporate_invoices (status);
CREATE INDEX IF NOT EXISTS idx_corporate_invoice_lines_invoice ON corporate_invoice_lines (invoice_id, line_no);

CREATE OR REPLACE FUNCTION touch_corporate_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_corporate_invoices_updated_at ON corporate_invoices;
CREATE TRIGGER update_corporate_invoices_updated_at
  BEFORE UPDATE ON corporate_invoices
  FOR EACH ROW EXECUTE FUNCTION touch_corporate_invoices_updated_at();

-- RLS, same posture as the other corporate tables: service role manages, a
-- member of the owning account may read. The buyer snapshot on an invoice is
-- PII (address, tax ID), so the portal read path filters it rather than
-- selecting everything and hiding fields afterwards.
ALTER TABLE corporate_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages corporate invoices" ON corporate_invoices;
CREATE POLICY "Service role manages corporate invoices" ON corporate_invoices
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own invoices" ON corporate_invoices;
CREATE POLICY "Members read own invoices" ON corporate_invoices
  FOR SELECT TO authenticated
  USING (
    corporate_account_id IN (SELECT corporate_account_ids_for_user())
    AND status <> 'draft'
  );

ALTER TABLE corporate_invoice_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages corporate invoice lines" ON corporate_invoice_lines;
CREATE POLICY "Service role manages corporate invoice lines" ON corporate_invoice_lines
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members read own invoice lines" ON corporate_invoice_lines;
CREATE POLICY "Members read own invoice lines" ON corporate_invoice_lines
  FOR SELECT TO authenticated
  USING (
    invoice_id IN (
      SELECT i.id FROM corporate_invoices i
      WHERE i.corporate_account_id IN (SELECT corporate_account_ids_for_user())
        AND i.status <> 'draft'
    )
  );