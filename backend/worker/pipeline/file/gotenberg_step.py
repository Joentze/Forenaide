"""base class gotenberg file handler"""
from typing import Dict, Tuple, TypedDict
from pipeline.model.StepDataModel import StepData
from pipeline.base import PipelineStep
from httpx import AsyncClient, AsyncHTTPTransport


class FileInputModel(TypedDict):
    """
    base model for file inputs
    """
    filename: str
    mimetype: str
    # encoded file_bytes
    file_bytes: str


class FileOutputModel(TypedDict):
    """
    base model for pdf converted file
    """
    filename: str
    # encoded file_bytes
    file_bytes: bytes


MIMETYPES: Dict[Tuple[str], str] = {
    (
        "text/html"
    ): "/chromium/convert/html",
    (
        "text/markdown",
        "text/x-markdown"
    ): "/forms/chromium/convert/markdown",
    (
        "application/vnd.lotus-1-2-3",
        "application/x-t602",
        "application/x-abiword",
        "text/x-bibtex",
        "application/vnd.corel-draw",
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
        "application/x-emf",
        "application/postscript",
        "application/epub+zip",
        "application/vnd.oasis.opendocument.graphics-flat-xml",
        "application/vnd.oasis.opendocument.presentation-flat-xml",
        "application/vnd.oasis.opendocument.spreadsheet-flat-xml",
        "application/vnd.oasis.opendocument.text-flat-xml",
        "application/x-font-opendyslexic",
        "application/x-hwp",
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
        "application/vnd.palm",
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-powerpoint.template.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.presentationml.template",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-powerpoint.presentation.macroenabled.12",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/x-powersoftreport",
        "application/x-mspublisher",
        "application/x-pwp",
        "application/vnd.ms-pocketword",
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
        "application/vnd.stardivision.math",
        "application/x-shockwave-flash",
        "application/vnd.sun.xml.calc",
        "application/vnd.sun.xml.draw",
        "application/vnd.sun.xml.writer.global",
        "application/vnd.sun.xml.impress",
        "application/vnd.sun.xml.math",
        "application/vnd.sun.xml.writer",
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
        "application/x-abiword"
    ): "/libreoffice/convert"

}


class GotenbergPipelineStep(PipelineStep):
    """
    pipeline step to convert incoming files to pdf
    """

    def __init__(self) -> None:
        """
        initialise file handler
        """
        self.client = AsyncClient(
            # using gotenberg's default url
            base_url="https://demo.gotenberg.dev/forms",
            transport=AsyncHTTPTransport(
                retries=5
            )
        )

    async def process(self, data: StepData) -> StepData:
        """
        converts incoming file into pdf bytes
        """
        file_data: FileInputModel = {
            **data["event"]
        }
        pdf_bytes = await self.convert_to_pdf(file=file_data)

        return {
            "event": {
                "filename": file_data["filename"],
                "file_bytes": pdf_bytes
            },
            "context": data["context"]
        }

    async def convert_to_pdf(self, file: FileInputModel) -> bytes:
        """
        makes post request to gotenberg
        """
        gotenberg_path = None
        for mimetypes, path in MIMETYPES.items():
            if file["mimetype"] in mimetypes:
                gotenberg_path = path
                break
        if gotenberg_path is None:
            raise ValueError("file(s) mimetype is not available")

        if file["mimetype"] == "text/html":
            filename = "index.html"
        else:
            filename = file["filename"]

        response = await self.client.post(
            url=gotenberg_path,
            files={
                "files": (filename, file["file_bytes"], file["mimetype"])
            },
            timeout=10000
        )
        if response.is_error:
            raise ValueError("gotenberg process has failed")
        return response.content
