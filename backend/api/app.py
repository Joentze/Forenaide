"""
main backend api
"""
import uvicorn
from fastapi import FastAPI, APIRouter
from bucket import sources
from bucket import outputs
from template import templates
from pipeline import pipelines

app = FastAPI()
api = APIRouter()
api.include_router(router=sources.router)
api.include_router(router=outputs.router)
api.include_router(router=templates.router)
api.include_router(router=pipelines.router)
app.include_router(prefix="/api", router=api)

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", app=app, port=8000)
