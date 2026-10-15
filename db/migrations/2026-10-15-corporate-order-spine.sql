-- ─────────────────────────────────────────────────────────────────────────────
-- Make the corporate order spine real
--
-- Three intake endpoints were live and all three wrote columns that do not
-- exist, so a corporate order could not be created or retrieved at all:
--
--   POST /api/orders/corporate   → orders.product_name, orders.order_type,
--                                  orders.corporate_meta, orders.payment_tracking_id,
--                                  orders.payment_merchant_ref  (none exist)
--   POST /api/corporate/bulk-order → corporate_orders.product_id, contact_phone,
--                                  contact_email, quantity, unit_amount,
--                                  payment_method, delivery_method, and the status
--                                  'pending_invoice' (not in the enum)
--   /api/corporate/stats, /reports → orders.is_corporate, orders.department,
--                                     corporate_gift_pools.current_amount
--
-- Postgres raises 42703 and the routes 500, or swallow the error and carry on
-- against an order that was never written.
--
-- This migration adds the columns the flows genuinely need rather than
-- reshaping them into something they were not.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── corporate_orders ─────────────────────────────────────────────────────────
-- Gift-link flow fields. These are inputs, not projections of something else.
ALTER TABLE corporate_orders
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_amount DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30),
  ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_corp_orders_product ON corporate_orders (product_id);

-- ── orders: the fulfilment rows ───────────────────────────────────────────────
-- The parent link. Without it, "which company is this order for" is a join
-- through corporate_order_recipients, and three ops routes were querying
-- `orders.is_corporate`, a column that was never created.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS corporate_order_id UUID
  REFERENCES corporate_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_corporate ON orders (corporate_order_id)
  WHERE corporate_order_id IS NOT NULL;

-- ── Gift cards ────────────────────────────────────────────────────────────────
-- bulk-order stores the master order id inside `metadata`; give it something
-- to be indexed on so a card can be traced back to the order that minted it.
ALTER TABLE digital_gift_cards
  ADD COLUMN IF NOT EXISTS corporate_order_id UUID
  REFERENCES corporate_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gift_cards_corporate ON digital_gift_cards (corporate_order_id)
  WHERE corporate_order_id IS NOT NULL;
