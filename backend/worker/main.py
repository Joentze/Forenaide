import ast
from pprint import pprint
import asyncio

from openai import AsyncClient
from pipeline.extractor.text.ocr_extractor import OCRExtractor
from pipeline.model.SchemaModel import SchemaTypePrimitive
from pipeline import Pipeline
from pipeline.base.pipeline_step import StepData
from pipeline.extractor.openai_extractor import OpenAIExtractor, OpenAIImageExtractor
from pipeline.image.pdf_to_jpg_step import PDFToJPGStep
from pipeline.file.gotenberg_step import GotenbergPipelineStep


async def pdf_file_to_jpeg_to_image_to_row_openai(input_step: StepData) -> StepData:
    """
    converts a file to extracted fields
    """
    pipeline = Pipeline()
    # file_step = GotenbergPipelineStep()
    file_to_images_step = PDFToJPGStep()
    images_to_fields_step = OpenAIImageExtractor()
    # pipeline.add_step(step=file_step)
    pipeline.add_step(step=file_to_images_step)
    pipeline.add_step(images_to_fields_step)
    return await pipeline.execute(data=input_step)


async def pdf_file_to_jpeg_to_image_to_row_anthropic(input_step: StepData) -> StepData:
    pass


async def file_to_pdf_to_jpeg_to_image_to_row_openai(input_step: StepData) -> StepData:
    """
    converts a file to extracted fields
    """
    pipeline = Pipeline()
    file_step = GotenbergPipelineStep()
    file_to_images_step = PDFToJPGStep()
    images_to_fields_step = OpenAIImageExtractor()
    pipeline.add_step(step=file_step)
    pipeline.add_step(step=file_to_images_step)
    pipeline.add_step(images_to_fields_step)
    return await pipeline.execute(data=input_step)


async def file_to_pdf_to_jpeg_to_image_to_row_anthropic(input_step: StepData) -> StepData:
    pass


async def file_to_pdf_to_jpeg_to_text_to_row_openai(input_step: StepData) -> StepData:
    pipeline = Pipeline()
    file_step = GotenbergPipelineStep()
    file_to_images_step = PDFToJPGStep()
    images_to_text = OCRExtractor()
    texts_to_field_step = OpenAIExtractor()
    pipeline.add_step(step=file_step)
    pipeline.add_step(step=file_to_images_step)
    pipeline.add_step(step=images_to_text)
    pipeline.add_step(step=texts_to_field_step)
    return await pipeline.execute(data=input_step)


async def file_to_pdf_to_jpeg_to_text_to_row_ollama(input_step: StepData) -> StepData:
    """
    pipeline for ollama
    """
    pipeline = Pipeline()
    file_step = GotenbergPipelineStep()
    file_to_images_step = PDFToJPGStep()
    images_to_text = OCRExtractor()
    texts_to_field_step = OpenAIExtractor(
        # see https://ollama.com/blog/openai-compatibility
        # TODO: work on parsing this into actual json
        client=AsyncClient(
            base_url='http://localhost:11434/v1',
            api_key='ollama'
        ),
        model="llama3.1:latest"
    )
    pipeline.add_step(step=file_step)
    pipeline.add_step(step=file_to_images_step)
    pipeline.add_step(step=images_to_text)
    pipeline.add_step(step=texts_to_field_step)
    step_data = await pipeline.execute(data=input_step)
    rows = step_data["event"]["rows"]

# Convert stringed array of dictionaries to actual array of dictionaries
    for i, row in enumerate(rows):
        try:
            rows[i] = ast.literal_eval(row)
        except (ValueError, SyntaxError) as e:
            raise ValueError(f"Error parsing row {i}: {e}")

    step_data["event"]["rows"] = rows
    return step_data

if __name__ == "__main__":
    # response = asyncio.run(
    #     pdf_file_to_jpeg_to_image_to_row_openai(
    #         input_step=StepData(
    #             event={
    #                 "filename": "test.pdf",
    #                 "mimetype": "application.pdf",
    #                 "file_bytes": open('/Users/tanjoen/Documents/Forenaide/backend/worker/test.pdf', 'rb').read()
    #             },
    #             context={
    #                 "extraction_config": {
    #                     "name": "extraction_tool",
    #                     "description": "extract the relevant fields for documents",
    #                     "schema": [
    #                         {
    #                             "name": "name",
    #                             "description": "The name of the product",
    #                             "type": SchemaTypePrimitive.STRING
    #                         },
    #                         {
    #                             "name": "price",
    #                             "description": "The price of the product",
    #                             "type": SchemaTypePrimitive.FLOAT
    #                         },
    #                         {
    #                             "name": "description",
    #                             "description": "A detailed description of the product",
    #                             "type": SchemaTypePrimitive.STRING
    #                         },
    #                         {
    #                             "name": "tags",
    #                             "description": "Tags associated with the product",
    #                             "type": SchemaTypePrimitive.ARRAY_STRING,
    #                             "array_item_description": "each tag associated with the product"
    #                         }
    #                     ]
    #                 }
    #             }
    #         )
    #     )
    # )
    # pprint(response["event"]["rows"])

    response_docx = asyncio.run(file_to_pdf_to_jpeg_to_image_to_row_openai(
        input_step=StepData(
            event={
                "filename": "test.docx",
                "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "file_bytes": open("/Users/tanjoen/Downloads/test.docx", 'rb').read()
            },
            context={
                "extraction_config": {
                    "name": "extraction_tool",
                    "description": "extract the relevant fields for documents",
                    "schema": [
                            {
                                "name": "name",
                                "description": "The name of the product",
                                "type": SchemaTypePrimitive.STRING
                            },
                        {
                                "name": "price",
                                "description": "The price of the product",
                                "type": SchemaTypePrimitive.FLOAT
                                },
                        {
                                "name": "description",
                                "description": "A detailed description of the product",
                                "type": SchemaTypePrimitive.STRING
                                },
                        {
                                "name": "tags",
                                "description": "Tags associated with the product",
                                "type": SchemaTypePrimitive.ARRAY_STRING,
                                "array_item_description": "each tag associated with the product"
                                }
                    ]
                }
            }
        )
    ))
    pprint(response_docx["event"]["rows"])
