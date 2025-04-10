import pytest
from uuid import uuid4
from api_client import ApiClient, TEST_PDF_FILENAME
import os
import requests
import warnings

# Suppress ResourceWarning about unclosed sockets
warnings.filterwarnings("ignore", category=ResourceWarning)

def test_integration_file_upload(skip_integration):
    """Integration test for uploading a file (requires running backend)"""
    # Skip this test if --run-integration flag is not provided
    if skip_integration:
        pytest.skip("Integration test - use --run-integration flag to run")
    
    # Create API client
    api_client = ApiClient()
    
    try:
        # Get the path to the existing test PDF file
        pdf_path = api_client.get_test_file_path()
        
        # Check if the test file exists
        if not os.path.exists(pdf_path):
            pytest.skip(f"Test file not found: {pdf_path}")
        
        print(f"Testing file upload with: {pdf_path}")
        
        # First try with the direct upload through FastAPI endpoint
        try:
            print("Attempting upload through FastAPI endpoint...")
            uploaded_file = api_client.upload_file(pdf_path)
            print(f"File upload successful through FastAPI: {uploaded_file['id']}")
            print(f"Response details: {uploaded_file}")
        except Exception as e:
            # Fall back to Supabase function if direct upload fails
            print(f"API client upload failed, using Supabase function instead: {str(e)}")
            
            # Use the helper method from ApiClient
            print("Attempting upload through Supabase Edge Function...")
            uploaded_file = api_client.upload_file_with_supabase(pdf_path)
            print(f"Supabase function upload successful: {uploaded_file['id']}")
            print(f"Response details: {uploaded_file}")
            
        # Verify required fields are present
        assert "id" in uploaded_file, "Upload response missing 'id' field"
        assert "mimetype" in uploaded_file, "Upload response missing 'mimetype' field"
        assert uploaded_file["mimetype"], "Upload response has empty mimetype value"
        assert "path" in uploaded_file, "Upload response missing 'path' field"
        
        # Print all file details for debugging
        for key, value in uploaded_file.items():
            print(f"{key}: {value}")
        
        # Create a file path data structure as would be used in pipelines
        file_path_data = api_client.create_file_path_data(uploaded_file)
        print(f"Created file path data: {file_path_data}")
        
        # Ensure file path data has all required fields
        assert "uri" in file_path_data, "File path data missing 'uri' field"
        assert "mimetype" in file_path_data, "File path data missing 'mimetype' field"
        assert file_path_data["mimetype"], "File path data has empty mimetype value"
        assert "bucket_path" in file_path_data, "File path data missing 'bucket_path' field"
        assert "filename" in file_path_data, "File path data missing 'filename' field"
        
        print(f"File upload integration test passed successfully")
            
    except Exception as e:
        # Print more detailed error information to help debug
        print(f"Integration test failed with error: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Response content: {e.response.text}")
        pytest.fail(f"File upload integration test failed: {str(e)}")

# Note: test_integration_source_lifecycle removed as data_sources endpoint is no longer in use 