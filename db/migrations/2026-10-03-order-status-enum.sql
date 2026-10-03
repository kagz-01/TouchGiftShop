-- Migration: allow refunded and cancelled order statuses
-- Run this on production DB (Postgres)
--
-- orders.status is an enum, and the admin reversal feature writes "refunded" and
-- "cancelled". Neither existed, so every reversal failed with
--   invalid input value for enum order_status_enum: "refunded"
-- and the gift card balance was never credited back. Adding the values the
-- application already accepts.

BEGIN;

ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'cancelled';

COMMIT;

-- Note: ADD VALUE cannot run inside a transaction block on older PostgreSQL.
-- If the statement above errors with "cannot be executed from a function" or a
-- transaction-related error, run these two statements on their own instead:
--
--   ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'refunded';
--   ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'cancelled';