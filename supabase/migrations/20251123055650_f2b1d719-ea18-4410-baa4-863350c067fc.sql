-- Add INSERT policy for manufacturers table to allow users to create their own manufacturer profile
CREATE POLICY "Users can insert their own manufacturer profile"
ON public.manufacturers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);