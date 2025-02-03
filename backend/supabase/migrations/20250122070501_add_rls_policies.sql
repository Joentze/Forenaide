ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id in ('sources', 'outputs') AND
  auth.role() = 'anon'
);

CREATE POLICY "Allow anonymous read access"
ON storage.objects
FOR SELECT
USING (
  bucket_id in ('sources', 'outputs') AND
  auth.role() = 'anon'
);

