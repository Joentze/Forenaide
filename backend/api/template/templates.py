from fastapi import APIRouter, HTTPException
from uuid import UUID, uuid4
from classes.classes import TemplateBase, TemplateResponse
from client import supabase

router = APIRouter(prefix="/templates", tags=["Templates"])

@router.post("/", response_model=TemplateResponse)
async def create_template(template: TemplateBase):
    try:
        template_data = {
            "id": str(uuid4()),
            **template.model_dump()
        }
        
        response = supabase.table("templates").insert(template_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[TemplateResponse])
async def get_templates():
    try:
        response = supabase.table("templates").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: UUID):
    try:
        response = supabase.table("templates").select("*").eq("id", str(template_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(template_id: UUID, template: TemplateBase):
    try:
        response = supabase.table("templates").update(
            template.model_dump()
        ).eq("id", str(template_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{template_id}")
async def delete_template(template_id: UUID):
    try:
        response = supabase.table("templates").delete().eq("id", str(template_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        return {"message": "Template deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))