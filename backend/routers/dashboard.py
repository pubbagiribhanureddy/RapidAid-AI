from typing import List, Dict, Any
from fastapi import APIRouter, Query

from models import DashboardStats
from services.db_service import db

router = APIRouter()


@router.get(
    "/dashboard/stats",
    response_model=DashboardStats,
    summary="Get dashboard statistics",
    description="Retrieve high-level summary metrics, category breakdown, severity counts, and recent activity."
)
async def get_dashboard_stats():
    return db.get_dashboard_stats()


@router.get(
    "/dashboard/recent",
    response_model=List[Dict[str, Any]],
    summary="Get recent activity feed",
    description="Retrieve the latest system activities, report correlations, and incident status changes."
)
async def get_recent_activity(
    limit: int = Query(15, ge=1, le=100, description="Number of recent activities to retrieve")
):
    return db.get_recent_activity(limit=limit)
