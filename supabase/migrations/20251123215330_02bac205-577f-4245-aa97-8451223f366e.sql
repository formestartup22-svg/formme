
-- Drop ALL manufacturer upload policies to ensure clean slate
DROP POLICY IF EXISTS "Manufacturers can upload files for their orders" ON storage.objects;

-- Create the CORRECT policy checking the file NAME not manufacturer NAME
CREATE POLICY "Manufacturers can upload files for their orders"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' 
  AND EXISTS (
    SELECT 1 
    FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE m.user_id = auth.uid()
    AND o.designer_id::text = (storage.foldername(storage.objects.name))[1]
  )
);
