-- Drop the existing policy that's not working correctly
DROP POLICY IF EXISTS "Manufacturers can upload files for their orders" ON storage.objects;

-- Create a better policy that checks the order relationship correctly
CREATE POLICY "Manufacturers can upload files for their orders"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' 
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE m.user_id = auth.uid()
    AND o.designer_id::text = (storage.foldername(name))[1]
  )
);