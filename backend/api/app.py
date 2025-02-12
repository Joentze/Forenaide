from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi import FastAPI, APIRouter
from bucket import sources
from bucket import outputs
from template import templates
from pipeline import pipelines
from lifespans import lifespan

app = FastAPI(lifespan=lifespan)
api = APIRouter()
api.include_router(router=sources.router)
api.include_router(router=outputs.router)
api.include_router(router=templates.router)
api.include_router(router=pipelines.router)
app.include_router(prefix="/api", router=api)

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
if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", app=app, port=8000)
