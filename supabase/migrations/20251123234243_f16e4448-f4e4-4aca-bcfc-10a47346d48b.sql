-- Add production_params_approved column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS production_params_approved BOOLEAN DEFAULT NULL;