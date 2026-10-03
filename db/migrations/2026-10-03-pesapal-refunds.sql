-- Migration: record the PesaPal tracking id and refund outcome on orders
-- Run this on production DB (Postgres)
--
-- PesaPal's RefundRequest needs the original order_tracking_id as its
-- confirmation code. The IPN receives that id but it was never stored, so there
-- was no way to refund an order after the fact — the reversal feature could
-- credit a gift card back but could never return the money.

BEGIN;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS refund_status TEXT;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS refund_message TEXT;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.pesapal_tracking_id IS
  'PesaPal order_tracking_id; required to request a refund';
COMMENT ON COLUMN orders.refund_status IS
  'null | completed | failed | not_supported';

CREATE INDEX IF NOT EXISTS orders_pesapal_tracking_id_idx
  ON orders (pesapal_tracking_id)
  WHERE pesapal_tracking_id IS NOT NULL;

COMMIT;