import pytest
from unittest.mock import patch
from uuid import uuid4
from api_client import ApiClient
from datetime import datetime

def test_create_template(mock_api_client, sample_template_data):
    """Test creating a new template"""
    template_id = str(uuid4())
    expected_response = {
        "id": template_id,
        **sample_template_data
    }
    mock_api_client.create_template.return_value = expected_response
    
    # Call the API function
    response = mock_api_client.create_template(sample_template_data)
    
    # Verify the response
    assert response["id"] == template_id
    assert response["name"] == sample_template_data["name"]
    assert response["description"] == sample_template_data["description"]
    mock_api_client.create_template.assert_called_once_with(sample_template_data)

def test_get_template(mock_api_client, sample_template_data):
    """Test getting a template"""
    template_id = str(uuid4())
    expected_response = {
        "id": template_id,
        **sample_template_data
    }
    mock_api_client.get_template.return_value = expected_response
    
    # Call the API function
    response = mock_api_client.get_template(template_id)
    
    # Verify the response
    assert response["id"] == template_id
    assert response["name"] == sample_template_data["name"]
    assert response["description"] == sample_template_data["description"]
    mock_api_client.get_template.assert_called_once_with(template_id)

def test_update_template(mock_api_client, sample_template_data):
    """Test updating a template"""
    template_id = str(uuid4())
    updated_data = {
        **sample_template_data,
        "name": "Updated Template"
    }
    expected_response = {
        "id": template_id,
        **updated_data
    }
    mock_api_client.update_template.return_value = expected_response
    
    # Call the API function
    response = mock_api_client.update_template(template_id, updated_data)
    
    # Verify the response
    assert response["id"] == template_id
    assert response["name"] == "Updated Template"
    mock_api_client.update_template.assert_called_once_with(template_id, updated_data)

def test_delete_template(mock_api_client):
    """Test deleting a template"""
    template_id = str(uuid4())
    mock_api_client.delete_template.return_value = None
    
    # Call the API function
    response = mock_api_client.delete_template(template_id)
    
    # Verify the response
    assert response is None
    mock_api_client.delete_template.assert_called_once_with(template_id)

def test_get_templates(mock_api_client, sample_template_data):
    """Test getting all templates"""
    template_id = str(uuid4())
    expected_response = [{
        "id": template_id,
        **sample_template_data
    }]
    mock_api_client.get_templates.return_value = expected_response
    
    # Call the API function
    response = mock_api_client.get_templates()
    
    # Verify the response
    assert len(response) == 1
    assert response[0]["id"] == template_id
    assert response[0]["name"] == sample_template_data["name"]
    mock_api_client.get_templates.assert_called_once()

def test_template_error_handling(mock_api_client):
    """Test error handling for template API functions"""
    template_id = str(uuid4())
    
    # Test not found error
    mock_api_client.get_template.side_effect = Exception("Not found")
    
    with pytest.raises(Exception) as exc_info:
        mock_api_client.get_template(template_id)
    
    assert "Not found" in str(exc_info.value)
    mock_api_client.get_template.assert_called_once_with(template_id)

def test_integration_template_lifecycle(skip_integration):
    """Integration test for the full template lifecycle (requires running backend)"""
    # Skip this test if --run-integration flag is not provided
    if skip_integration:
        pytest.skip("Integration test - use --run-integration flag to run")
    
    api_client = ApiClient()
    template_data = {
        "name": "Integration Test Template",
        "description": "A template created during integration testing",
        "schema": {
            "fields": [
                {
                    "name": "field1",
                    "type": "string",
                    "description": "Test field 1"
                }
            ]
        }
        # CreateTemplate doesn't need last_updated_at
    }
    
    try:
        # 1. Create a template
        created_template = api_client.create_template(template_data)
        assert created_template["name"] == template_data["name"]
        template_id = created_template["id"]
        
        # 2. Get the template
        retrieved_template = api_client.get_template(template_id)
        assert retrieved_template["id"] == template_id
        assert retrieved_template["name"] == template_data["name"]
        
        # 3. Update the template - make sure to include all required fields
        # Format the current date as an ISO string since that's what the model expects
        current_date = datetime.now().isoformat()
        updated_data = {
            **template_data,
            "name": "Updated Integration Test Template",
            "last_updated_at": current_date  # String format required by UpdateTemplate model
        }
        updated_template = api_client.update_template(template_id, updated_data)
        assert updated_template["name"] == "Updated Integration Test Template"
        
        # 4. Get all templates and check if our template is there
        all_templates = api_client.get_templates()
        template_ids = [t["id"] for t in all_templates]
        assert template_id in template_ids
        
        # 5. Delete the template
        api_client.delete_template(template_id)
        
        # 6. Verify it's gone (this should raise an exception)
        with pytest.raises(Exception):
            api_client.get_template(template_id)
    except Exception as e:
        # Print more detailed error information to help debug
        print(f"Integration test failed with error: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Response content: {e.response.text}")
        raise 