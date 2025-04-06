import pytest
import _pytest.skipping
from unittest.mock import MagicMock, patch
from uuid import uuid4
from typing import Dict, Any, List, Optional
from api_client import ApiClient

def pytest_addoption(parser):
    """Add command line options to pytest"""
    parser.addoption(
        "--run-integration",
        action="store_true",
        default=False,
        help="Run integration tests that require a running backend"
    )

@pytest.fixture
def skip_integration(request):
    """Fixture to determine whether to skip integration tests"""
    return not request.config.getoption("--run-integration")

@pytest.fixture
def api_client():
    """Fixture to provide the API client with mocked methods"""
    client = ApiClient()
    yield client

@pytest.fixture
def mock_api_client():
    """Fixture to provide a fully mocked API client"""
    with patch('api_client.ApiClient', autospec=True) as mock:
        instance = mock.return_value
        # Template methods
        instance.create_template = MagicMock()
        instance.get_template = MagicMock()
        instance.update_template = MagicMock()
        instance.delete_template = MagicMock()
        instance.get_templates = MagicMock()
        
        # Pipeline methods
        instance.create_pipeline = MagicMock()
        instance.get_pipeline = MagicMock()
        instance.update_pipeline = MagicMock()
        instance.delete_pipeline = MagicMock() 
        instance.get_pipelines = MagicMock()
        instance.get_pipeline_sources = MagicMock()
        instance.get_pipeline_outputs = MagicMock()
        
        # Source methods
        instance.create_source = MagicMock()
        instance.get_source = MagicMock()
        instance.delete_source = MagicMock()
        instance.get_sources = MagicMock()
        instance.upload_file = MagicMock()
        
        yield instance

@pytest.fixture
def mock_response():
    """Fixture to create a mock response object"""
    def create_mock_response(status_code: int, json_data: Dict[str, Any] = None):
        mock = MagicMock()
        mock.status_code = status_code
        mock.json.return_value = json_data or {}
        return mock
    return create_mock_response

@pytest.fixture
def sample_template_data():
    """Fixture to provide sample template data"""
    return {
        "name": "Test Template",
        "description": "A test template",
        "schema": {
            "fields": [
                {
                    "name": "field1",
                    "type": "string",
                    "description": "Test field 1"
                }
            ]
        }
    }

@pytest.fixture
def sample_pipeline_data():
    """Fixture to provide sample pipeline data"""
    return {
        "name": "Test Pipeline",
        "description": "A test pipeline",
        "strategy_id": str(uuid4()),
        "schema": {
            "fields": [
                {
                    "name": "field1",
                    "type": "string",
                    "description": "Test field 1"
                }
            ]
        }
    }

@pytest.fixture
def sample_source_data():
    """Fixture to provide sample source data"""
    return {
        "path": "/test/path",
        "mimetype": "application/pdf",
        "filename": "test.pdf"
    }

@pytest.fixture
def mock_requests():
    """Fixture to mock requests library"""
    with patch('requests.Session.request') as mock:
        yield mock 