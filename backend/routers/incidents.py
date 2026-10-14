from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from models import (
    Incident,
    IncidentDetailResponse,
    IncidentUpdate,
    Report
)
from services.db_service import db

router = APIRouter()


@router.get(
    "/incidents",
    response_model=List[Incident],
    summary="List all incidents",
    description="List all incidents with optional filtering by status, severity, category, or geographic bounding box."
)
async def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (new, verified, in_progress, resolved, closed)"),
    severity: Optional[str] = Query(None, description="Filter by severity (critical, high, medium, low)"),
    category: Optional[str] = Query(None, description="Filter by emergency category"),
    min_lat: Optional[float] = Query(None, description="Minimum latitude bounding box"),
    max_lat: Optional[float] = Query(None, description="Maximum latitude bounding box"),
    min_lng: Optional[float] = Query(None, description="Minimum longitude bounding box"),
    max_lng: Optional[float] = Query(None, description="Maximum longitude bounding box")
):
    return db.get_all_incidents(
        category=category,
        severity=severity,
        status=status_filter,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lng=min_lng,
        max_lng=max_lng
    )


@router.get(
    "/incidents/{incident_id}",
    response_model=IncidentDetailResponse,
    summary="Get incident details",
    description="Retrieve full details for an incident including all associated citizen reports."
)
async def get_incident(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID '{incident_id}' not found."
        )

    inc_data = incident.model_dump() if hasattr(incident, "model_dump") else incident.dict()
    return IncidentDetailResponse(
        **inc_data,
        linked_reports=linked_reports
    )


@router.patch(
    "/incidents/{incident_id}",
    response_model=Incident,
    summary="Update incident",
    description="Update an incident's status, notes, assigned team, verification status, severity, or hazards."
)
async def update_incident(incident_id: str, update_data: IncidentUpdate):
    updated = db.update_incident(incident_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID '{incident_id}' not found."
        )
    return updated


@router.get(
    "/incidents/{incident_id}/reports",
    response_model=List[Report],
    summary="Get reports for incident",
    description="List all reports linked to a specific incident ID."
)
async def get_incident_reports(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID '{incident_id}' not found."
        )
    return db.get_all_reports(incident_id=incident_id)
