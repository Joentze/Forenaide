from abc import ABC, abstractmethod
from typing import Any, Callable, List


class PipelineStep(ABC):
    """Abstract base class for a pipeline step."""

    @abstractmethod
    def process(self, data: Any) -> Any:
        """Processes the input data and returns the output data."""
        pass


class Pipeline:
    """Pipeline to manage and execute a series of processing steps."""

    def __init__(self):
        self.steps: List[PipelineStep] = []

    def add_step(self, step: PipelineStep) -> None:
        """Adds a step to the pipeline."""
        self.steps.append(step)

    def execute(self, data: Any) -> Any:
        """Executes the pipeline on the given data."""
        for step in self.steps:
            data = step.process(data)
        return data
