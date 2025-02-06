from pydantic import BaseModel
from typing import Optional, Generic, TypeVar, Any
from uuid import UUID
from datetime import datetime

# Templates
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    extraction_schema: dict

class TemplateResponse(TemplateBase):
    id: UUID
    created_at: str

# Pipeline Runs
class PipelineRunBase(BaseModel):
    name: str
    description: Optional[str] = None
    strategy_id: UUID
    extraction_schema: dict
    status: Optional[str] = None

class PipelineRunResponse(PipelineRunBase):
    id: UUID
    started_at: datetime
    completed_at: datetime

class PipelineRunUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    strategy_id: Optional[UUID] = None
    extraction_schema: Optional[dict] = None
    status: Optional[str] = None
