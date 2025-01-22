from fastapi import FastAPI
from bucket import sources
from bucket import outputs

app = FastAPI()

app.include_router(sources.router)
app.include_router(outputs.router)
