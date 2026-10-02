-- Migration: gift card reversal support
-- Run this on production DB (Postgres)
--
-- gift_card_redemptions already records that a debit happened, and its unique
-- index on order_id guarantees at most one redemption row per order. These
-- columns let us credit the same amount back when an order is refunded or
-- cancelled, and record why.

BEGIN;

ALTER TABLE IF EXISTS gift_card_redemptions
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS gift_card_redemptions
  ADD COLUMN IF NOT EXISTS reversal_reason TEXT;

COMMIT;