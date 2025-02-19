"""
Test suite for template routes
"""

from fastapi.testclient import TestClient
import pytest
from classes.classes import CreateTemplate, UpdateTemplate, TemplateResponse


@pytest.fixture
def create_template_data():
    """
    Fixture for creating a template
    """
    return CreateTemplate(
        name="Example Template",
        description="This is an example template.",
        extraction_schema={"key": "value"}
    )


@pytest.fixture
def update_template_data():
    """
    Fixture for updating a template
    """
    return UpdateTemplate(
        name="Updated Template",
        description="This is an updated template.",
        extraction_schema={"key": "new_value"}
    )


created_template_id = None


class TestTemplateRoutes:
    """
    Tests for template routes
    """
    route = "/api/templates"

    def test_create_template(self, api_client: TestClient, create_template_data):
        """
        Test the creation of a template.
        """
        response = api_client.post(url=f"{self.route}/",
                                   json=create_template_data.dict())

        assert response.status_code == 201
        assert TemplateResponse(**response.json())
        global created_template_id
        created_template_id = response.json()["id"]

    def test_read_template(self, api_client: TestClient):
        """
        Test reading a specific template by ID.
        """
        response = api_client.get(url=f"{self.route}/{created_template_id}")
        assert response.status_code == 200
        assert "id" in response.json()

    def test_read_templates(self, api_client: TestClient):
        """
        Test reading all templates.
        """
        response = api_client.get(url=f"{self.route}/")
        assert response.status_code == 200
        for template in response.json():
            assert TemplateResponse(**template)

    def test_update_template(self, api_client: TestClient, update_template_data):
        """
        Test updating a specific template by ID.
        """
        response = api_client.put(url=f"{self.route}/{created_template_id}",
                                  json=update_template_data.dict())
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Template"

    def test_delete_template(self, api_client: TestClient):
        """
        Test deleting a specific template by ID.
        """
        response = api_client.delete(url=f"{self.route}/{created_template_id}")
        assert response.status_code == 204
