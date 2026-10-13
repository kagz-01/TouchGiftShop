-- Corporate quote requests from the /corporate/catalog "Get Quote" modal
CREATE TABLE IF NOT EXISTS corporate_quote_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      text,
  product_name    text NOT NULL,
  quantity        integer NOT NULL CHECK (quantity > 0),
  company_name    text NOT NULL,
  email           text NOT NULL,
  notes           text,
  unit_price      numeric(10,2),
  total_estimate  numeric(12,2),
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','quoted','accepted','declined')),
  quoted_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for ops team dashboard queries
CREATE INDEX IF NOT EXISTS idx_corp_quotes_status    ON corporate_quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_corp_quotes_created   ON corporate_quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corp_quotes_email     ON corporate_quote_requests (email);

-- RLS: service role can do everything; public cannot read
ALTER TABLE corporate_quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON corporate_quote_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
