from pipeline import PipelineStep
from pipeline.model.StepDataModel import StepData


class ClaudeExtractor(PipelineStep):
    """
    base class for claude text to format extractor
    """

    def __init__(self) -> None:
        pass

    async def process(self, data: StepData) -> StepData:

        return StepData()


class ClaudeImageExtractor(PipelineStep):
    """
    base class for anthropic image to format extractor
    """

    def __init__(self) -> None:
        pass

    async def process(self, data: StepData) -> StepData:
        # Placeholder for processing logic specific to Anthropic
        return StepData()
