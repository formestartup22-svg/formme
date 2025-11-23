-- Add production timeline fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS production_start_date DATE,
ADD COLUMN IF NOT EXISTS production_completion_date DATE,
ADD COLUMN IF NOT EXISTS production_timeline_data JSONB DEFAULT '{}'::jsonb;