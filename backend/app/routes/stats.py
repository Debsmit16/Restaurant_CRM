from fastapi import APIRouter
from app.models import StatsResponse
from app.services.customer_service import get_stats

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=StatsResponse)
async def get_stats_endpoint():
    """Get customer statistics for dashboard cards."""
    return await get_stats()
