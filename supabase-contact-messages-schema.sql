-- Contact Messages Table for Supabase
-- Run this in Supabase SQL Editor to create the table

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  replied BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for anyone (for contact form submissions)
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can read messages
CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users (admins) can update messages
CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from the website';
