import asyncio
import base64
from io import BytesIO
import io
from typing import List, TypedDict
from PIL import Image
from pytesseract import image_to_string
from pipeline.model.ImageInputModel import PagesImageInputModel
from pipeline.model.StepDataModel import StepData
from pipeline.base.pipeline_step import PipelineStep


class OCRExtractor(PipelineStep):
    """
    base class for extracting text from images
    """

    def __init__(self) -> None:
        pass

    async def process(self, data: StepData) -> StepData:
        pages_data: PagesImageInputModel = {**data["event"]}
        images = pages_data["images"]
        texts = [image_to_string(Image.open(BytesIO(base64.b64decode(image))))
                 for image in images]
        print(texts)
        return {"event": {
            "texts": texts
        }, "context": data["context"]}


if __name__ == "__main__":
    ocr = OCRExtractor()
    ocr.process({
        "event": {
            "image_type": "jpeg",
            "images": [open("/Users/tanjoen/Documents/Forenaide/backend/worker/test.jpg", "rb")]
        },
        "context": {

        }
    })
