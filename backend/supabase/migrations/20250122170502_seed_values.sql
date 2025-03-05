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
    '7879c987-1280-48a7-a9a6-21192552d704',
    'Shareholder template',
    'Extracting shareholder information from an uploaded document',
    '{"fields": [
        {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity, found only in the shareholders table and no where else. Do not include the entity that issued these shares"},
        {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"},
        {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"},
        {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"},
        {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"},
        {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"},
        {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"},
        {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table and no where else"}
    ]}', 
    current_timestamp
),
(
    'c4a8f4c1-3e8d-41a7-94dc-3c645d1f1c34',
    'Company Information Template',
    'Template for extracting company information',
    '{"fields":[
        {"name":"Date of request","type":"string","description":"date of request found in request criteria table"},
        {"name":"Name of requestor","type":"string","description":"name of requestor of this investigation, found in request criteria table"},
        {"name":"Requested Entity Name","type":"string","description":"name of the entity found in request criteria table"},
        {"name":"Requested Entity Number","type":"string","description":"entity number of the requested entity, found in request criteria table"},
        {"name":"Principal activity","type":"string","description":"principal activity of the company"}
    ]}',
    current_timestamp
);

-- Insert mock data for strategies
INSERT INTO
strategies (id, strategy, name, description)
VALUES
(
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669',
    'file_image_openai',
    'File Image OpenAI',
    'Strategy for extracting structured data from images of files using OpenAI'
);

-- (
    --   'c6f9a84c-7585-4ea0-bfbc-b4f8ce0b17e1',
    --   'file_text_openai',
    --   'File Text OpenAI',
    --   'Strategy for extracting structured data from text of images of files using OpenAI'
    -- ),
-- (
    --   '07af897d-d896-49a8-82b4-015e88769b08',
    --   'file_text_ollama',
    --   'Office Image OpenAI',
    --   'Strategy for extracting structured data from text of images of files using Ollama'
    -- );

-- Insert mock data for pipeline_runs
INSERT INTO "public"."pipeline_runs" (
    "id",
    "name",
    "description",
    "strategy_id",
    "extraction_schema",
    "status",
    "started_at",
    "completed_at",
    "file_paths",
    "messages"
) VALUES 
(
    '8c100f8d-e363-4fd8-982a-cea1dde3c418',
    'ralien_pred',
    'Pipeline description',
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669', 
    '{
        "extraction_config": {
            "name":"extraction_tool",
            "description":"extract the relevant fields for documents",
            "schema":[
                {"name":"Requested Entity Name", "type":"string", "description":"Name of the requested entity in the business profile"},
                {"name":"Entity Number","type":"string","description":"Entity number of the requested entity"},
                {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity"},
                {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"}
            ]
        }
    }', 
    'completed',
    '2025-03-04 15:22:36.534099',
    '2025-03-04 15:22:36.534099',
    '[{
        "uri":"http://host.docker.internal:54321/storage/v1/object/public/sources/f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf?",
        "mimetype":"application/pdf",
        "bucket_path":"f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf",
        "filename":"RALIEN BIOTECH PTE. LTD..pdf"
    }]', 
    NULL
), (
    '9c3b6b07-422b-4539-a5e2-5f1ad5788745',
    'ralien trial 1',
    'Pipeline description',
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669', 
    '{
        "extraction_config": {
            "name":"extraction_tool",
            "description":"extract the relevant fields for documents",
            "schema":[
                {"name":"Requested Entity Name", "type":"string", "description":"Name of the requested entity in the business profile"},
                {"name":"Entity Number","type":"string","description":"Entity number of the requested entity"},
                {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity"},
                {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"}
            ]
        }
    }', 
    'completed',
    '2025-03-03 12:17:37.534099',
    '2025-03-03 12:17:37.534099',
    '[{
        "uri":"http://host.docker.internal:54321/storage/v1/object/public/sources/f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf?",
        "mimetype":"application/pdf",
        "bucket_path":"f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf",
        "filename":"RALIEN BIOTECH PTE. LTD..pdf"
    }]', 
    NULL
), (
    'b9f9f13c-4a01-436b-8df5-723c0bae233c',
    'ABTERRA',
    'Pipeline description',
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669', 
    '{
        "extraction_config": {
            "name":"extraction_tool",
            "description":"extract the relevant fields for documents",
            "schema":[
                {"name":"Requested Entity Name", "type":"string", "description":"Name of the requested entity in the business profile"},
                {"name":"Entity Number","type":"string","description":"Entity number of the requested entity"},
                {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity"},
                {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"}
            ]
        }
    }', 
    'completed',
    '2025-03-03 14:24:31.534099',
    '2025-03-03 14:24:31.534099',
    '[{
        "uri":"http://host.docker.internal:54321/storage/v1/object/public/sources/f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf?",
        "mimetype":"application/pdf",
        "bucket_path":"f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf",
        "filename":"ABTERRA BIOTECH PTE. LTD..pdf"
    }]', 
    NULL
), (
    '00146344-61be-4956-aa8f-fc4af59183ff',
    'Inter Pacific 01',
    'Pipeline description',
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669', 
    '{
        "extraction_config": {
            "name":"extraction_tool",
            "description":"extract the relevant fields for documents",
            "schema":[
                {"name":"Requested Entity Name", "type":"string", "description":"Name of the requested entity in the business profile"},
                {"name":"Entity Number","type":"string","description":"Entity number of the requested entity"},
                {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity"},
                {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"}
            ]
        }
    }', 
    'completed',
    '2025-03-03 14:34:12.534099',
    '2025-03-03 14:34:12.534099',
    '[{
        "uri":"http://host.docker.internal:54321/storage/v1/object/public/sources/f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf?",
        "mimetype":"application/pdf",
        "bucket_path":"f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf",
        "filename":"INTER-PACIFIC PETROLEUM  PTE. LTD"
    }]', 
    NULL
), (
    '2c1aa429-f381-49a7-aa92-b8928fbe5277',
    'Inter Pacific 02',
    'Pipeline description',
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669', 
    '{
        "extraction_config": {
            "name":"extraction_tool",
            "description":"extract the relevant fields for documents",
            "schema":[
                {"name":"Requested Entity Name", "type":"string", "description":"Name of the requested entity in the business profile"},
                {"name":"Entity Number","type":"string","description":"Entity number of the requested entity"},
                {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity"},
                {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"}
            ]
        }
    }', 
    'completed',
    '2025-03-03 14:36:58.534099',
    '2025-03-03 14:36:58.534099',
    '[{
        "uri":"http://host.docker.internal:54321/storage/v1/object/public/sources/f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf?",
        "mimetype":"application/pdf",
        "bucket_path":"f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf",
        "filename":"INTER-PACIFIC PETROLEUM  PTE. LTD"
    }]', 
    NULL
), (
    '7d23637e-de6f-4aaf-a645-fb06711e7975',
    'Inter Pacific 03',
    'Pipeline description',
    '86a1b98b-b3fe-4f92-96e2-0fbe141fe669', 
    '{
        "extraction_config": {
            "name":"extraction_tool",
            "description":"extract the relevant fields for documents",
            "schema":[
                {"name":"Requested Entity Name", "type":"string", "description":"Name of the requested entity in the business profile"},
                {"name":"Entity Number","type":"string","description":"Entity number of the requested entity"},
                {"name":"Name of shareholder","type":"string","description":"Names of shareholder that is holding shares of the requested entity"},
                {"name":"Shareholder ID","type":"string","description":"ID of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Shareholder Address","type":"string","description":"Address of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Date of Change of Address","type":"string","description":"Date of change of address for the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Nationality/Citizenship","type":"string","description":"Citizenship of corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Share Type","type":"string","description":"Type of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"No of Shares","type":"integer","description":"Number of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"},
                {"name":"Currency","type":"string","description":"Currency of shares that are being held by the corresponding shareholder that is holding shares of the requested entity, found in the shareholders table"}
            ]
        }
    }', 
    'completed',
    '2025-03-03 14:39:13.534099',
    '2025-03-03 14:39:13.534099',
    '[{
        "uri":"http://host.docker.internal:54321/storage/v1/object/public/sources/f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf?",
        "mimetype":"application/pdf",
        "bucket_path":"f11f5e61-0726-4081-91c6-d39113a3aac6/RALIEN BIOTECH PTE. LTD..pdf",
        "filename":"INTER-PACIFIC PETROLEUM  PTE. LTD"
    }]', 
    NULL
);

-- -- Insert mock data for data_sources
-- INSERT INTO
--   data_sources (id, uri, mimetype, filename)
-- VALUES
--   (
    --     'e784ff29-6d11-4b6f-9b3d-8d8a8e1e2f17',
    --     'https://example.com/data1.json',
    --     'JSON',
    --     'data1.json'
    --   ),
--   (
    --     '3b4db45f-3628-4a76-b5b3-6eeb5c6c3ed6',
    --     'https://example.com/data2.csv',
    --     'CSV',
    --     'data2.csv'
    --   );
-- Insert mock data for sources_pipeline
-- INSERT INTO
--   sources_pipeline (id, pipeline_id, source_id)
-- VALUES
--   (
    --     '8b1e9f19-3b2c-4a64-8c5f-5bfa8f34a7b8',
    --     '21c0eeda-f64f-40c2-8728-b8d62d6b9b63',
    --     'e784ff29-6d11-4b6f-9b3d-8d8a8e1e2f17'
    --   ),
--   (
    --     '6f8c7e29-3b5f-4567-8b2c-5cf4b6c9d1e7',
    --     '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7',
    --     '3b4db45f-3628-4a76-b5b3-6eeb5c6c3ed6'
    --   );

-- -- Insert mock data for outputs
-- INSERT INTO
--   outputs (id, pipeline_id, uri)
-- VALUES
--   (
    --     'b09f6532-cd8d-4c19-a8cf-3a8c762e5264',
    --     '21c0eeda-f64f-40c2-8728-b8d62d6b9b63',
    --     'https://example.com/output1.json'
    --   ),
--   (
    --     '5de8f8f1-9e45-45f7-a6f2-7f8a3d9d6c7d',
    --     '3642fbc9-e3b1-41d3-bde8-6c6d521f75d7',
    --     'https://example.com/output2.json'
    --   );
