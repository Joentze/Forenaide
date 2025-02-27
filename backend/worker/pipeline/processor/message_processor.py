import csv
import asyncio
import io
import json
from supabase import AsyncClient
from typing import Any, Coroutine, Dict, List
from pipeline.router.file_strategy_router import route_files_to_pipeline
from pipeline.model.StrategyModel import StrategyResponseModel
from pipeline.model.SchemaModel import SchemaConfiguration
from pipeline.model.StepDataModel import StepData
from pipeline.model.PipelineModel import CreatePipelineRun, PipelineRunResponse


class MessageProcessor:
    """
    processes incoming rabbitmq message
    """
    bucket_name = "sources"
    outputs_bucket_name = "outputs"
    outputs_table_name = "outputs"
    pipeline_runs_table_name = "pipeline_runs"
    strategies_table_name = "strategies"

    def __init__(self, client: AsyncClient) -> None:
        self.client = client

    async def process_message(self, pipeline_message: PipelineRunResponse) -> List[StepData]:
        """
        process incoming rabbitmq message
        """
        try:
            strategy_id = str(pipeline_message.strategy_id)
            await self.client.from_(self.pipeline_runs_table_name).update({"status": "processing"}).eq("id", str(pipeline_message.id)).execute()
            extraction_tasks = [self._prepare_extraction(
                strategy_id=strategy_id,
                filename=file["filename"],
                mimetype=file["mimetype"],
                path=file["bucket_path"],
                extraction_schema=pipeline_message.extraction_schema)
                for file in pipeline_message.file_paths]

            step_data_results: List[StepData] = await asyncio.gather(*extraction_tasks)
            if any(step_data is None for step_data in step_data_results):
                raise ValueError("One or more step data preparations failed.")

            instances = [
                item for entry in step_data_results for row in entry["event"]["rows"] for item in row]

            response = await self.client.storage.from_(self.outputs_bucket_name).upload(
                path=f"results/{pipeline_message.id}.json",
                file=json.dumps(
                    {"instances": instances}).encode('utf-8'),
                file_options={"cache-control": "3600", "upsert": "false"}
            )

            await self.client.from_(self.outputs_table_name).insert({
                "pipeline_id": str(pipeline_message.id),
                "uri": response.full_path
            }).execute()

            await self.client.from_(self.pipeline_runs_table_name).update({"status": "completed"}).eq("id", str(pipeline_message.id)).execute()

            # write to csv
            csv_string = self.dicts_to_csv_bytes(instances)
            print(65, csv_string)
            response = await self.client.storage.from_(self.outputs_bucket_name).upload(
                path=f"csv/{pipeline_message.id}.csv",
                file=csv_string.encode('utf-8'),
                file_options={"cache-control": "3600",
                              "upsert": "false"}
            )

            return {"instances": instances}
        except Exception as e:
            print("75, error", e)
            await self.client.from_(self.pipeline_runs_table_name).update({"status": "failed"}).eq("id", str(pipeline_message.id)).execute()
        finally:
            await self.client.postgrest.aclose()

    async def _prepare_extraction(self,
                                  strategy_id: str,
                                  filename: str,
                                  mimetype: str,
                                  path: str,
                                  extraction_schema: Dict[str, Any]
                                  ) -> StepData:
        strategy = await self._get_strategy(strategy_id=strategy_id)
        file_bytes: bytes = await self._download_file(path=path)
        config: SchemaConfiguration = extraction_schema
        step_data = {
            "event": {
                "filename": filename,
                "mimetype": mimetype,
                "file_bytes": file_bytes
            },
            "context": {
                "extraction_config": config
            }
        }
        pipeline: Coroutine[Any, Any, StepData] = route_files_to_pipeline(
            strategy=strategy, mimetype=mimetype)
        return await pipeline(step_data)

    async def _download_file(self, path: str) -> bytes:
        """
        download file
        """
        response = await self.client.storage.from_(self.bucket_name).download(path)
        return response

    async def _get_strategy(self, strategy_id: str) -> str:
        """
        get strategy for pipeline run
        """
        response = await self.client.from_(self.strategies_table_name).select("strategy").eq("id", strategy_id).execute()
        if len(response.data) == 0:
            raise ValueError("strategy does not exists")
        return response.data[0]["strategy"]

    def dicts_to_csv_bytes(self, dict_list) -> str:
        """
        Convert a list of dictionaries to CSV format and return as bytes.

        Args:
            dict_list: A list of dictionaries where each dictionary represents a row

        Returns:
            bytes: The CSV content as bytes
        """
        if not dict_list or len(dict_list) == 0:
            return b''

        # Create a StringIO object to write the CSV data
        output = io.StringIO()

        # Get fieldnames from the first dictionary
        fieldnames = dict_list[0].keys()

        # Create a CSV writer that will write to our StringIO object
        writer = csv.DictWriter(output, fieldnames=fieldnames)

        # Write the header row
        writer.writeheader()

        # Write all the dictionaries as rows
        writer.writerows(dict_list)

        # Get the string data and encode to bytes
        csv_string = output.getvalue()
        return csv_string
