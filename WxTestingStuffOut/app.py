
import streamlit as st  
from functions import *
import base64
import time

# Initialize the API key in session state if it doesn't exist
if 'api_key' not in st.session_state:
    st.session_state.api_key = ''

def display_pdf(uploaded_file):
    """
    Display a PDF file that has been uploaded to Streamlit.
    The PDF will be displayed in an iframe, with the width and height set to 700x1000 pixels.

    Parameters:
        uploaded_file : UploadedFile 
            The uploaded PDF file to display.

    Returns:
        None
    """
    # Read file as bytes:
    bytes_data = uploaded_file.getvalue()
    
    # Convert to Base64
    base64_pdf = base64.b64encode(bytes_data).decode('utf-8')
    
    # Embed PDF in HTML
    pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="700" height="1000" type="application/pdf"></iframe>'
    
    # Display file
    st.markdown(pdf_display, unsafe_allow_html=True)

def upload_file_onchange():
    st.session_state.upload_disabled = True 

def load_streamlit_page():
    """
    Load the streamlit page with two columns. 
    The left column contains a file uploader for the user to upload a PDF document. 
    The right column contains a header and text that greet the user and explain the purpose of the tool.

    Returns:
        col1: The left column Streamlit object.
        col2: The right column Streamlit object.
        uploaded_file: The uploaded PDF file.
    """
    st.set_page_config(layout="wide", page_title="LLM Tool")

    # Design page layout with 2 columns: File uploader on the left, and other interactions on the right.
    col1, col2 = st.columns([0.5, 0.5], gap="large")

    with col1:
        # st.header("Input your OpenAI API key")
        # st.text_input('OpenAI API key', type='password', key='api_key', label_visibility="collapsed", disabled=False)
        st.header("Upload file")
        uploaded_file = st.file_uploader("Please upload your PDF document:", type= "pdf", disabled=st.session_state.upload_disabled, on_change=upload_file_onchange)

    return col1, col2, uploaded_file



# Make a streamlit page
if "upload_disabled" not in st.session_state:
    st.session_state.upload_disabled = False
col1, col2, uploaded_file = load_streamlit_page()

# Process the input
if uploaded_file is not None:
    with col2:
        display_pdf(uploaded_file)
    with col1:
        with st.spinner("Generating answer..."):
          
            # # Load in the documents
            # documents = get_pdf_text(uploaded_file)
            # st.session_state.vector_store = create_vectorstore_from_texts(documents, 
            #                                                               api_key=st.session_state.api_key,
            #                                                               file_name=uploaded_file.name)

            # Convert to actual file 
            input_file = uploaded_file.read() # Read file content
            # Create a temporary file (Marker requires a file path to read the PDF,
            # it can't work directly with file-like objects or byte streams that we get from Streamlit's uploaded_file)
            temp_file = tempfile.NamedTemporaryFile(delete=False)
            temp_file.write(input_file)
            temp_file.close()

            # Extract text
            extracted_text = extract_text_from_pdf(temp_file.name)
            # Split the extracted text via text-structured based
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=0)
            split_text = text_splitter.split_text(extracted_text)

            # Generate embeddings from text
            embeddings_model = OpenAIEmbeddings()
            # single_embedding = embeddings_model.embed_query(split_text)
            embeddings = embeddings_model.embed_documents(split_text)

            # Initialize persistent vectorstore
            vector_store = Chroma(
                collection_name="example_collection",
                embedding_function=embeddings,
                persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary    
            )

            # Print answer
            st.write(extracted_text)
            st.session_state.upload_disabled = False

    
# with col1:
    # if st.button("Generate table"):
        # with st.spinner("Generating answer"):
        #     # Load vectorstore:

        #     answer = query_document(vectorstore = st.session_state.vector_store, 
        #                             query = "Give me the title, summary, publication date, and authors of the research paper.",
        #                             api_key = st.session_state.api_key)
                            
        #     placeholder = st.empty()
        #     placeholder = st.write(answer)
        # st.write("Generated!")