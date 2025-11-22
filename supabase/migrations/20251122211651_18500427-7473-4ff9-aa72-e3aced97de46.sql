-- Add missing fields to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS moq INTEGER,
ADD COLUMN IF NOT EXISTS lead_time INTEGER,
ADD COLUMN IF NOT EXISTS rating FLOAT;

-- Add status field to designs table
ALTER TABLE public.designs
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'specs', 'matching', 'in_production', 'completed'));

-- Create design_specs table (technical specifications for each design)
CREATE TABLE IF NOT EXISTS public.design_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  measurements JSONB,
  fabric_type TEXT,
  gsm INTEGER,
  print_type TEXT,
  construction_notes TEXT,
  artwork_url TEXT,
  drawing_image_url TEXT,
  drawing_vector_data JSONB,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(design_id)
);

ALTER TABLE public.design_specs ENABLE ROW LEVEL SECURITY;

-- Create techpacks table (AI-generated or uploaded PDFs with versioning)
CREATE TABLE IF NOT EXISTS public.techpacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  pdf_file_id TEXT,
  pdf_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  generated_by TEXT CHECK (generated_by IN ('ai', 'user-upload')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.techpacks ENABLE ROW LEVEL SECURITY;

-- Create manufacturer_matches table (recommendation system)
CREATE TABLE IF NOT EXISTS public.manufacturer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  score FLOAT CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(design_id, manufacturer_id)
);

ALTER TABLE public.manufacturer_matches ENABLE ROW LEVEL SECURITY;

-- Create chats table (chat threads between designer and manufacturer for specific design)
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(design_id, manufacturer_id)
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Modify messages table to use chat_id instead of order_id
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS techpack_id UUID REFERENCES public.techpacks(id),
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create production_updates table (status timeline for orders)
CREATE TABLE IF NOT EXISTS public.production_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.production_updates ENABLE ROW LEVEL SECURITY;

-- Create attachments table (unified file storage mapping)
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID REFERENCES public.designs(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  techpack_id UUID REFERENCES public.techpacks(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_design_specs_updated_at
BEFORE UPDATE ON public.design_specs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for design_specs
CREATE POLICY "Designers can view their own design specs"
ON public.design_specs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = design_specs.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Designers can insert their own design specs"
ON public.design_specs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = design_specs.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Designers can update their own design specs"
ON public.design_specs FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = design_specs.design_id 
  AND designs.user_id = auth.uid()
));

-- RLS Policies for techpacks
CREATE POLICY "Designers can view their own techpacks"
ON public.techpacks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = techpacks.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Designers can create techpacks for their designs"
ON public.techpacks FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = techpacks.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Manufacturers can view techpacks for their matched designs"
ON public.techpacks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.manufacturer_matches mm
  JOIN public.manufacturers m ON m.id = mm.manufacturer_id
  WHERE mm.design_id = techpacks.design_id 
  AND m.user_id = auth.uid()
  AND mm.status = 'accepted'
));

-- RLS Policies for manufacturer_matches
CREATE POLICY "Designers can view matches for their designs"
ON public.manufacturer_matches FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = manufacturer_matches.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Designers can create matches for their designs"
ON public.manufacturer_matches FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = manufacturer_matches.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Designers can update matches for their designs"
ON public.manufacturer_matches FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = manufacturer_matches.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Manufacturers can view their matches"
ON public.manufacturer_matches FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.manufacturers 
  WHERE manufacturers.id = manufacturer_matches.manufacturer_id 
  AND manufacturers.user_id = auth.uid()
));

CREATE POLICY "Manufacturers can update their match status"
ON public.manufacturer_matches FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.manufacturers 
  WHERE manufacturers.id = manufacturer_matches.manufacturer_id 
  AND manufacturers.user_id = auth.uid()
));

-- RLS Policies for chats
CREATE POLICY "Designers can view chats for their designs"
ON public.chats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = chats.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Designers can create chats for their designs"
ON public.chats FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.designs 
  WHERE designs.id = chats.design_id 
  AND designs.user_id = auth.uid()
));

CREATE POLICY "Manufacturers can view their chats"
ON public.chats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.manufacturers 
  WHERE manufacturers.id = chats.manufacturer_id 
  AND manufacturers.user_id = auth.uid()
));

-- RLS Policies for production_updates
CREATE POLICY "Designers can view updates for their orders"
ON public.production_updates FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = production_updates.order_id 
  AND orders.designer_id = auth.uid()
));

CREATE POLICY "Manufacturers can create updates for their orders"
ON public.production_updates FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders o
  JOIN public.manufacturers m ON m.id = o.manufacturer_id
  WHERE o.id = production_updates.order_id 
  AND m.user_id = auth.uid()
));

CREATE POLICY "Manufacturers can view updates for their orders"
ON public.production_updates FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders o
  JOIN public.manufacturers m ON m.id = o.manufacturer_id
  WHERE o.id = production_updates.order_id 
  AND m.user_id = auth.uid()
));

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments for their designs"
ON public.attachments FOR SELECT
USING (
  (design_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.designs 
    WHERE designs.id = attachments.design_id 
    AND designs.user_id = auth.uid()
  ))
  OR
  (message_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.chats c ON c.id = m.chat_id
    JOIN public.designs d ON d.id = c.design_id
    WHERE m.id = attachments.message_id 
    AND d.user_id = auth.uid()
  ))
  OR
  (message_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.chats c ON c.id = m.chat_id
    JOIN public.manufacturers mf ON mf.id = c.manufacturer_id
    WHERE m.id = attachments.message_id 
    AND mf.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create attachments"
ON public.attachments FOR INSERT
WITH CHECK (
  (design_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.designs 
    WHERE designs.id = attachments.design_id 
    AND designs.user_id = auth.uid()
  ))
  OR
  (message_id IS NOT NULL AND auth.uid() IS NOT NULL)
);