-- Create storage bucket for design files
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-files', 'design-files', true);

-- Create RLS policies for design files bucket
CREATE POLICY "Users can upload their own design files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own design files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'design-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own design files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'design-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own design files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'design-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);