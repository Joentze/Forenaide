from enum import StrEnum


class ExtractionStrategies(StrEnum):
    """
    format:
    <STARTING_FILE>_<METHOD>_<MODEL>
    """
    # openai
    PDF_IMAGE_OPENAI = "pdf_image_openai"
    PDF_TEXT_OPENAI = "pdf_text_openai"
    OFFICE_IMAGE_OPENAI = "office_image_openai"
    OFFICE_TEXT_OPENAI = "office_text_openai"
    IMAGE_IMAGE_OPENAI = "image_image_openai"
    IMAGE_TEXT_OPENAI = "image_text_openai"
    # anthropic
    PDF_IMAGE_ANTHROPIC = "pdf_image_anthropic"
    PDF_TEXT_ANTHROPIC = "pdf_text_anthropic"
    OFFICE_IMAGE_ANTHROPIC = "office_image_anthropic"
    OFFICE_TEXT_ANTHROPIC = "office_text_anthropic"
    IMAGE_IMAGE_ANTHROPIC = "image_image_anthropic"
    IMAGE_TEXT_ANTHROPIC = "image_text_anthropic"
    # extraction from image not available for ollama
    PDF_TEXT_OLLAMA = "pdf_text_ollama"
    OFFICE_TEXT_OLLAMA = "office_text_ollama"
    IMAGE_TEXT_OLLAMA = "image_text_ollama"
