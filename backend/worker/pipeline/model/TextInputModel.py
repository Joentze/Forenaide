from typing import List
from pydantic import BaseModel


class TextInputModel(BaseModel):
    """
    base model for text input extraction
    """
    texts: List[str]
