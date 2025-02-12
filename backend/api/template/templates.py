from fastapi import APIRouter, HTTPException, Response
from uuid import UUID, uuid4

from fastapi.responses import JSONResponse
from classes.classes import CreateTemplate, TemplateResponse, UpdateTemplate
from deps import SBaseDeps

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.post("/", response_model=TemplateResponse)
async def create_template(supabase: SBaseDeps, template: CreateTemplate):
    """
    creates templates
    """
    try:
        response = await supabase.table("templates").insert(template.model_dump(mode="json")).execute()
        return JSONResponse(content=response.data[0], status_code=201)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[TemplateResponse])
async def get_templates(supabase: SBaseDeps):
    """
    gets all templates
    """
    try:
        response = await supabase.table("templates").select("*").execute()
        return JSONResponse(content=response.data, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(supabase: SBaseDeps, template_id: UUID):
    """
    gets template
    """
    try:
        response = await supabase.table("templates").select("*").eq("id", str(template_id)).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")

        return JSONResponse(content=response.data[0], status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(supabase: SBaseDeps, template_id: UUID, template: UpdateTemplate):
    """
    updates extraction template
    """
    try:
        response = await supabase.table("templates").update(
            template.model_dump()
        ).eq("id", str(template_id)).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")
        return JSONResponse(content=response.data[0], status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{template_id}")
async def delete_template(supabase: SBaseDeps, template_id: UUID):
    """
    deletes extraction template
    """
    try:
        response = await supabase.table("templates").delete().eq("id", str(template_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")
        return Response(status_code=204)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
