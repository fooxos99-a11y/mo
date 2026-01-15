-- Create documents table for storing legal agreements
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  party1_name TEXT NOT NULL,
  party1_code TEXT NOT NULL,
  party1_signature TEXT,
  party1_signed_at TIMESTAMPTZ,
  party1_ip TEXT,
  party2_name TEXT NOT NULL,
  party2_code TEXT NOT NULL,
  party2_signature TEXT,
  party2_signed_at TIMESTAMPTZ,
  party2_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can customize this later)
CREATE POLICY "Allow all operations on documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);
