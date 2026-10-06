-- Run this in your Supabase SQL editor or via the CLI
-- Creates the corporate_inquiries table to store all bulk upload requests

CREATE TABLE IF NOT EXISTS corporate_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  gift_description TEXT,
  budget TEXT,
  delivery_date DATE,
  notes TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'quoted', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast status filtering in admin
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_status ON corporate_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_created ON corporate_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_company ON corporate_inquiries(company_name);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_corporate_inquiries_updated_at
  BEFORE UPDATE ON corporate_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Only service role can read/write (admin-only access)
ALTER TABLE corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by the API)
CREATE POLICY "Service role full access" ON corporate_inquiries
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: allow authenticated admin users to read
-- CREATE POLICY "Admin read" ON corporate_inquiries
--   FOR SELECT USING (auth.role() = 'authenticated');
