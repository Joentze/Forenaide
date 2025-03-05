from uuid import uuid4
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, Response
from deps import SBaseDeps
import dotenv
from storage3.exceptions import StorageApiError

router = APIRouter(prefix="/data_sources", tags=["Data Sources"])
supabase_url = dotenv.dotenv_values().get("SUPABASE_URL", "")
bucket_name = "sources"


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
        await supabase.storage.from_("sources").upload(
            file_path,
            file_content,
            {"content-type": file.content_type}
        )

        # Ensure the file is uploaded before inserting into data sources
        response = await supabase.from_("data_sources").insert(body).execute()

        return JSONResponse(
            content={**response.data[0],
                     "url": await supabase.storage.from_("sources").get_public_url(
                file_path
            )}, status_code=201)

    except StorageApiError as e:
        info = e.to_dict()
        message = info["message"]

        if info.get("code") == "InvalidKey":  # noqa
            message += " Please avoid special characters and abide by the naming guidelines: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html"
        raise HTTPException(status_code=500, detail=message)


@router.delete("/{id}")
async def delete_file_by_id(supabase: SBaseDeps, id: str):
    try:
        data_source = await supabase.from_("data_sources").select("*").eq("id", id).execute()

        if not data_source.data:
            raise HTTPException(status_code=404, detail="file not found")

        sources_pipeline = await supabase.from_("sources_pipeline").select("*").eq("source_id", id).execute()

        if sources_pipeline.data:
            raise HTTPException(status_code=400, detail="Cannot delete file that is associated with a pipeline")

        path = data_source.data[0]["path"]
        res = await supabase.storage.from_(bucket_name).remove([path])

        if len(res) == 0:
            raise Exception("Nothing was deleted")

        data_source = await supabase.from_("data_sources").delete().eq("id", id).execute()

        return Response(status_code=204)

    except HTTPException as e:
        raise e

    except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
