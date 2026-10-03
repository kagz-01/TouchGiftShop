-- Migration: persist the gift card's chosen colours
-- Run this on production DB (Postgres)
--
-- The purchase route has always written `style` and the recipient view has
-- always read it, but the column was never created — so every insert silently
-- dropped the customer's chosen colours (the route's retry loop exists only to
-- work around exactly this). Adding the column makes the selection stick and
-- lets the recipient see the card as it was designed.

BEGIN;

ALTER TABLE IF EXISTS gift_cards
  ADD COLUMN IF NOT EXISTS style JSONB;

COMMENT ON COLUMN gift_cards.style IS
  'Chosen card appearance: { theme, bg, accent, textPrimary, textSecondary }';

COMMIT;