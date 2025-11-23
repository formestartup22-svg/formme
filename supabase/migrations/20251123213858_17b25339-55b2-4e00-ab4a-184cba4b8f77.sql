-- Allow manufacturers to upload files for their orders
CREATE POLICY "Manufacturers can upload files for their orders"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' 
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE m.user_id = auth.uid()
    AND (storage.foldername(name))[1] = o.designer_id::text
  )
);

-- Allow manufacturers to view designs they have orders for
CREATE POLICY "Manufacturers can view designs for their orders"
ON public.designs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE o.design_id = designs.id
    AND m.user_id = auth.uid()
  )
);