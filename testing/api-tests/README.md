# Forenaide API Test Suite

This repository contains automated tests for the Forenaide API. The tests validate API endpoints while using mocks to avoid requiring a running backend infrastructure during testing.

## Overview

The test suite focuses on testing the application's API client, which handles communication with the backend services. By mocking the API responses, we can test the client functionality without needing actual backend services running.

The API client implementation (`api_client.py`) directly mirrors the actual FastAPI backend implementation, ensuring that tests are validating against the real API structure.

## Structure

```
testing/api-tests/
├── api_client.py        # API client with all endpoint methods (mirrors FastAPI implementation)
├── conftest.py          # Test configuration and fixtures
├── requirements.txt     # Dependencies
├── test_pipeline_api.py # Tests for pipeline endpoints
├── test_source_api.py   # Tests for file upload functionality
└── test_template_api.py # Tests for template endpoints
```

## Setup

1. Install the required dependencies:

```bash
cd testing/api-tests
pip install -r requirements.txt
```

2. Run the tests:

```bash
pytest
```

## Test Categories

The test suite includes:

1. **Unit Tests**: Mock the API responses to test the API client's functionality
2. **Integration Tests**: Optional tests that connect to a running backend (skipped by default)

## API Client Design

The API client implementation directly mirrors the FastAPI backend routes:

- **Template endpoints**: Match `/templates` routes in `backend/api/template/templates.py`
- **Pipeline endpoints**: Match `/pipelines` routes in `backend/api/pipeline/pipelines.py`
- **File Upload endpoints**: Match file upload functionality through FastAPI or Supabase Edge Functions

Each function in the API client corresponds to a specific API endpoint and follows the same parameter structure and response format as defined in the backend's Pydantic models.

## Available Test Cases

### Template API Tests (`test_template_api.py`)

| Test Case | Description |
|-----------|-------------|
| `test_create_template` | Tests creating a new template |
| `test_get_template` | Tests retrieving a specific template by ID |
| `test_update_template` | Tests updating an existing template |
| `test_delete_template` | Tests deleting a template |
| `test_get_templates` | Tests retrieving all templates |
| `test_template_error_handling` | Tests error handling for template operations |
| `test_integration_template_lifecycle` | Integration test for the complete template lifecycle |

### Pipeline API Tests (`test_pipeline_api.py`)

| Test Case | Description |
|-----------|-------------|
| `test_create_pipeline` | Tests creating a new pipeline |
| `test_get_pipeline` | Tests retrieving a specific pipeline by ID |
| `test_update_pipeline` | Tests updating an existing pipeline |
| `test_delete_pipeline` | Tests deleting a pipeline |
| `test_get_pipelines` | Tests retrieving all pipelines |
| `test_get_pipeline_sources` | Tests retrieving sources for a pipeline |
| `test_get_pipeline_outputs` | Tests retrieving outputs for a pipeline |
| `test_pipeline_error_handling` | Tests error handling for pipeline operations |
| `test_integration_pipeline_lifecycle` | Integration test for the complete pipeline lifecycle |

### File Upload Tests (`test_source_api.py`)

| Test Case | Description |
|-----------|-------------|
| `test_integration_file_upload` | Integration test for file uploads through FastAPI and Supabase |

## How It Works

### Mocking

The test suite uses Python's `unittest.mock` to create mock objects that simulate API responses. This is done through the `mock_api_client` fixture in `conftest.py`. The mock responses match the expected format from the FastAPI backend.

Example:
```python
def test_get_template(mock_api_client, sample_template_data):
    template_id = str(uuid4())
    expected_response = {
        "id": template_id,
        **sample_template_data
    }
    mock_api_client.get_template.return_value = expected_response
    
    response = mock_api_client.get_template(template_id)
    
    assert response["id"] == template_id
    assert response["name"] == sample_template_data["name"]
```

### Integration Tests

For testing with an actual backend, there are integration tests that are skipped by default. You can run these tests by using the `--run-integration` flag if you have a backend running at `http://localhost:8000`.

Example:
```bash
pytest --run-integration
```

### Test Data

Sample test data is provided through fixtures in `conftest.py` and matches the structure expected by the backend's Pydantic models:
- `sample_template_data`: Matches the `CreateTemplate` model
- `sample_pipeline_data`: Matches the `CreatePipelineRun` model

## Running Specific Tests

You can run specific test files or test cases:

```bash
# Run only template tests
pytest test_template_api.py

# Run a specific test case
pytest test_pipeline_api.py::test_pipeline_lifecycle_with_mocks

# Run with verbose output
pytest -v

# Run integration tests
pytest --run-integration
```

## Troubleshooting

1. **Test failures due to assertion errors**: Check that the mock responses match what's expected from the FastAPI implementation

2. **"ModuleNotFoundError"**: Make sure you've installed all dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. **Integration test failures**: Check that the backend server is running at `http://localhost:8000` if using `--run-integration`

4. **Endpoint URL mismatches**: If the FastAPI routes change, update the corresponding endpoints in `api_client.py`

5. **File upload issues**: For file upload tests, ensure the test PDF file exists in the test directory 