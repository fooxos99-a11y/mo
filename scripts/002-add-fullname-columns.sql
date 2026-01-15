-- Add full name columns for both parties
ALTER TABLE documents ADD COLUMN IF NOT EXISTS party1_full_name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS party2_full_name TEXT;
