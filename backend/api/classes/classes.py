"""
base models of pipeline, templates
"""
from enum import StrEnum
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional, List
from uuid import UUID
from datetime import datetime

# Templates


class PipelineStatus(StrEnum):
    NOT_STARTED = "not_started"
    PROCESSING = "processing"
    FAILED = "failed"
    INCOMPLETE = "incomplete"
    COMPLETED = "completed"


class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    extraction_schema: dict


class TemplateResponse(TemplateBase):
    id: UUID
    created_at: str

# Pipeline Runs


# class PipelineRunBase(BaseModel):
#     name: str
#     description: Optional[str] = None
#     strategy_id: UUID
#     extraction_schema: dict
#     status: Optional[str] = None
#     file_uris: List[str] = []


# class PipelineRunResponse(PipelineRunBase):
#     id: UUID
#     started_at: datetime
#     completed_at: datetime


# class PipelineRunUpdate(BaseModel):
#     name: Optional[str] = None
#     description: Optional[str] = None
#     strategy_id: Optional[UUID] = None
#     extraction_schema: Optional[dict] = None
#     status: Optional[str] = None


# ========
class UpdatePipelineRun(BaseModel):
    """
    base model to update pipeline run
    """
    status: PipelineStatus
    completed_at: Optional[str] = None


class CreatePipelineRun(BaseModel):
    """
    base model to create pipeline run
    """
    name: str
    description: Optional[str] = None
    strategy_id: UUID
    extraction_schema: Dict[str, Any]
    status: PipelineStatus = PipelineStatus.NOT_STARTED
    file_uris: List[str] = Field(..., min_items=1)


class PipelineResponse(BaseModel):
    """
    base model for pipeline response
    """
    id: UUID
    name: str
    description: str
    extraction_schema: Dict[str, Any]
    status: PipelineStatus
    file_uris: List[str]
    strategy_id: UUID
    started_at: str
    completed_at: str
# ========
