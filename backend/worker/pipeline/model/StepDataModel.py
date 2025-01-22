"""
base model for step data
"""
from typing import Dict, Any
from typing import TypedDict


class StepData(TypedDict):
    """
    Base model for step data, which includes:

    - event: A dictionary containing event-specific data. The keys and values can be of any type.
    - context: A dictionary containing context-specific data. The keys and values can be of any type.

    event and  context can be validated at the step level
    """
    event: Dict[str, Any]
    context: Dict[str, Any]
