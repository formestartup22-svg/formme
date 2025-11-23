-- Simplify the RLS policy for designs table
-- The current policy may be too strict - let's make it check the role more directly

DROP POLICY IF EXISTS "Designers can create designs" ON public.designs;

-- Create a simpler policy that just checks if the user has a designer role
CREATE POLICY "Designers can create designs" 
ON public.designs 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'designer'::app_role
  )
);