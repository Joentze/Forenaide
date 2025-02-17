from uuid import uuid4
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse, Response
from deps import SBaseDeps
import dotenv

router = APIRouter(prefix="/data_sources", tags=["Data Sources"])
supabase_url = dotenv.dotenv_values().get("SUPABASE_URL", "")


@router.post("/upload")
async def upload_file_to_data_source(supabase: SBaseDeps, file: UploadFile = File(...)):
    """
    uploads file to bucket
    """
    try:
        uuid = str(uuid4())
        file_content = await file.read()
        file_path = f"{uuid}/{file.filename}"
        body = {
            "id": uuid,
            "filename": file.filename,
            "mimetype": file.content_type,
            "path": file_path
        }
        response = await supabase.from_("data_sources").insert(body).execute()
        await supabase.storage.from_("sources").upload(
            file_path,
            file_content,
            {"content-type": file.content_type}
        )
        print(33)
        return JSONResponse(content=response.data[0], status_code=201)
    except Exception as e:
        return Response(status_code=500, content=str(e))


# NOTE: removed the following endpoint because not necessary for now

# @router.get("/download/{file_name}")
# async def get_public_file_url(file_name: str):
#     try:
#         bucket_name = "sources"
#         public_url = f"{
#             supabase_url}/storage/v1/object/public/{bucket_name}/{file_name}"

#         return {"download_url": public_url}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
