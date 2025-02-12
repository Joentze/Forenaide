
"""base models for incoming pipeline messages"""
from typing import Dict, Any, List, Optional
from enum import StrEnum
from uuid import UUID
from pydantic import BaseModel, Field


class PipelineStatus(StrEnum):
    """
    pipeline status enum
    """
    NOT_STARTED = "not_started"
    PROCESSING = "processing"
    FAILED = "failed"
    INCOMPLETE = "incomplete"
    COMPLETED = "completed"


class PipelineRunResponse(BaseModel):
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


class PipelineFilePath(BaseModel):
    """
    base model for each file
    """
    uri: Optional[str] = None
    mimetype: str
    bucket_path: str
    filename: str


class CreatePipelineRun(BaseModel):
    """
    base model to create pipeline run
    """
    name: str
    description: Optional[str] = None
    # NOTE: don't know if strategy id is actually necessary here
    strategy_id: UUID
    extraction_schema: Dict[str, Any]
    status: PipelineStatus = PipelineStatus.NOT_STARTED
    file_paths: List[PipelineFilePath] = Field(..., min_length=1)
