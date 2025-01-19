from enum import Enum
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

# Path params with data defintions
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# Enums
class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"
@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}

# When you declare other function parameters that are not part of the path parameters, they are automatically interpreted as "query" parameters.
# https://fastapi.tiangolo.com/tutorial/query-params/
@app.get("/queryitems/")
async def read_item(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}