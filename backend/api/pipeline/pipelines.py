from fastapi import APIRouter, HTTPException, Path
from deps import SBaseDeps
from uuid import UUID, uuid4
from classes.classes import PipelineRunBase, PipelineRunUpdate, PipelineRunResponse
from typing import Optional, List
from datetime import datetime
import dotenv

router = APIRouter(prefix="/pipelines", tags=["Pipelines"])
supabase_url = dotenv.dotenv_values().get("SUPABASE_URL", "")

# Helper function to fetch a pipeline run by ID
async def get_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID):
    result = await supabase.table("pipeline_runs").select("*").eq("id", str(pipeline_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    return result.data[0]

# Create a pipeline run
@router.post("/", response_model=PipelineRunResponse)
async def create_pipeline_run(supabase: SBaseDeps, pipeline_run: PipelineRunBase):
    pipeline_id = uuid4()
    started_at = datetime.now()
    completed_at = datetime.now()
    data = {
        "id": str(pipeline_id),
        "name": pipeline_run.name,
        "description": pipeline_run.description,
        "strategy_id": str(pipeline_run.strategy_id),
        "schema": pipeline_run.schema,
        "status": "In progress",
        "started_at": started_at.isoformat(),
        "completed_at": completed_at.isoformat()
    }
    await supabase.table("pipeline_runs").insert(data).execute()
    return {**pipeline_run.dict(), "id": pipeline_id, "started_at": started_at, "completed_at": completed_at}

# Get all pipeline runs
@router.get("/", response_model=List[PipelineRunResponse])
async def get_all_pipeline_runs(supabase: SBaseDeps):
    result = await supabase.table("pipeline_runs").select("*").execute()
    return result.data

# Get a single pipeline run by ID
@router.get("/{pipeline_id}", response_model=PipelineRunResponse)
async def get_pipeline_run_by_id(supabase: SBaseDeps, pipeline_id: UUID = Path(..., description="The ID of the pipeline run to fetch")):
    return await get_pipeline_run(supabase, pipeline_id)

# Update a pipeline run
@router.put("/{pipeline_id}", response_model=PipelineRunResponse)
async def update_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID, pipeline_run: PipelineRunBase):
    existing_run = await get_pipeline_run(supabase, pipeline_id)
    data = {
        "name": pipeline_run.name,
        "description": pipeline_run.description,
        "strategy_id": str(pipeline_run.strategy_id),
        "schema": pipeline_run.schema,
        "status": pipeline_run.status
    }
    await supabase.table("pipeline_runs").update(data).eq("id", str(pipeline_id)).execute()
    return {**pipeline_run.dict(), "id": pipeline_id, "started_at": existing_run["started_at"], "completed_at": existing_run["completed_at"]}

# Partially update a pipeline run
@router.patch("/{pipeline_id}", response_model=PipelineRunResponse)
async def partially_update_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID, pipeline_run: PipelineRunUpdate):
    existing_run = await get_pipeline_run(supabase, pipeline_id)
    update_data = pipeline_run.dict(exclude_unset=True)  # Only include fields that are provided
    if "strategy_id" in update_data:
        update_data["strategy_id"] = str(update_data["strategy_id"])
    await supabase.table("pipeline_runs").update(update_data).eq("id", str(pipeline_id)).execute()
    updated_run = {**existing_run, **update_data}
    return updated_run

# Delete a pipeline run
@router.delete("/{pipeline_id}", response_model=dict)
async def delete_pipeline_run(supabase: SBaseDeps, pipeline_id: UUID):
    await get_pipeline_run(supabase, pipeline_id)  # Check if the pipeline run exists
    await supabase.table("pipeline_runs").delete().eq("id", str(pipeline_id)).execute()
    return {"message": "Pipeline run deleted successfully"}
