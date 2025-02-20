import asyncio
import json
import ast
from openai import AsyncClient
from supabase import create_async_client
from pipeline.processor.message_processor import MessageProcessor
from pipeline.model.PipelineModel import PipelineRunResponse
from pipeline.extractor.text.ocr_extractor import OCRExtractor
from pipeline import Pipeline
from pipeline.model.environ.Environ import Environ
from pipeline.base.pipeline_step import StepData
from pipeline.extractor.openai_extractor import OpenAIExtractor, OpenAIImageExtractor
from pipeline.image.pdf_to_jpg_step import PDFToJPGStep
from pipeline.file.gotenberg_step import GotenbergPipelineStep
from pipeline.message.consumer import RabbitMQConsumer


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
    file_step = GotenbergPipelineStep()
    file_to_images_step = PDFToJPGStep()
    images_to_fields_step = OpenAIImageExtractor()
    pipeline = Pipeline()
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


def create_message_processor() -> MessageProcessor:
    """
    create async client
    """
    environ = Environ()
    client = asyncio.run(create_async_client(
        supabase_url=environ.supabase_url,
        supabase_key=environ.supabase_key
    ))
    return MessageProcessor(client=client)


def process_message(ch, method, properties, body):
    """processes incoming extraction messages"""
    try:
        # print(f"Received message: {body.decode()}")
        # Process the message here

        str_message = body.decode()
        print(str_message)
        message_processor = create_message_processor()

        message = json.loads(str_message)
        print(message)

        pipeline_message = PipelineRunResponse.model_validate(message)

        response = asyncio.run(message_processor.process_message(
            pipeline_message=pipeline_message))

        print(response)

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        # Reject the message in case of processing error
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        # NOTE: add in supabase updates here

        print(f"Error processing message: {str(e)}")


if __name__ == "__main__":
    # response = asyncio.run(
    #     pdf_file_to_jpeg_to_image_to_row_openai(
    #         input_step=StepData(
    #             event={
    #                 "filename": "test.pdf",
    #                 "mimetype": "application.pdf",
    #                 "file_bytes": open('/Users/tanjoen/Documents/Forenaide/backend/worker/test.pdf', 'rb').read()
    #             },
    # context={
    #     "extraction_config": {
    #         "name": "extraction_tool",
    #         "description": "extract the relevant fields for documents",
    #         "schema": [
    #             {
    #                 "name": "name",
    #                 "description": "The name of the product",
    #                 "type": SchemaTypePrimitive.STRING
    #             },
    #             {
    #                 "name": "price",
    #                 "description": "The price of the product",
    #                 "type": SchemaTypePrimitive.FLOAT
    #             },
    #             {
    #                 "name": "description",
    #                 "description": "A detailed description of the product",
    #                 "type": SchemaTypePrimitive.STRING
    #             },
    #             {
    #                 "name": "tags",
    #                 "description": "Tags associated with the product",
    #                 "type": SchemaTypePrimitive.ARRAY_STRING,
    #                 "array_item_description": "each tag associated with the product"
    #             }
    #         ]
    #     }
    # }
    #         )
    #     )
    # )
    # pprint(response["event"]["rows"])
    environ = Environ()
    with RabbitMQConsumer(
        host=environ.rabbitmq_host,
        port=environ.rabbitmq_port,
        queue_name='extraction'
    ) as consumer:
        consumer.consume(process_message)
        # response_docx = asyncio.run(file_to_pdf_to_jpeg_to_image_to_row_openai(
        #     input_step=StepData(
        #         event={
        #             "filename": "test.docx",
        #             "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        #             "file_bytes": open("/Users/tanjoen/Downloads/test.docx", 'rb').read()
        #         },
        #         context={
        #             "extraction_config": {
        #                 "name": "extraction_tool",
        #                 "description": "extract the relevant fields for documents",
        #                 "schema": [
        #                         {
        #                             "name": "name",
        #                             "description": "The name of the product",
        #                             "type": SchemaTypePrimitive.STRING
        #                         },
        #                     {
        #                             "name": "price",
        #                             "description": "The price of the product",
        #                             "type": SchemaTypePrimitive.FLOAT
        #                             },
        #                     {
        #                             "name": "description",
        #                             "description": "A detailed description of the product",
        #                             "type": SchemaTypePrimitive.STRING
        #                             },
        #                     {
        #                             "name": "tags",
        #                             "description": "Tags associated with the product",
        #                             "type": SchemaTypePrimitive.ARRAY_STRING,
        #                             "array_item_description": "each tag associated with the product"
        #                             }
        #                 ]
        #             }
        #         }
        #     )
        # ))
        # pprint(response_docx["event"]["rows"])
