-- Add sample approval fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS sample_submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sample_approved boolean;