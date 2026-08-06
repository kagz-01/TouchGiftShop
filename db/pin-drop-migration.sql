-- Pin Drop feature: add token and time window columns to orders
-- Run this against the Supabase database to add the new columns

ALTER TABLE orders ADD COLUMN IF NOT EXISTS pin_drop_token VARCHAR(64) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time_window VARCHAR(50);
