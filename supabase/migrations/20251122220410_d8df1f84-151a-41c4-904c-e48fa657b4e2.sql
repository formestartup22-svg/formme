-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also update RLS policies for better functionality
CREATE POLICY "Service role can insert any role"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);