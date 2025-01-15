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
        images_bytes: List[bytes] = []
        images: List[Image.Image] = convert_from_bytes(
            pdf_file=incoming_pdf_file.file_bytes)
        for image in images:
            with BytesIO() as output:
                image.save(output, format="JPEG")
                byte = output.getvalue()
                images_bytes.append(byte)
        return StepData(
            event=PagesImageInputModel(
                image_type="JPEG",
                images=images_bytes
            ),
            context=data.context
        )
