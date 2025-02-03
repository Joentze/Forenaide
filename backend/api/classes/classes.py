from pydantic import BaseModel
from typing import Optional, Generic, TypeVar
from uuid import UUID
from datetime import datetime

# Templates
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    schema: dict

class TemplateResponse(TemplateBase):
    id: UUID
    created_at: str

# Pipeline Runs
class PipelineRunBase(BaseModel):
    name: str
    description: Optional[str] = None
    strategy_id: UUID
    schema: dict
    status: Optional[str] = None

class PipelineRunResponse(PipelineRunBase):
    id: UUID
    started_at: datetime
    completed_at: datetime

class PipelineRunUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    strategy_id: Optional[UUID] = None
    schema: Optional[dict] = None
    status: Optional[str] = None