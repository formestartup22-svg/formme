-- Fix RLS policy for designs table to allow designers to create designs
-- The current policy checks for designer role, but we need to ensure it works correctly

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Designers can create designs" ON public.designs;

-- Recreate with a more robust check
CREATE POLICY "Designers can create designs" 
ON public.designs 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND has_role(auth.uid(), 'designer'::app_role)
);