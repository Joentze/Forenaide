"""
Test suite for pipeline run routes
"""

from fastapi.testclient import TestClient
import pytest
from uuid import UUID
from classes.classes import (
    CreatePipelineRun,
    PipelineRunResponse,
    UpdatePipelineRun,
    PipelineStatus
)


@pytest.fixture
def create_pipeline_run_data():
    """
    Fixture for creating a pipeline run
    """
    return CreatePipelineRun(
        name="Example Pipeline Run",
        description="This is an example pipeline run.",
        strategy_id=UUID("15f2a8c5-72bf-4c08-84c8-252b576ad144"),
        extraction_schema={"key": "value"},
        file_uris=["https://example.com/file1.txt",
                   "https://example.com/file2.txt"]
    )


@pytest.fixture
def update_pipeline_run_data():
    """
    Fixture for updating a pipeline run
    """
    return UpdatePipelineRun(
        status=PipelineStatus.COMPLETED,
        completed_at="2023-10-01T12:00:00Z"
    )


created_pipeline_id = None


class TestPipelineRunRoutes:
    """
    Tests for pipeline run routes
    """
    route = "/api/pipelines"

    def test_create_pipeline_run(self, api_client: TestClient, create_pipeline_run_data):
        """
        Test the creation of a pipeline run.
        """
        response = api_client.post(url=f"{self.route}/",
                                   json=create_pipeline_run_data.model_dump(mode="json"))

        assert response.status_code == 201
        assert PipelineRunResponse.model_validate(response.json())
        global created_pipeline_id
        created_pipeline_id = response.json()["id"]

    def test_read_pipeline_run(self, api_client: TestClient):
        """
        Test reading a specific pipeline run by ID.
        """
        response = api_client.get(url=f"{self.route}/{created_pipeline_id}")
        assert response.status_code == 200
        assert "id" in response.json()

    def test_read_pipeline_runs(self, api_client: TestClient):
        """
        Test reading all pipeline runs.
        """
        response = api_client.get(url=f"{self.route}/")
        assert response.status_code == 200
        for run in response.json():
            assert PipelineRunResponse.model_validate(run)

    def test_update_pipeline_run(self, api_client: TestClient, update_pipeline_run_data):
        """
        Test updating a specific pipeline run by ID.
        """
        response = api_client.put(url=f"{self.route}/{created_pipeline_id}",
                                  json=update_pipeline_run_data.model_dump(mode="json"))
        assert response.status_code == 201
        assert response.json()["status"] == PipelineStatus.COMPLETED.value

    def test_delete_pipeline_run(self, api_client: TestClient):
        """
        Test deleting a specific pipeline run by ID.
        """
        response = api_client.delete(url=f"{self.route}/{created_pipeline_id}")
        assert response.status_code == 204
