import json
from lifespans import rabbitmq
from fastapi import APIRouter, BackgroundTasks, HTTPException, Path, Response
from fastapi.responses import JSONResponse
from deps import EnvironDeps, SBaseDeps, RabbitMQDeps
from uuid import UUID
from classes.classes import CreatePipelineRun, UpdatePipelineRun, PipelineRunResponse
from typing import List


router = APIRouter(prefix="/pipelines", tags=["Pipelines"])


async def get_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID) -> PipelineRunResponse:
    """
    gets an instance of the pipeline run
    """
    result = await supabase.table("pipeline_runs").select("*").eq("id", str(pipeline_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    return PipelineRunResponse(**result.data[0])

# Create a pipeline run


@router.post("/", response_model=PipelineRunResponse)
async def create_pipeline_run(supabase: SBaseDeps, pipeline_run: CreatePipelineRun, rabbitmq_client: RabbitMQDeps, environ: EnvironDeps):
    """
    creates pipeline run
    """
    data = pipeline_run.model_dump(mode="json")
    response = await supabase.table("pipeline_runs").insert(data).execute()
    # publish message to extraction queue
    # background_tasks.add_task(rabbitmq.publish_message,
    #                           "extraction", json.dumps(data))
    if rabbitmq_client.connect(
        host=environ.rabbitmq_host,
        port=environ.rabbitmq_port
    ):
        rabbitmq_client.publish_message(
            "extraction", json.dumps(response.data[0]))
    else:
        raise Exception("Rabbit MQ refuse to connect")
    return JSONResponse(content=response.data[0], status_code=201)

# Get all pipeline runs


@router.get("/", response_model=List[PipelineRunResponse])
async def get_all_pipeline_runs(supabase: SBaseDeps):
    """
    gets all pipeline run

    TOOD: if we have authentication, we probably got to query 
          based on uid
    """
    result = await supabase.table("pipeline_runs").select("*").execute()
    return JSONResponse(content=result.data, status_code=200)

# Get a single pipeline run by ID


@router.get("/{pipeline_id}", response_model=PipelineRunResponse)
async def get_pipeline_run_by_id(supabase: SBaseDeps, pipeline_id: UUID = Path(..., description="The ID of the pipeline run to fetch")):
    pipeline = await get_pipeline_run(supabase, pipeline_id)
    return JSONResponse(content=pipeline.model_dump(mode="json"), status_code=200)

# Update a pipeline run


@router.put("/{pipeline_id}", response_model=PipelineRunResponse)
async def update_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID, pipeline_run: UpdatePipelineRun):
    # check if pipeline even exists
    await get_pipeline_run(supabase, pipeline_id)
    data = pipeline_run.model_dump(mode="json")
    response = await supabase.table("pipeline_runs").update(data).eq("id", str(pipeline_id)).execute()
    return JSONResponse(content=response.data[0], status_code=201)

# Partially update a pipeline run


# @router.patch("/{pipeline_id}", response_model=PipelineRunResponse)
# async def partially_update_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID, pipeline_run: PipelineRunUpdate):
#     existing_run = await get_pipeline_run(supabase, pipeline_id)
#     # Only include fields that are provided
#     update_data = pipeline_run.dict(exclude_unset=True)
#     if "strategy_id" in update_data:
#         update_data["strategy_id"] = str(update_data["strategy_id"])
#     await supabase.table("pipeline_runs").update(update_data).eq("id", str(pipeline_id)).execute()
#     updated_run = {**existing_run, **update_data}
#     return updated_run

# Delete a pipeline run


@router.delete("/{pipeline_id}")
async def delete_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID):
    """
    deletes pipeline run
    """
    await get_pipeline_run(supabase, pipeline_id)
    await supabase.table("pipeline_runs").delete().eq("id", str(pipeline_id)).execute()
    return Response(status_code=204)
