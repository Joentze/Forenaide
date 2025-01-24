import asyncio
import json
from typing import Any, Dict, List, Optional
from pipeline.model.TextInputModel import TextInputModel
from pipeline.model.SchemaModel import SchemaConfiguration, generate_tool_schema_json
from pipeline import PipelineStep
from pipeline.model import StepData, PagesImageInputModel
from openai import AsyncClient


class OpenAIExtractor(PipelineStep):
    """
    base class for open ai text to format extractor
    """

    def __init__(self, client: Optional[AsyncClient] = None, model: str = "gpt-4o-mini") -> None:
        if client:
            self.client = client
        else:
            self.client = AsyncClient()

        self.model = model

    async def process(self, data: StepData) -> StepData:
        texts_data = data["event"]
        extraction_config = data["context"]["extraction_config"]
        response = await self.extract_format_from_all_texts(data=texts_data,
                                                            extraction_config=extraction_config)
        return {
            "event": {"rows": response},
            "context": data["context"]
        }

    async def extract_format_from_all_texts(self, data: TextInputModel, extraction_config: SchemaConfiguration) -> List[Dict[str, Any]]:
        """
        extract format from texts
        """
        tasks = [
            self._extract_format_from_text(text, extraction_config)
            for text in data["texts"]
        ]
        results = await asyncio.gather(*tasks)

        return [*map(lambda result: result["instances"], results)]

    async def _extract_format_from_text(self, text: bytes, extraction_config: SchemaConfiguration) -> Dict[str, Any]:
        return await tool_call_openai_model(
            client=self.client,
            content=text,
            extraction_config=extraction_config,
            model=self.model
        )


class OpenAIImageExtractor(PipelineStep):
    """
    base class for openai image to format extractor
    """

    def __init__(self) -> None:
        self.client = AsyncClient()

    async def process(self, data: StepData) -> StepData:
        pages_data = {**data["event"]}
        extraction_config = {
            **data["context"]["extraction_config"]}
        response = await self.extract_format_from_all_images(data=pages_data,
                                                             extraction_config=extraction_config)
        return {
            "event": {"rows": response},
            "context": data["context"]
        }

    async def extract_format_from_all_images(self,
                                             data: PagesImageInputModel,
                                             extraction_config: SchemaConfiguration) -> List[Dict[str, Any]]:
        """
        extracts data from all images
        """
        tasks = [
            self._extract_format_from_image(image, extraction_config)
            for image in data["images"]
        ]
        results = await asyncio.gather(*tasks)

        return [*map(lambda result: result["instances"], results)]

    async def _extract_format_from_image(self, image: str, extraction_config: SchemaConfiguration) -> Dict[str, Any]:

        return await tool_call_openai_model(
            client=self.client,
            content=[
                {"type": "text", "text": "extract the relevant content using extractor_tool"},
                {
                    "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image}"},
                },
            ],
            extraction_config=extraction_config
        )


async def tool_call_openai_model(client: AsyncClient,
                                 content: str | List[Dict[str, Any]],
                                 extraction_config: SchemaConfiguration,
                                 model: str = "gpt-4o-mini"
                                 ) -> Dict[str, Any]:
    """
    extracts defined fields
    """
    response = await client.chat.completions.create(
        temperature=0,
        model=model,
        tools=[
            {
                "type": "function",
                "function": generate_tool_schema_json(extraction_config)
            }
        ],
        tool_choice={
            "type": "function",
            "function":
                {"name": extraction_config["name"]}
        },
        messages=[
            {
                "role": "user",
                "content": content,
            }
        ]
    )
    if len(response.choices) == 0:
        raise ValueError("there was no corrected json given")
    if len(response.choices[0].message.tool_calls) == 0:
        raise ValueError("there were no tool calls made")
    if response.choices[0].message.tool_calls[0].function.name != extraction_config["name"]:
        raise ValueError("tool use is incorrect")
    generated_json = json.loads(
        response.choices[0].message.tool_calls[0].function.arguments)
    return generated_json
