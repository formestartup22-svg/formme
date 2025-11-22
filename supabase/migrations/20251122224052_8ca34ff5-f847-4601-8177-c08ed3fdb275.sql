-- Add max_capacity column to manufacturers table for matching algorithm
ALTER TABLE public.manufacturers 
ADD COLUMN IF NOT EXISTS max_capacity integer;

-- Add comment to explain the column
COMMENT ON COLUMN public.manufacturers.max_capacity IS 'Maximum production capacity in units';
