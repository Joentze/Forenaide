# Import Langchain modules
from langchain_core.runnables import RunnablePassthrough

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_chroma import Chroma

from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered

import os
import tempfile
import streamlit as st  
import pandas as pd
from dotenv import load_dotenv

# Set env
load_dotenv()
if not os.environ.get("OPENAI_API_KEY"):
  os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
os.environ["TESSDATA_PREFIX"] = "C:/Users/Wei/Documents/Projects/StreamlitWithLangChain/tessdata-main"


# # Test the model
# model = ChatOpenAI(model="gpt-4o-mini")
# messages = [
#     SystemMessage("Translate the following from English into Italian"),
#     HumanMessage("hi!"),
# ]
# response = model.invoke(messages)
# print(response)

# system_template = "Translate the following from English into {language}"
# prompt_template = ChatPromptTemplate.from_messages(
#     [("system", system_template), ("user", "{text}")]
# )



# Helper function to process the PDF
def extract_text_from_pdf(filepath):
    """
    Extracts text from the PDF file.

    Returns:
        res: String of extracted text

    Example Usage:
        extracted_text = extract_text_from_pdf("./handwritten-1.pdf")
    """
    res = ""

    # ### EasyOCR ####
    # doc = fitz.open(filepath)
    # zoom = 4
    # mat = fitz.Matrix(zoom, zoom)
    # count = 0
    # # Count variable is to get the number of pages in the pdf
    # for p in doc: count += 1
    # # Using fitz to convert pdf to images per page
    # for i in range(count):
    #     val = f"./outputs/image_{i}.png"
    #     page = doc.load_page(i)
    #     pix = page.get_pixmap(matrix=mat)
    #     pix.save(val)
    # doc.close()
    # # Extract text from images using EasyOCR
    # for i in range(count):
    #     reader = easyocr.Reader(['en'])
    #     result = reader.readtext(f"./outputs/image_{i}.png", detail=0)
    #     print(result)

    #### Marker ####
    converter = PdfConverter(
        artifact_dict=create_model_dict(),
    )
    rendered = converter(filepath)
    text, _, images = text_from_rendered(rendered)

    return text


# # Extract text
# extracted_text = extract_text_from_pdf("./handwritten-1.pdf")
# # Split the extracted text via text-structured based
# text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=0)
# split_text = text_splitter.split_text(extracted_text)

# # Generate embeddings from text
# embeddings_model = OpenAIEmbeddings()
# # single_embedding = embeddings_model.embed_query(split_text)
# embeddings = embeddings_model.embed_documents(split_text)

# # Initialize persistent vectorstore
# vector_store = Chroma(
#     collection_name="example_collection",
#     embedding_function=embeddings,
#     persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary    
# )

# print(extracted_text)