-- Migration: gift_card_redemptions audit table
-- Run this on production DB (Postgres)
--
-- The redemption code in app/api/payment/ipn/route.ts has always tried to write
-- an audit row here, but the table never existed, so every failure was swallowed
-- and no redemption was ever recorded. That also meant a balance deduction that
-- silently matched zero rows left no trace.

BEGIN;

CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL
    REFERENCES gift_cards (id) ON DELETE CASCADE,
  order_id UUID,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per order: makes double-debit of the same order detectable.
CREATE UNIQUE INDEX IF NOT EXISTS gift_card_redemptions_order_id_uniq
  ON gift_card_redemptions (order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gift_card_redemptions_gift_card_id_idx
  ON gift_card_redemptions (gift_card_id, created_at DESC);

-- Service-role writes bypass RLS, so keep anon/authenticated out entirely.
ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;

COMMIT;