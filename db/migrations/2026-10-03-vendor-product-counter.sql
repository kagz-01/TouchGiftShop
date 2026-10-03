-- Migration: vendor product counter
-- Run this on production DB (Postgres)
--
-- The marketplace product route called a generic increment_column(table, column,
-- row) RPC that was never created, so vendors' total_products stayed at zero
-- after every listing. Replaced with a function scoped to this one counter,
-- which avoids constructing SQL from caller-supplied table and column names.

BEGIN;

CREATE OR REPLACE FUNCTION public.increment_vendor_products(vendor_id UUID)
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE public.marketplace_vendors
     SET total_products = COALESCE(total_products, 0) + 1
   WHERE id = vendor_id;
$$;

-- The old generic entry point is gone; drop it if a deployment ever adds it.
DROP FUNCTION IF EXISTS public.increment_column(TEXT, TEXT, UUID);

COMMIT;