-- Create storage bucket for store and product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload store assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public viewing of store assets
CREATE POLICY "Store assets are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'store-assets');

-- Allow users to update their own store assets
CREATE POLICY "Users can update their store assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'store-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own store assets
CREATE POLICY "Users can delete their store assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'store-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policies for vendors to manage products in their stores
CREATE POLICY "Vendors can manage products in their store"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = products.vendor_id 
    AND v.user_id = auth.uid()
    AND v.status = 'approved'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = products.vendor_id 
    AND v.user_id = auth.uid()
    AND v.status = 'approved'
  )
);