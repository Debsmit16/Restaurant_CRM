from fastapi import APIRouter

router = APIRouter(tags=["metrics"])


@router.get("/metrics/recent-requests")
async def get_recent_requests():
    """Get recent API request logs for the activity panel."""
    from app.middleware.logging_middleware import request_log_store
    return {"requests": list(request_log_store)}
