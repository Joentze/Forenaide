from abc import ABC, abstractmethod
from typing import Any, Callable, List


class PipelineStep(ABC):
    """Abstract base class for a pipeline step."""

    @abstractmethod
    def process(self, data: Any) -> Any:
        """Processes the input data and returns the output data."""
        pass
