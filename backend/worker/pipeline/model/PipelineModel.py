
"""base models for incoming pipeline messages"""
from typing import Dict, Any, List, Optional, TypedDict
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


class PipelineFilePath(TypedDict):
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
    strategy_id: UUID
    schema: Dict[str, Any]
    status: PipelineStatus = PipelineStatus.NOT_STARTED
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    file_paths: List[PipelineFilePath] = []


class PipelineRunResponse(BaseModel):
    """
    base model for pipeline response
    """
    id: UUID
    name: str
    description: str
    schema: Dict[str, Any]
    status: PipelineStatus
    strategy_id: UUID
    started_at: str
    completed_at: str
    file_paths: List[PipelineFilePath] = []

# test = {'name': 'test pipeline run',
#         'description': 'test description',
#         'strategy_id': '86a1b98b-b3fe-4f92-96e2-0fbe141fe669',
#         'extraction_schema': {'extraction_config': {'name': 'extraction_tool', 'description': 'extract the relevant fields for documents',
#                                                     'schema': [
#                                                         {'name': 'name', 'description': 'The name of the product', 'type': 'string'},
#                                                         {'name': 'price', 'description': 'The price of the product', 'type': 'string'},
#                                                         {
#                                                             'name': 'description', 'description': 'A detailed description of the product', 'type': 'string'},
#                                                         {'name': 'tags', 'description': 'Tags associated with the product', 'type': 'array_string', 'array_item_description': 'each tag associated with the product'}]}}, 'status': 'not_started', 'file_paths': [{'uri': None, 'mimetype': 'application/pdf', 'bucket_path': 'eec6d073-3f33-4c84-ab6c-d03796248d62/Amazon Store.pdf', 'filename': 'Amazon Store.pdf'}]}
