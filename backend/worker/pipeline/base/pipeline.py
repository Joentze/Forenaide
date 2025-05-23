"""
base class for pipeline
"""
from typing import List
from pipeline.model.StepDataModel import StepData
from pipeline.base import PipelineStep


class Pipeline:
    """Pipeline to manage and execute a series of processing steps."""

    def __init__(self):
        self.steps: List[PipelineStep] = []

    def add_step(self, step: PipelineStep) -> None:
        """Adds a step to the pipeline."""
        self.steps.append(step)

    async def execute(self, data: StepData) -> StepData:
        """Executes the pipeline on the given data."""
        for step in self.steps:
            data = await step.process(data)
        return data
