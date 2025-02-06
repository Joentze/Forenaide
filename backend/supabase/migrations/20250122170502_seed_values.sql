-- Insert mock data for templates
INSERT INTO
  templates (
    id,
    name,
    description,
    extraction_schema,
    created_at
  )
VALUES
  (
    'bda1b6b4-f7ae-4f65-b9c0-d8b3a9f1c7a8',
    'Template A',
    'Description for Template A',
    '{"fields": [{"name": "field1", "type": "string"}, {"name": "field2", "type": "integer"}]}',
    current_timestamp
  ),
  (
    'c4a8f4c1-3e8d-41a7-94dc-3c645d1f1c34',
    'Template B',
    'Description for Template B',
    '{"fields": [{"name": "field1", "type": "boolean"}, {"name": "field2", "type": "float"}]}',
    current_timestamp
  );

-- Insert mock data for strategies
INSERT INTO
  strategies (id, strategy, name, description)
VALUES
  (
    '15f2a8c5-72bf-4c08-84c8-252b576ad144',
    'Strategy X',
    'Strategy X Name',
    'Description for Strategy X'
  ),
  (
    'a83c8e7b-b314-4a2e-906c-2e43f7882c9d',
    'Strategy Y',
    'Strategy Y Name',
    'Description for Strategy Y'
  );

-- Insert mock data for pipeline_runs
INSERT INTO
  pipeline_runs (
    id,
    name,
    description,
    strategy_id,
    extraction_schema,
    status,
    started_at,
    completed_at,
    file_uris
  )
VALUES
  (
    '21c0eeda-f64f-40c2-8728-b8d62d6b9b63',
    'Pipeline Run A',
    'Description for Pipeline Run A',
    '15f2a8c5-72bf-4c08-84c8-252b576ad144',
    '{"config": {"key": "value"}}',
    'completed',
    current_timestamp - interval '1 hour',
    current_timestamp,
    ARRAY ['https://example.com/file1.json', 'https://example.com/file2.json']
  ),
  (
    '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7',
    'Pipeline Run B',
    'Description for Pipeline Run B',
    'a83c8e7b-b314-4a2e-906c-2e43f7882c9d',
    '{"config": {"key": "value2"}}',
    'processing',
    current_timestamp - interval '30 minutes',
    current_timestamp,
    ARRAY ['https://example.com/file3.json', 'https://example.com/file4.json']
  );

-- Insert mock data for data_sources
INSERT INTO
  data_sources (id, uri, mimetype, filename)
VALUES
  (
    'e784ff29-6d11-4b6f-9b3d-8d8a8e1e2f17',
    'https://example.com/data1.json',
    'JSON',
    'data1.json'
  ),
  (
    '3b4db45f-3628-4a76-b5b3-6eeb5c6c3ed6',
    'https://example.com/data2.csv',
    'CSV',
    'data2.csv'
  );

-- Insert mock data for sources_pipeline
INSERT INTO
  sources_pipeline (id, pipeline_id, source_id)
VALUES
  (
    '8b1e9f19-3b2c-4a64-8c5f-5bfa8f34a7b8',
    '21c0eeda-f64f-40c2-8728-b8d62d6b9b63',
    'e784ff29-6d11-4b6f-9b3d-8d8a8e1e2f17'
  ),
  (
    '6f8c7e29-3b5f-4567-8b2c-5cf4b6c9d1e7',
    '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7',
    '3b4db45f-3628-4a76-b5b3-6eeb5c6c3ed6'
  );

-- Insert mock data for outputs
INSERT INTO
  outputs (id, pipeline_id, uri)
VALUES
  (
    'b09f6532-cd8d-4c19-a8cf-3a8c762e5264',
    '21c0eeda-f64f-40c2-8728-b8d62d6b9b63',
    'https://example.com/output1.json'
  ),
  (
    '5de8f8f1-9e45-45f7-a6f2-7f8a3d9d6c7d',
    '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7',
    'https://example.com/output2.json'
  );