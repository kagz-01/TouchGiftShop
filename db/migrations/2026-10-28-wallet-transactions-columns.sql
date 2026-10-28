-- Migration: 2026-10-28-wallet-transactions-columns.sql
-- Ensure user_wallets table has updated_at and proper defaults,
-- and add wallet_id, reference_type, reference_id to wallet_transactions for phone-based wallets.

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_wallets
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES user_wallets(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reference_type TEXT,
  ADD COLUMN IF NOT EXISTS reference_id TEXT;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
