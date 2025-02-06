from fastapi import APIRouter, HTTPException, UploadFile, File
from deps import SBaseDeps
import dotenv
import time

router = APIRouter(prefix="/data_sources", tags=["Data Sources"])
supabase_url = dotenv.dotenv_values().get("SUPABASE_URL", "")
bucket_name = "sources"

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
