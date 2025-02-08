from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bucket import sources
from bucket import outputs
from template import templates
from pipeline import pipelines

app = FastAPI()

# Add CORS middleware to allow requests from these origins
# Define allowed origins (you can set "*" to allow all origins)
origins = [
    "*"
    # Add more allowed origins if needed
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins or you can specify particular ones
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods like GET, POST, etc.
    allow_headers=["*"],  # Allows all headers
)

app.include_router(sources.router)
app.include_router(outputs.router)
app.include_router(templates.router)
app.include_router(pipelines.router)
