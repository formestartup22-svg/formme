-- Add fields for production parameters that manufacturers submit
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS fabric_type TEXT,
ADD COLUMN IF NOT EXISTS gsm TEXT,
ADD COLUMN IF NOT EXISTS shrinkage TEXT,
ADD COLUMN IF NOT EXISTS color_fastness TEXT,
ADD COLUMN IF NOT EXISTS lab_dip_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS production_params_submitted_at TIMESTAMP WITH TIME ZONE;