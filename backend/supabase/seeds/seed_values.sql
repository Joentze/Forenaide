INSERT INTO templates (id, name, schema, description, created_at) VALUES
    ('bda1b6b4-f7ae-4f65-b9c0-d8b3a9f1c7a8', 'Template A', '{"fields": [{"name": "field1", "type": "string"}, {"name": "field2", "type": "integer"}]}', 'Description for Template A', current_timestamp),
    ('c4a8f4c1-3e8d-41a7-94dc-3c645d1f1c34', 'Template B', '{"fields": [{"name": "field1", "type": "boolean"}, {"name": "field2", "type": "float"}]}', 'Description for Template B', current_timestamp);

INSERT INTO strategies (id, strategy) VALUES
    ('15f2a8c5-72bf-4c08-84c8-252b576ad144', 'Strategy X'),
    ('a83c8e7b-b314-4a2e-906c-2e43f7882c9d', 'Strategy Y');

INSERT INTO pipeline_runs (id, strategy_id, schema, status, started_at, completed_at) VALUES
    ('21c0eeda-f64f-40c2-8728-b8d62d6b9b63', '15f2a8c5-72bf-4c08-84c8-252b576ad144', '{"fields": [{"name": "field1", "type": "string"}, {"name": "field2", "type": "integer"}]}', 'completed', current_timestamp - interval '1 hour', current_timestamp),
    ('3642fbc9-e3b1-41d3-bde8-6c6d521f75d7', 'a83c8e7b-b314-4a2e-906c-2e43f7882c9d', '{"fields": [{"name": "field1", "type": "string"}, {"name": "field2", "type": "integer"}]}', 'running', current_timestamp - interval '30 minutes', current_timestamp);

INSERT INTO data_sources (id, uri, format, run_id) VALUES
    ('e784ff29-6d11-4b6f-9b3d-8d8a8e1e2f17', 'https://example.com/data1.json', 'JSON', '21c0eeda-f64f-40c2-8728-b8d62d6b9b63'),
    ('3b4db45f-3628-4a76-b5b3-6eeb5c6c3ed6', 'https://example.com/data2.csv', 'CSV', '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7');

INSERT INTO outputs (id, run_id, uri) VALUES
    ('b09f6532-cd8d-4c19-a8cf-3a8c762e5264', '21c0eeda-f64f-40c2-8728-b8d62d6b9b63', 'https://example.com/output1.json'),
    ('5de8f8f1-9e45-45f7-a6f2-7f8a3d9d6c7d', '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7', 'https://example.com/output2.json');

