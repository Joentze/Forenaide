from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from deps import SBaseDeps
from classes.classes import StrategyResponse
from typing import List

router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.get("/", response_model=List[StrategyResponse])
async def get_strategies(supabase: SBaseDeps):
    """
    gets all strategies
    """
    try:
        response = await supabase.from_("strategies").select("*").execute()
        return JSONResponse(content=response.data, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
