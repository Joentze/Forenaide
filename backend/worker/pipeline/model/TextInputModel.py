from typing import List
from typing import TypedDict


class TextInputModel(TypedDict):
    """
    base model for text input extraction
    """
    texts: List[str]
