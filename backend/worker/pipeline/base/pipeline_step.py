"""
base class for pipeline step
"""
from abc import ABC, abstractmethod
from pipeline.model.StepDataModel import StepData


class PipelineStep(ABC):
    """Abstract base class for a pipeline step."""

    @abstractmethod
    async def process(self, data: StepData) -> StepData:
        """Processes the input data and returns the output data."""
        return
