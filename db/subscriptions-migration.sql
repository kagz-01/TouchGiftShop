-- Subscriptions feature migration
-- Run this in Supabase SQL Editor to add subscriptions support to the reminders table.
-- https://supabase.com/dashboard/project/vuspfwmhqgbddosauvtj/sql/new

-- It looks like the `reminders` table hasn't been created yet in your Supabase!
-- Run this full script to create it with the correct schema (including the new product_ids array).

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    occasion_date DATE,
    occasion_type VARCHAR(50),
    is_subscription BOOLEAN DEFAULT FALSE,
    frequency VARCHAR(50),
    product_ids JSONB DEFAULT '[]'::jsonb, -- Store multiple products
    delivery_day VARCHAR(20),
    delivery_address TEXT,
    google_maps_link TEXT, -- Maps integration
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON reminders(user_id, occasion_date);
