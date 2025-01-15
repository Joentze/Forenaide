from enum import StrEnum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class SchemaTypePrimitive(StrEnum):
    """
    primative of schema fields
    """
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    ARRAY_STRING = "array_string"
    ARRAY_INT = "array_int"
    ARRAY_FLOAT = "array_float"
    ARRAY_BOOLEAN = "array_boolean"


class SchemaPropertyType(BaseModel):
    """
    types
    """
    name: str
    description: str
    type: SchemaTypePrimitive
    array_item_description: Optional[str] = None


class SchemaConfiguration(BaseModel):
    """
    configuration of fields to extract
    """
    name: str = "extraction_tool"
    description: str
    schema: List[SchemaPropertyType]


def generate_tool_schema_json(config: SchemaConfiguration) -> Dict[str, Any]:
    """
    creates tool calling schema for properties from schema
    """
    properties = {}
    for field in config.schema:
        field_type = field.type.value
        if field_type.startswith("array"):
            item_type = field_type.split("_")[1]
            properties[field.name] = {
                "type": "array",
                "description": field.description,
                "items": {
                    "type": item_type,
                    "description": field.array_item_description or f"An item of type {item_type}"
                }
            }
        else:
            properties[field.name] = {
                "type": field_type,
                "description": field.description
            }
    return {
        "name": config.name,
        "description": config.description,
        "strict": True,
        "parameters": {
            "type": "object",
            "required": [
                "instances"
            ],
            "properties": {
                "instances": {
                    "type": "array",
                    "description": "Array of objects to be generated",
                    "items": {
                        "type": "object",
                        "required": [field.name for field in config.schema],
                        "properties": properties
                    }
                }
            }
        },
        "additionalProperties": False
    }
