-- supabase-storage-policies.sql
-- Storage policies for Property Snap feature
-- Run this in your Supabase SQL editor

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading property images
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'shopimage' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND starts_with(name, 'property-snap/')
);

-- Policy for viewing property images
CREATE POLICY "Users can view property images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'shopimage' 
  AND (
    -- Users can view their own images
    auth.uid()::text = (storage.foldername(name))[2]
    OR
    -- Public images can be viewed by anyone (for shared reports)
    EXISTS (
      SELECT 1 FROM public."PropertyReport" 
      WHERE "shareToken" IS NOT NULL 
      AND "isPublic" = true
      AND "userImages"::text LIKE '%' || name || '%'
    )
  )
);

-- Policy for updating property images
CREATE POLICY "Users can update their property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'shopimage' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND starts_with(name, 'property-snap/')
);

-- Policy for deleting property images
CREATE POLICY "Users can delete their property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'shopimage' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND starts_with(name, 'property-snap/')
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name_prefix ON storage.objects(name text_pattern_ops);

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_property_images()
RETURNS void AS $$
BEGIN
  -- Delete files that are not referenced in any PropertyReport
  DELETE FROM storage.objects 
  WHERE bucket_id = 'shopimage'
  AND starts_with(name, 'property-snap/')
  AND NOT EXISTS (
    SELECT 1 FROM public."PropertyReport" 
    WHERE "userImages"::text LIKE '%' || name || '%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid text)
RETURNS TABLE(
  total_size bigint,
  file_count bigint,
  total_size_mb numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(metadata->>'size')::bigint, 0) as total_size,
    COUNT(*) as file_count,
    ROUND(COALESCE(SUM(metadata->>'size')::bigint, 0) / 1024.0 / 1024.0, 2) as total_size_mb
  FROM storage.objects 
  WHERE bucket_id = 'shopimage'
  AND starts_with(name, 'property-snap/' || user_uuid || '/');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cleanup_orphaned_property_images() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_storage_usage(text) TO authenticated;
