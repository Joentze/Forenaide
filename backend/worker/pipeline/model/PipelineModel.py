
"""base models for incoming pipeline messages"""
from typing import Dict, Any, List
from enum import StrEnum
from uuid import UUID
from pydantic import BaseModel


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
