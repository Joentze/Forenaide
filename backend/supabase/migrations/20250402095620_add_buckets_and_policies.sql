ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

INSERT INTO
    storage.buckets (
        id,
        name,
        file_size_limit,
        public,
        avif_autodetection
    )
VALUES
    (
        'outputs',
        'outputs',
        5242880,
        TRUE,
        FALSE
    );

INSERT INTO
    storage.buckets (
        id,
        name,
        file_size_limit,
        public,
        avif_autodetection
    )
VALUES
    (
        'sources',
        'sources',
        5242880,
        TRUE,
        FALSE
    );

-- CREATE POLICY "Allow anonymous uploads"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id in ('sources', 'outputs') AND
--   auth.role() = 'anon'
-- );

-- CREATE POLICY "Allow anonymous read access"
-- ON storage.objects
-- FOR SELECT
-- USING (
--   bucket_id in ('sources', 'outputs') AND
--   auth.role() = 'anon'
-- );

-- CREATE POLICY "Allow anonymous deletes" ON storage.objects FOR
-- DELETE USING (
--   bucket_id in ('sources', 'outputs')
--   AND auth.role () = 'anon'
-- );
