import base64
from io import BytesIO
from PIL import Image
from typing import List
from pdf2image import convert_from_bytes
from pipeline.model.StepDataModel import StepData
from pipeline import PipelineStep
from pipeline.file.gotenberg_step import FileOutputModel
from pipeline.model.ImageInputModel import PagesImageInputModel


class PDFToJPGStep(PipelineStep):
    """
    base class for converting pdf to jpg
    """

    def __init__(self):
        pass

    async def process(self, data: StepData) -> StepData:
        incoming_pdf_file = FileOutputModel(
            **data.event
        )
        images_bytes: List[str] = []
        images: List[Image.Image] = convert_from_bytes(
            pdf_file=incoming_pdf_file.file_bytes)
        for image in images:
            with BytesIO() as output:
                image.save(output, format="JPEG")
                byte = output.getvalue()
                images_bytes.append(self.convert_bytes_to_base64(byte))
        return StepData(
            event=PagesImageInputModel(
                image_type="jpeg",
                images=images_bytes
            ).model_dump(mode="json"),
            context=data.context
        )

    def convert_bytes_to_base64(self, image_bytes: bytes) -> str:
        """converts image to base64"""
        return base64.b64encode(image_bytes).decode('utf-8')
