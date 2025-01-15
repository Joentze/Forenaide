from pipeline import PipelineStep
from pipeline.model.StepDataModel import StepData


class OllamaExtractor(PipelineStep):
    """
    base class for ollama extractor
    """

    def __init__(self) -> None:
        pass

    async def process(self, data: StepData) -> StepData:
        # Implement the processing logic for OllamaExtractor here
        return StepData()
