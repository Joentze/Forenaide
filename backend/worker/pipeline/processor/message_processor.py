import asyncio
from supabase import AsyncClient
from typing import Any, Dict, List
from pipeline.model.SchemaModel import SchemaConfiguration
from pipeline.model.StepDataModel import StepData
from pipeline.model.PipelineModel import CreatePipelineRun


class MessageProcessor:
    """
    processes incoming rabbitmq message
    """
    bucket_name = "sources"

    def __init__(self, client: AsyncClient) -> None:
        self.client = client

    async def process_message(self, pipeline_message: CreatePipelineRun):
        """
        process incoming rabbitmq message
        """
        step_data_tasks = [self._prepare_step_data(filename=file.filename,
                                                   mimetype=file.mimetype,
                                                   path=file.bucket_path,
                                                   extraction_schema=pipeline_message.extraction_schema)
                           for file in pipeline_message.file_paths]
        step_datas: List[StepData] = asyncio.gather(*step_data_tasks)
        

    async def _prepare_step_data(self,
                                 filename: str,
                                 mimetype: str,
                                 path: str,
                                 extraction_schema: Dict[str, Any]
                                 ) -> StepData:
        file_bytes: bytes = await self._download_file(path=path)
        config: SchemaConfiguration = extraction_schema
        return StepData(
            event={
                "filename": filename,
                "mimetype": mimetype,
                "file_bytes": file_bytes
            },
            context={
                "extraction_config": config
            }
        )

    async def _download_file(self, path: str) -> bytes:
        """
        download file
        """
        response = await self.client.storage.from_(self.bucket_name).download(path)
        return response
