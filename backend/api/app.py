"""
main backend api
"""
import uvicorn
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

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", app=app, port=8000)
