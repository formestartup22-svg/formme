-- Fix RLS policies for design-files storage bucket to allow tech pack uploads
-- Allow users to upload tech pack files with their user_id in the path
CREATE POLICY "Users can upload tech packs for their designs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own tech pack files  
CREATE POLICY "Users can view their tech pack files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'design-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);