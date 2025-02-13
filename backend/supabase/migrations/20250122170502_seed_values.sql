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
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669',
    'pdf_image_openai',
    'PDF Image OpenAI',
    'Strategy for extracting images from PDF using OpenAI'
  ),
  (
    'c6f9a84c-7585-4ea0-bfbc-b4f8ce0b17e1',
    'pdf_text_openai',
    'PDF Text OpenAI',
    'Strategy for extracting text from PDF using OpenAI'
  ),
  (
    '07af897d-d896-49a8-82b4-015e88769b08',
    'office_image_openai',
    'Office Image OpenAI',
    'Strategy for extracting images from Office documents using OpenAI'
  ),
  (
    '07af897d-d896-49a8-82b4-015e88769b09',
    'office_text_openai',
    'Office Text OpenAI',
    'Strategy for extracting text from Office documents using OpenAI'
  ),
  (
    '174b899d-e039-428f-8cfe-baaa43569f12',
    'image_image_openai',
    'Image Image OpenAI',
    'Strategy for extracting images from images using OpenAI'
  ),
  (
    'eb45591d-7bad-4e46-b09c-9059f7c78611',
    'image_text_openai',
    'Image Text OpenAI',
    'Strategy for extracting text from images using OpenAI'
  ),
  (
    '85c44ca0-bd3c-462a-83ce-fa5c2880ca96',
    'pdf_image_anthropic',
    'PDF Image Anthropic',
    'Strategy for extracting images from PDF using Anthropic'
  ),
  (
    'a9f9e4c6-d4e6-4e97-8e41-40bb18530253',
    'pdf_text_anthropic',
    'PDF Text Anthropic',
    'Strategy for extracting text from PDF using Anthropic'
  ),
  (
    '25f27cf2-b474-4e63-b887-8b4293376ac8',
    'office_image_anthropic',
    'Office Image Anthropic',
    'Strategy for extracting images from Office documents using Anthropic'
  ),
  (
    '0a1b2c3d-4e5f-6789-0abc-def123456789',
    'office_text_anthropic',
    'Office Text Anthropic',
    'Strategy for extracting text from Office documents using Anthropic'
  ),
  (
    '1a2b3c4d-5e6f-7890-1abc-def234567890',
    'image_image_anthropic',
    'Image Image Anthropic',
    'Strategy for extracting images from images using Anthropic'
  ),
  (
    '2a3b4c5d-6e7f-8901-2abc-def345678901',
    'image_text_anthropic',
    'Image Text Anthropic',
    'Strategy for extracting text from images using Anthropic'
  ),
  (
    '3a4b5c6d-7e8f-9012-3abc-def456789012',
    'pdf_text_ollama',
    'PDF Text Ollama',
    'Strategy for extracting text from PDF using Ollama'
  ),
  (
    '4a5b6c7d-8e9f-0123-4abc-def567890123',
    'office_text_ollama',
    'Office Text Ollama',
    'Strategy for extracting text from Office documents using Ollama'
  ),
  (
    '5a6b7c8d-9e0f-1234-5abc-def678901234',
    'image_text_ollama',
    'Image Text Ollama',
    'Strategy for extracting text from images using Ollama'
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
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669',
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
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669',
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
  sources_pipeline (pipeline_id, source_id)
VALUES
  (
    '21c0eeda-f64f-40c2-8728-b8d62d6b9b63',
    'e784ff29-6d11-4b6f-9b3d-8d8a8e1e2f17'
  ),
  (
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
