-- Migration: Add product_id to orders, tighten order history access
-- Run this against your Supabase project SQL editor.
-- Generated: 2026-08-08

-- 1. Add product_id column to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- 2. Ensure user_id is indexed for the new auth-scoped GET query
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 3. (Optional) Enable RLS if you want defence-in-depth at the DB layer too.
--    The API layer already gates on auth.uid(), but RLS adds a second layer.
--    Uncomment and run if you want belt-and-braces protection:
--
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view their own orders"
--   ON orders FOR SELECT
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Authenticated users can insert orders"
--   ON orders FOR INSERT
--   WITH CHECK (true);  -- service role bypasses RLS anyway
