-- Buttons & Leis — Orders Table
-- Run this in the Supabase SQL Editor at: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  type TEXT NOT NULL,          -- 'lei' | 'button'
  fulfillment TEXT,            -- 'pickup' | 'shipping' (set by Stripe webhook)
  contact JSONB NOT NULL,
  design JSONB NOT NULL,
  total NUMERIC NOT NULL,
  admin_notes TEXT DEFAULT '',
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow the anon key (frontend) to INSERT new orders only
CREATE POLICY "Allow insert from frontend" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow the anon key (frontend/admin page) to read orders
-- NOTE: In production, restrict this to authenticated admin only
CREATE POLICY "Allow read for admin" ON orders
  FOR SELECT TO anon
  USING (true);

-- Allow anon to update admin_notes and status (admin page)
CREATE POLICY "Allow update for admin" ON orders
  FOR UPDATE TO anon
  USING (true);

-- Allow anon to delete orders (admin page)
CREATE POLICY "Allow delete for admin" ON orders
  FOR DELETE TO anon
  USING (true);

-- Enable Realtime so the admin page gets live updates
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
