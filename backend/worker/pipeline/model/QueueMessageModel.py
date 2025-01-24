"""
base model for queue messages
"""
from enum import StrEnum
from typing import Optional
from pydantic import BaseModel, List


class SourceFileModel(BaseModel):
    """
    model for each file uploaded
    """
    source_id: str
    uri: str


class SchemaTypePrimitive(StrEnum):
    """
    primative of schema fields
    """
    STRING = "string"
    INTEGER = "number"
    FLOAT = "number"
    BOOLEAN = "boolean"
    ARRAY_STRING = "array_string"
    ARRAY_INT = "array_number"
    ARRAY_FLOAT = "array_number"
    ARRAY_BOOLEAN = "array_boolean"


class SchemaPropertyType(BaseModel):
    """
    types
    """
    name: str
    description: str
    type: SchemaTypePrimitive
    array_item_description: Optional[str] = ""


class SchemaConfiguration(BaseModel):
    """
    configuration of fields to extract
    """
    name: str = "extraction_tool"
    description: str
    schema: List[SchemaPropertyType]


class QueueMessageModel(BaseModel):
    """
    base model for incoming queue message
    """
    run_id: str
    files: List[SourceFileModel]
    schema: SchemaConfiguration
