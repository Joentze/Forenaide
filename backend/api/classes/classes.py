from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    schema: dict

class TemplateResponse(TemplateBase):
    id: UUID
    created_at: str