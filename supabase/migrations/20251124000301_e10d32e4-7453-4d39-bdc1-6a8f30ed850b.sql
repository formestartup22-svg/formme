-- Add quality check fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS qc_photos_s text,
ADD COLUMN IF NOT EXISTS qc_photos_m text,
ADD COLUMN IF NOT EXISTS qc_photos_l text,
ADD COLUMN IF NOT EXISTS qc_photos_xl text,
ADD COLUMN IF NOT EXISTS qc_notes text,
ADD COLUMN IF NOT EXISTS qc_result text,
ADD COLUMN IF NOT EXISTS qc_submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS qc_approved boolean;