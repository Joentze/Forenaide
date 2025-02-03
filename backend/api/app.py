from fastapi import FastAPI
from bucket import sources
from bucket import outputs
from template import templates
from pipeline import pipelines

app = FastAPI()

app.include_router(sources.router)
app.include_router(outputs.router)
app.include_router(templates.router)
app.include_router(pipelines.router)
