"""
models for transferring images
"""
from typing import List, TypedDict
from enum import Enum


class ImageType(str, Enum):
    """
    openai accepted image types
    """
    JPEG = "jpeg"
    JPG = "jpg"
    PNG = "png"
    WEBP = "webp"


class PagesImageInputModel(TypedDict):
    """
    base model for page input model, one image per page
    """
    image_type: ImageType = ImageType.JPG
    images: List[bytes]
