import requests
from typing import Dict, Any, List, Optional, Union
from uuid import UUID
import os

# Centralized configuration constants
BASE_URL = "http://127.0.0.1:8000"
SUPABASE_URL = "http://127.0.0.1:54321"
SUPABASE_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1"
SUPABASE_FILE_UPLOAD_ENDPOINT = f"{SUPABASE_FUNCTION_URL}/upload-file-as-pdf"

# Common test data
TEST_STRATEGY_ID = "86a1b98b-b3fe-4f92-96e2-0fbe141fe668"
TEST_PDF_FILENAME = "TEST_PDF_FOR_FORENAIDE.pdf"
TEST_PDF_MIMETYPE = "application/pdf"

# API status values
PIPELINE_STATUS = {
    "NOT_STARTED": "not_started",
    "PROCESSING": "processing",
    "COMPLETED": "completed",
    "FAILED": "failed"
}


class ApiClient:
    """API client for interacting with the backend API that mirrors the FastAPI implementation"""

    def __init__(self, base_url: str = BASE_URL, supabase_url: str = SUPABASE_URL):
        self.base_url = base_url
        self.supabase_url = supabase_url
        self.supabase_function_url = f"{supabase_url}/functions/v1"
        self.file_upload_endpoint = f"{self.supabase_function_url}/upload-file-as-pdf"
        self.session = requests.Session()
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    # Template endpoints (matching backend/api/template/templates.py)
    def create_template(self, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new template
        
        Parameters:
        - template_data: Dict with keys name, description, and schema
        """
        response = self.session.post(
            f"{self.base_url}/templates",
            json=template_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_template(self, template_id: Union[str, UUID]) -> Dict[str, Any]:
        """
        Get a specific template by ID
        
        Parameters:
        - template_id: UUID of the template
        """
        if isinstance(template_id, UUID):
            template_id = str(template_id)
            
        response = self.session.get(
            f"{self.base_url}/templates/{template_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def update_template(self, template_id: Union[str, UUID], template_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a template
        
        Parameters:
        - template_id: UUID of the template
        - template_data: Dict with updated template data
        """
        if isinstance(template_id, UUID):
            template_id = str(template_id)
            
        response = self.session.put(
            f"{self.base_url}/templates/{template_id}",
            json=template_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def delete_template(self, template_id: Union[str, UUID]) -> None:
        """
        Delete a template
        
        Parameters:
        - template_id: UUID of the template
        """
        if isinstance(template_id, UUID):
            template_id = str(template_id)
            
        response = self.session.delete(
            f"{self.base_url}/templates/{template_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return None

    def get_templates(self) -> List[Dict[str, Any]]:
        """Get all templates"""
        response = self.session.get(
            f"{self.base_url}/templates",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # Pipeline endpoints (matching backend/api/pipeline/pipelines.py)
    def create_pipeline(self, pipeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new pipeline
        
        Parameters:
        - pipeline_data: Dict with pipeline data including:
          - name: str
          - description: str
          - strategy_id: UUID
          - schema: Dict
          - fields: List[Dict]
          - file_paths: List[Dict] with uri, mimetype, bucket_path, filename
        """
        response = self.session.post(
            f"{self.base_url}/pipelines",
            json=pipeline_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_pipeline(self, pipeline_id: Union[str, UUID]) -> Dict[str, Any]:
        """
        Get a specific pipeline by ID
        
        Parameters:
        - pipeline_id: UUID of the pipeline
        """
        if isinstance(pipeline_id, UUID):
            pipeline_id = str(pipeline_id)
            
        response = self.session.get(
            f"{self.base_url}/pipelines/{pipeline_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def update_pipeline(self, pipeline_id: Union[str, UUID], pipeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a pipeline
        
        Parameters:
        - pipeline_id: UUID of the pipeline
        - pipeline_data: Dict with status and completed_at
        """
        if isinstance(pipeline_id, UUID):
            pipeline_id = str(pipeline_id)
            
        response = self.session.put(
            f"{self.base_url}/pipelines/{pipeline_id}",
            json=pipeline_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def delete_pipeline(self, pipeline_id: Union[str, UUID]) -> None:
        """
        Delete a pipeline
        
        Parameters:
        - pipeline_id: UUID of the pipeline
        """
        if isinstance(pipeline_id, UUID):
            pipeline_id = str(pipeline_id)
            
        response = self.session.delete(
            f"{self.base_url}/pipelines/{pipeline_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return None

    def get_pipelines(self) -> List[Dict[str, Any]]:
        """Get all pipelines"""
        response = self.session.get(
            f"{self.base_url}/pipelines",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_pipeline_sources(self, pipeline_id: Union[str, UUID]) -> Dict[str, Any]:
        """
        Get sources for a pipeline
        
        Parameters:
        - pipeline_id: UUID of the pipeline
        
        Returns:
        - Dict with pipeline_id and source_ids
        """
        if isinstance(pipeline_id, UUID):
            pipeline_id = str(pipeline_id)
            
        response = self.session.get(
            f"{self.base_url}/pipelines/sources/{pipeline_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_pipeline_outputs(self, pipeline_id: Union[str, UUID]) -> Dict[str, Any]:
        """
        Get outputs for a pipeline
        
        Parameters:
        - pipeline_id: UUID of the pipeline
        
        Returns:
        - Dict with pipeline and outputs
        """
        if isinstance(pipeline_id, UUID):
            pipeline_id = str(pipeline_id)
            
        response = self.session.get(
            f"{self.base_url}/pipelines/outputs/{pipeline_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def upload_file(self, file_path: str, file_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a file as a source (matching the /data_sources/upload endpoint)
        
        Parameters:
        - file_path: Path to the file to upload
        - file_name: Optional name to use instead of the file's name
        
        Returns:
        - Dict with id, filename, mimetype, path, and url
        """
        with open(file_path, "rb") as f:
            file_name = file_name or os.path.basename(file_path)
            files = {"file": (file_name, f)}
            response = self.session.post(
                f"{self.base_url}/data_sources/upload",
                files=files
            )
        response.raise_for_status()
        return response.json()

    # Utility methods for common operations
    def get_test_file_path(self, filename: str = TEST_PDF_FILENAME) -> str:
        """Get the absolute path to a test file in the same directory as the tests"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)

    def upload_file_with_supabase(self, file_path: str, file_name: Optional[str] = None) -> Dict[str, Any]:
        """Upload a file using the Supabase Edge Function"""
        if file_name is None:
            file_name = os.path.basename(file_path)
            
        with open(file_path, 'rb') as file:
            # Make sure to explicitly set the mimetype in both the files and form data
            mimetype = TEST_PDF_MIMETYPE
            files = {'file': (file_name, file, mimetype)}
            
            # Add mimetype as a form field as well to ensure it's captured
            data = {'mimetype': mimetype}
            
            response = self.session.post(
                self.file_upload_endpoint, 
                files=files, 
                data=data,
                timeout=10
            )
            response.raise_for_status()
            
            # Parse the response
            result = response.json()
            
            # Ensure mimetype is included in the result
            if 'mimetype' not in result or not result['mimetype']:
                result['mimetype'] = mimetype
                
            return result

    def create_minimal_pipeline_data(self, file_path_data: Dict[str, Any], strategy_id: str = TEST_STRATEGY_ID) -> Dict[str, Any]:
        """Create minimal pipeline data structure with the given file path"""
        return {
            "name": "Test Pipeline",
            "description": "Pipeline created by automated tests",
            "strategy_id": strategy_id,
            "schema": {"fields": []},
            "fields": [],
            "status": PIPELINE_STATUS["NOT_STARTED"],
            "file_paths": [file_path_data]
        }

    def create_file_path_data(self, uploaded_file: Dict[str, Any]) -> Dict[str, Any]:
        """Create file path data structure from uploaded file response"""
        # Ensure we have a valid mimetype
        mimetype = uploaded_file.get("mimetype")
        if not mimetype:
            mimetype = TEST_PDF_MIMETYPE
            
        # Get the bucket path, preferring 'path' but falling back to other options
        bucket_path = uploaded_file.get("path")
        if not bucket_path and "id" in uploaded_file:
            # Construct a path from the id and filename if available
            filename = uploaded_file.get("filename", TEST_PDF_FILENAME)
            bucket_path = f"{uploaded_file['id']}/{filename}"
            
        # Make sure we have a filename
        filename = uploaded_file.get("filename")
        if not filename and bucket_path:
            # Extract filename from bucket_path if possible
            filename = bucket_path.split("/")[-1]
        elif not filename:
            filename = TEST_PDF_FILENAME
            
        # Get URL or construct a default one
        uri = uploaded_file.get("url", "")
        if not uri and "id" in uploaded_file:
            # Construct a default URL pattern based on id
            uri = f"{self.supabase_url}/storage/v1/object/public/sources/{uploaded_file['id']}/{filename}"
            
        # Ensure we have a size or default to 0
        size = uploaded_file.get("size", 0)
        if size is None:
            size = 0
            
        return {
            "uri": uri,
            "mimetype": mimetype,
            "bucket_path": bucket_path,
            "filename": filename,
            "size": size
        }

    def check_backend_available(self, timeout=3):
        """Check if the backend is available by making a request to an endpoint that should exist"""
        # Try a couple of different endpoints that should exist
        for endpoint in ['/pipelines', '/templates']:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=timeout)
                if response.ok:
                    return True
            except Exception:
                # Continue to the next endpoint if this one fails
                continue
        
        # Try a simple OPTIONS request to the base URL as a last resort
        try:
            response = self.session.options(self.base_url, timeout=timeout)
            return response.status_code < 500  # Consider server accessible even if 404 is returned
        except Exception:
            return False 