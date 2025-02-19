import urllib
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse, Response
import supabase
from deps import SBaseDeps
import dotenv
import time
import json
from storage3.exceptions import StorageApiError
from urllib.parse import unquote, quote

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
        return JSONResponse({
                          "message": "File uploaded successfully",
                          "file_path": response.full_path,
                          "download_link": f"{supabase_url}/storage/v1/object/public/{bucket_name}/{response.full_path}"
                        }, status_code=201)

    except StorageApiError as e:
        info = e.to_dict()
        message = info["message"]

        if info.get("code") == "InvalidKey": # noqa
          message += " Please avoid special characters and abide by the naming guidelines: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html"
        raise HTTPException(status_code=500, detail=message)

@router.get("/download/{file_name}")
async def get_public_file_url(supabase: SBaseDeps, file_name: str):
    try:
        public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{quote(file_name)}"

        return {"download_url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{file_name}")
async def delete_file_by_name(supabase: SBaseDeps, file_name: str):
    file_name = file_name.replace(f"/{bucket_name}", "")
    try:
        res = await supabase.storage.from_(bucket_name).remove([file_name])

        if len(res) == 0:
          raise Exception("Nothing was deleted")

        return Response(status_code=204)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#http://127.0.0.1:54321/storage/v1/object/public/sources/68700304_Inter-Pacific%20Petroleum%20PTE.%20LTD..pdf_1739389367
#http://127.0.0.1:54321/storage/v1/object/public/sources/68700304_Inter-Pacific%20Petroleum%20%20PTE.%20LTD..pdf_1739389367
