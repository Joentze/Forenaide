"""
file pipeline router
"""
import ast
from typing import Any, Coroutine
from pipeline.model.StrategyModel import ExtractionStrategies
from openai import AsyncClient
from pipeline.extractor.text.ocr_extractor import OCRExtractor
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


strategy_map = {
    ExtractionStrategies.FILE_IMAGE_OPENAI: {
        "image": file_to_pdf_to_jpeg_to_text_to_row_openai,
        "document": {
            "pdf": pdf_file_to_jpeg_to_image_to_row_openai,
            "office": file_to_pdf_to_jpeg_to_image_to_row_openai
        }
    },
    # TODO: to implement other pdf pipelines
    # ExtractionStrategies.FILE_TEXT_OPENAI: {
    #     "image": file_to_pdf_to_jpeg_to_text_to_row_openai,
    #     "document": {
    #         "pdf": None,
    #         "office": file_to_pdf_to_jpeg_to_text_to_row_openai
    #     }
    # },
    # ExtractionStrategies.FILE_TEXT_OLLAMA: {
    #     "image": file_to_pdf_to_jpeg_to_text_to_row_openai,
    #     "document": {
    #         "pdf": None,
    #         "office": file_to_pdf_to_jpeg_to_text_to_row_ollama
    #     }
    # }
}


def route_files_to_pipeline(strategy: ExtractionStrategies, mimetype: str) -> Coroutine[Any, Any, StepData]:
    """
    returns pipeline callable based on strategy
    """
    print(122, "routing pipeline", strategy, mimetype)

    if strategy not in strategy_map:
        raise NotImplementedError("strategy has not been implemented")
    if mimetype in ("application/pdf"):
        if strategy_map[strategy]["document"]["pdf"] is not None:
            return strategy_map[strategy]["document"]["pdf"]
        else:
            raise ValueError(
                "PDF is not implemented for the given strategy.")
    elif mimetype in (

        "application/vnd.lotus-1-2-3",
        "application/x-t602",
        "application/x-abiword",
        "text/x-bibtex",
        "image/bmp",
        "application/vnd.corel-draw",
        "image/cgm",
        "image/x-cmx",
        "text/csv",
        "application/x-cwk",
        "application/x-dbf",
        "video/x-dv",
        "application/msword",
        "application/vnd.ms-word.document.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.ms-word.template.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
        "image/vnd.dxf",
        "application/x-emf",
        "application/postscript",
        "application/epub+zip",
        "application/vnd.oasis.opendocument.graphics-flat-xml",
        "application/vnd.oasis.opendocument.presentation-flat-xml",
        "application/vnd.oasis.opendocument.spreadsheet-flat-xml",
        "application/vnd.oasis.opendocument.text-flat-xml",
        "application/x-font-opendyslexic",
        "image/gif",
        "application/x-hwp",
        "image/jpeg",
        "application/vnd.apple.keynote",
        "application/x-latex",
        "application/vnd.lotus-wordpro",
        "application/vnd.macwriteii",
        "application/x-troff-man",
        "text/mathml",
        "application/vnd.mozilla.xul+xml",
        "application/vnd.apple.numbers",
        "application/x-odd",
        "application/vnd.oasis.opendocument.graphics",
        "application/vnd.oasis.opendocument.text-master",
        "application/vnd.oasis.opendocument.presentation",
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/vnd.oasis.opendocument.text",
        "application/vnd.oasis.opendocument.graphics-template",
        "application/vnd.oasis.opendocument.text-web",
        "application/vnd.oasis.opendocument.presentation-template",
        "application/vnd.oasis.opendocument.spreadsheet-template",
        "application/vnd.oasis.opendocument.text-template",
        "application/vnd.apple.pages",
        "image/x-portable-bitmap",
        "image/x-photo-cd",
        "image/x-pict",
        "image/x-pcx",
        "application/vnd.palm",
        "application/pdf",
        "image/x-portable-graymap",
        "image/png",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-powerpoint.template.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.presentationml.template",
        "image/x-portable-pixmap",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-powerpoint.presentation.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/vnd.adobe.photoshop",
        "application/x-powersoftreport",
        "application/x-mspublisher",
        "application/x-pwp",
        "application/vnd.ms-pocketword",
        "image/x-cmu-raster",
        "application/rtf",
        "application/vnd.stardivision.draw",
        "application/vnd.stardivision.calc",
        "application/vnd.stardivision.impress",
        "application/vnd.stardivision.impress",
        "application/vnd.stardivision.writer",
        "application/vnd.stardivision.writer",
        "application/vnd.ms-excel",
        "application/vnd.stardivision.math",
        "application/vnd.sun.xml.calc.template",
        "application/vnd.sun.xml.draw.template",
        "application/vnd.sun.xml.impress.template",
        "application/vnd.sun.xml.writer.template",
        "image/svg+xml",
        "application/vnd.stardivision.math",
        "application/x-shockwave-flash",
        "application/vnd.sun.xml.calc",
        "application/vnd.sun.xml.draw",
        "application/vnd.sun.xml.writer.global",
        "application/vnd.sun.xml.impress",
        "application/vnd.sun.xml.math",
        "application/vnd.sun.xml.writer",
        "image/x-tga",
        "image/tiff",
        "image/tiff",
        "text/plain",
        "application/x-uof",
        "application/vnd.oasis.opendocument.presentation",
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/vnd.oasis.opendocument.text",
        "application/vnd.visio",
        "application/vnd.stardivision.writer",
        "application/vnd.visio",
        "application/vnd.ms-visio.drawing.macroenabled.12",
        "application/vnd.visio",
        "application/x-quattropro",
        "application/vnd.lotus-1-2-3",
        "application/vnd.ms-works",
        "application/x-wmf",
        "application/vnd.wordperfect",
        "application/x-wpg",
        "application/vnd.ms-works",
        "image/x-xbitmap",
        "application/xhtml+xml",
        "application/vnd.ms-excel",
        "application/vnd.ms-excel.sheet.binary.macroenabled.12",
        "application/vnd.ms-excel.sheet.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.ms-excel.template.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
        "application/vnd.ms-excel",
        "application/xml",
        "image/x-xpixmap",
        "application/x-abiword"

    ):
        if strategy_map[strategy]["document"]["office"] is not None:

            return strategy_map[strategy]["document"]["office"]
        else:
            raise ValueError(
                "Office is not implemented for the given strategy.")
    else:
        raise NotImplementedError(f"""strategy for file of {
                                  mimetype} is not implemented""")
