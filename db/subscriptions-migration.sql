-- Subscriptions feature migration
-- Run this in Supabase SQL Editor to add subscriptions support to the reminders table.
-- https://supabase.com/dashboard/project/vuspfwmhqgbddosauvtj/sql/new

ALTER TABLE reminders ALTER COLUMN occasion_date DROP NOT NULL;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT FALSE;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS frequency VARCHAR(50);
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS delivery_day VARCHAR(20);
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
