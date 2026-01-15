-- Create signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id TEXT NOT NULL CHECK (section_id IN ('party_a', 'party_b')),
  verification_code_hash TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  is_signed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_signatures_section ON signatures(section_id);

-- Enable Row Level Security
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read signatures (for display purposes)
CREATE POLICY "Allow public read access" ON signatures
  FOR SELECT USING (true);

-- Allow insert only if section not already signed
CREATE POLICY "Allow insert if not signed" ON signatures
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM signatures WHERE section_id = signatures.section_id
    )
  );
