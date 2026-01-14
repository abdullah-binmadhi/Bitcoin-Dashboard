-- Add market_insight column to all coin tables

ALTER TABLE bitcoin_data ADD COLUMN IF NOT EXISTS market_insight TEXT;
ALTER TABLE ethereum_data ADD COLUMN IF NOT EXISTS market_insight TEXT;
ALTER TABLE xrp_data ADD COLUMN IF NOT EXISTS market_insight TEXT;
ALTER TABLE solana_data ADD COLUMN IF NOT EXISTS market_insight TEXT;
