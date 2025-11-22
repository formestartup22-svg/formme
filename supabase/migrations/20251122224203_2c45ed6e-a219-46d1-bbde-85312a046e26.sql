-- Add rating column to manufacturers table for quality/reliability scoring
ALTER TABLE public.manufacturers 
ADD COLUMN IF NOT EXISTS rating double precision;

-- Add constraint to ensure rating is between 0 and 5
ALTER TABLE public.manufacturers 
ADD CONSTRAINT rating_range CHECK (rating >= 0 AND rating <= 5);

-- Add comment
COMMENT ON COLUMN public.manufacturers.rating IS 'Manufacturer quality/reliability rating out of 5';
