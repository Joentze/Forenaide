from fastapi import FastAPI
from bucket import sources
from bucket import outputs
from template import templates

app = FastAPI()

app.include_router(sources.router)
app.include_router(outputs.router)
app.include_router(templates.router)
