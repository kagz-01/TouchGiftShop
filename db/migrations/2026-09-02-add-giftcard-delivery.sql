-- Migration: add delivery_methods (jsonb), sent_at (timestamptz), and ensure recipient_email exists
-- Run this on production DB (Postgres)

BEGIN;

ALTER TABLE IF EXISTS gift_cards
  ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(200);

ALTER TABLE IF EXISTS gift_cards
  ADD COLUMN IF NOT EXISTS delivery_methods JSONB DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS gift_cards
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Ensure send_date exists (date) if missing
ALTER TABLE IF EXISTS gift_cards
  ADD COLUMN IF NOT EXISTS send_date DATE;

-- Optional: orders columns used by earlier patches
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS gift_card_code VARCHAR(50);

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS gift_card_discount NUMERIC(10,2);

COMMIT;
