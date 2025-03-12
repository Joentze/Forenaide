import json
from lifespans import rabbitmq
from fastapi import APIRouter, BackgroundTasks, HTTPException, Path, Response
from fastapi.responses import JSONResponse
from deps import EnvironDeps, SBaseDeps, RabbitMQDeps
from uuid import UUID
from classes.classes import CreatePipelineRun, PipelineSourceAssoc, UpdatePipelineRun, PipelineRunResponse, OutputWithPipelineResponse
from typing import List, cast

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
    pipeline_id = response.data[0]["id"]
    # publish message to extraction queue
    # background_tasks.add_task(rabbitmq.publish_message,
    #                           "extraction", json.dumps(data))
    # if rabbitmq_client.connect(
    #     host=environ.rabbitmq_host,
    #     port=environ.rabbitmq_port
    # ):
    #     rabbitmq_client.publish_message(
    #         "extraction", json.dumps(response.data[0]))
    # else:
    #     raise Exception("Rabbit MQ refuse to connect")

    await supabase.schema("pgmq").rpc("send", {"queue_name": "extraction", "msg": {"id": pipeline_id, **pipeline_run.model_dump(mode="json")}}).execute()
    try:
        sources_pipeline: List[PipelineSourceAssoc] = [PipelineSourceAssoc(**{
            "pipeline_id": cast(UUID, response.data[0]["id"]),
            "source_id": cast(UUID, source["bucket_path"].split("/")[0])
        }) for source in data["file_paths"]]

        # insert sources_pipeline
        await supabase.table("sources_pipeline").insert([source.model_dump(mode="json") for source in sources_pipeline]).execute()

    except Exception as e:
        print("Error inserting sources_pipeline", str(e))

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


@router.get("/sources/{pipeline_id}")
async def get_sources_for_pipeline(supabase: SBaseDeps, pipeline_id: UUID):
    """
    gets all files for a pipeline run through sources_pipeline table
    """
    result = await supabase.table("sources_pipeline").select("*").eq("pipeline_id", str(pipeline_id)).execute()
    pipeline_id = result.data[0]["pipeline_id"]
    sources = [source["source_id"] for source in result.data]
    response = {"pipeline_id": pipeline_id, "source_ids": sources}
    # return response
    return JSONResponse(content=response, status_code=200)


@router.get("/outputs/{pipeline_id}", response_model=List[OutputWithPipelineResponse])
async def get_pipeline_outputs(supabase: SBaseDeps, pipeline_id: UUID):
    """
    Gets all outputs for a specific pipeline with associated pipeline information

    Args:
        pipeline_id: UUID of the pipeline
    """
    # Query outputs with pipeline information using a join
    result = await supabase.table("outputs")\
        .select("""
            *,
            pipeline:pipeline_runs (*)
        """)\
        .eq("pipeline_id", str(pipeline_id))\
        .execute()

    pipeline_data = await get_pipeline_run(supabase, pipeline_id)

    # if not result.data:
    #     raise HTTPException(
    #         status_code=404,
    #         detail=f"No outputs found for pipeline {pipeline_id}"
    #     )

    # Restructure the response data
    # pipeline_data = None
    outputs = []

    # Extract pipeline data and outputs
    for item in result.data:
        if not pipeline_data and 'pipeline' in item:
            pipeline_info = item['pipeline']
            if isinstance(pipeline_info, list):
                pipeline_data = pipeline_info[0] if pipeline_info else None
            else:
                pipeline_data = pipeline_info

        # Add output data without the pipeline information
        output_data = {
            key: value for key, value in item.items()
            if key != 'pipeline'
        }
        outputs.append(output_data)

    # Structure the final response
    response = {
        "pipeline": pipeline_data.model_dump(mode="json"),
        "outputs": outputs
    }

    return JSONResponse(content=response, status_code=200)
