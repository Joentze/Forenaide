import io
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from deps import SBaseDeps
import dotenv
import time

router = APIRouter(prefix="/outputs", tags=["Outputs"])
supabase_url = dotenv.dotenv_values().get("SUPABASE_URL", "")
bucket_name = "outputs"


@router.post("/upload")
async def upload_file_to_data_source(supabase: SBaseDeps, file: UploadFile = File(...)):
    current_time = int(time.time())
    try:
        file_content = await file.read()
        file_path = f"{file.filename}_{current_time}"

        response = await supabase.storage.from_(bucket_name).upload(
            file_path,
            file_content,
            {"content-type": file.content_type}
        )

        return {
            "message": "File uploaded successfully",
            "file_path": response.full_path,
            "download_link": f"{supabase_url}/storage/v1/object/public/{bucket_name}/{response.full_path}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{file_name}")
async def get_public_file_url(file_name: str):
    try:
        public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{file_name}"

        return {"download_url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/csv/{pipeline_run_id}")
async def get_pipeline_run_csv_response(supabase: SBaseDeps, pipeline_run_id: str):
    """
    Download a file from Supabase storage and stream it to the client.

    Args:
        file_path: Path to the file in the bucket
        download: Whether to force download (Content-Disposition: attachment)

    Returns:
        StreamingResponse with the file content
    """
    try:
        # Download file from Supabase

        file_path = f"csv/{pipeline_run_id}.csv"
        file_content = await supabase.storage.from_("outputs").download(file_path)

        # Create a BytesIO object from the content
        file_stream = io.BytesIO(file_content)
        filename = f"{pipeline_run_id}.csv"
        # Prepare headers
        headers = {
            "Content-Type": "text/csv"
        }

        # Set Content-Disposition header based on download parameter
        headers["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Return streaming response
        return StreamingResponse(
            file_stream,
            media_type="text/csv",
            headers=headers
        )

    except HTTPException as exc:
        # Re-raise HTTP exceptions
        raise exc
    except Exception as exc:
        # Handle unexpected errors
        raise HTTPException(
            status_code=500, detail=f"Unexpected error: {str(exc)}")
