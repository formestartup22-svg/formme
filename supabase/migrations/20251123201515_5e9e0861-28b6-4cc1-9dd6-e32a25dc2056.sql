-- Add categories column to manufacturers table for garment types
ALTER TABLE public.manufacturers ADD COLUMN IF NOT EXISTS categories text[] DEFAULT NULL;

COMMENT ON COLUMN public.manufacturers.categories IS 'Types of garments manufactured (T-Shirts, Jackets, etc.)';
COMMENT ON COLUMN public.manufacturers.specialties IS 'Manufacturing capabilities (Cut & Sew, Embroidery, etc.)';
COMMENT ON COLUMN public.manufacturers.certifications IS 'Industry certifications (GOTS, OEKO-TEX, etc.)';