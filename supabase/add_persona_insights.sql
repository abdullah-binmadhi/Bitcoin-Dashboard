-- Add persona-specific insight columns to all coin tables

ALTER TABLE bitcoin_data 
ADD COLUMN IF NOT EXISTS orbit_insight TEXT,
ADD COLUMN IF NOT EXISTS mechanic_insight TEXT,
ADD COLUMN IF NOT EXISTS risk_insight TEXT;

ALTER TABLE ethereum_data 
ADD COLUMN IF NOT EXISTS orbit_insight TEXT,
ADD COLUMN IF NOT EXISTS mechanic_insight TEXT,
ADD COLUMN IF NOT EXISTS risk_insight TEXT;

ALTER TABLE xrp_data 
ADD COLUMN IF NOT EXISTS orbit_insight TEXT,
ADD COLUMN IF NOT EXISTS mechanic_insight TEXT,
ADD COLUMN IF NOT EXISTS risk_insight TEXT;

ALTER TABLE solana_data 
ADD COLUMN IF NOT EXISTS orbit_insight TEXT,
ADD COLUMN IF NOT EXISTS mechanic_insight TEXT,
ADD COLUMN IF NOT EXISTS risk_insight TEXT;
