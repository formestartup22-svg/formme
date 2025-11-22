-- Fix RLS policy for designs table to allow designers to insert
DROP POLICY IF EXISTS "Designers can create designs" ON public.designs;

CREATE POLICY "Designers can create designs" 
ON public.designs 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'designer'
  )
);

-- Ensure designers can update their own designs
DROP POLICY IF EXISTS "Designers can update their own designs" ON public.designs;

CREATE POLICY "Designers can update their own designs" 
ON public.designs 
FOR UPDATE 
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'designer'
  )
);

-- Ensure designers can view their own designs
DROP POLICY IF EXISTS "Designers can view their own designs" ON public.designs;

CREATE POLICY "Designers can view their own designs" 
ON public.designs 
FOR SELECT 
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'designer'
  )
);

-- Ensure designers can delete their own designs
DROP POLICY IF EXISTS "Designers can delete their own designs" ON public.designs;

CREATE POLICY "Designers can delete their own designs" 
ON public.designs 
FOR DELETE 
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'designer'
  )
);