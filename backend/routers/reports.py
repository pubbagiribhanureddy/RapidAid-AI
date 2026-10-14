import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from models import (
    ReportSubmission,
    Report,
    Incident,
    IncidentLocation,
    ReportProcessResult
)
from services.ai_service import (
    analyze_report,
    generate_incident_summary,
    assess_priority
)
from services.geo_service import (
    reverse_geocode_simple,
    get_nearby_landmarks
)
from services.dedup_service import find_matching_incident
from services.db_service import db

router = APIRouter()


@router.post(
    "/reports",
    response_model=ReportProcessResult,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new emergency report",
    description="Submits an emergency report, performs AI extraction, checks for duplicate incidents, and merges or creates an incident record."
)
async def submit_report(submission: ReportSubmission) -> ReportProcessResult:
    content = submission.get_content().strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Emergency report text or description cannot be empty."
        )

    # 1. AI Analysis & Information Extraction
    ai_analysis = analyze_report(
        text=content,
        image_url=submission.image_url,
        language=submission.language
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"

    # 2. Location Geocoding & Landmarks
    address = reverse_geocode_simple(submission.latitude, submission.longitude)
    landmarks = get_nearby_landmarks(submission.latitude, submission.longitude)

    # 3. Deduplication Check against existing active incidents
    all_existing_incidents = db.get_all_incidents()
    matching_incident_id = find_matching_incident(
        report_sub=submission,
        existing_incidents=all_existing_incidents,
        extracted_category=ai_analysis["category"]
    )

    if matching_incident_id:
        # Existing incident matched -> Correlate & Merge
        report = Report(
            id=report_id,
            incident_id=matching_incident_id,
            text=content,
            description=content,
            latitude=submission.latitude,
            longitude=submission.longitude,
            category=ai_analysis["category"],
            image_url=submission.image_url,
            language=submission.language,
            reporter_name=submission.reporter_name,
            reporter_phone=submission.reporter_phone,
            created_at=now_iso,
            ai_summary=ai_analysis["summary"],
            ai_extracted_details=ai_analysis
        )
        db.add_report(report)

        # Pull all reports currently linked to this incident for multi-report synthesis
        linked_reports = db.get_all_reports(incident_id=matching_incident_id)
        reports_data = [
            r.model_dump() if hasattr(r, "model_dump") else r.dict()
            for r in linked_reports
        ]

        existing_incident = db.get_incident(matching_incident_id)
        inc_title = existing_incident.title if existing_incident else "Active Emergency"

        # Re-assess priority & generate consolidated summary
        new_severity, new_explanation = assess_priority(
            category=existing_incident.category if existing_incident else ai_analysis["category"],
            reports_data=reports_data
        )
        new_summary = generate_incident_summary(
            incident_title=inc_title,
            category=existing_incident.category if existing_incident else ai_analysis["category"],
            reports_data=reports_data
        )

        updated_incident = db.attach_report_to_incident(
            incident_id=matching_incident_id,
            report_id=report_id,
            new_summary=new_summary,
            new_severity=new_severity,
            new_explanation=new_explanation,
            new_hazards=ai_analysis["hazards"],
            affected_people=ai_analysis.get("affected_people")
        )

        return ReportProcessResult(
            report=report,
            incident=updated_incident,
            is_new_incident=False,
            message="Report correlated with existing incident. AI synthesized updated operational picture."
        )

    else:
        # No match found -> Initialize new Incident
        incident_id = f"RA-{uuid.uuid4().hex[:8].upper()}"

        # Generate a clean, descriptive title
        cat_label = ai_analysis["category"].replace("_", " ").title()
        primary_landmark = landmarks[0] if landmarks else address.split(",")[0]
        incident_title = f"{cat_label} near {primary_landmark}"

        new_incident = Incident(
            id=incident_id,
            title=incident_title,
            category=ai_analysis["category"],
            severity=ai_analysis["severity"],
            status="new",
            location=IncidentLocation(
                latitude=submission.latitude,
                longitude=submission.longitude,
                address=address,
                landmarks=landmarks
            ),
            reports=[report_id],
            report_count=1,
            first_reported=now_iso,
            last_updated=now_iso,
            ai_summary=ai_analysis["summary"],
            ai_priority_explanation=ai_analysis["priority_explanation"],
            hazards=ai_analysis["hazards"],
            affected_people_estimate=ai_analysis.get("affected_people"),
            missing_info=ai_analysis.get("missing_info", []),
            verification_status="unverified",
            assigned_to=None,
            notes=None
        )
        db.add_incident(new_incident)

        report = Report(
            id=report_id,
            incident_id=incident_id,
            text=content,
            description=content,
            latitude=submission.latitude,
            longitude=submission.longitude,
            category=ai_analysis["category"],
            image_url=submission.image_url,
            language=submission.language,
            reporter_name=submission.reporter_name,
            reporter_phone=submission.reporter_phone,
            created_at=now_iso,
            ai_summary=ai_analysis["summary"],
            ai_extracted_details=ai_analysis
        )
        db.add_report(report)

        return ReportProcessResult(
            report=report,
            incident=new_incident,
            is_new_incident=True,
            message="New incident created successfully from report."
        )


@router.get(
    "/reports",
    response_model=List[Report],
    summary="List all reports",
    description="Retrieve reports with optional filtering by incident ID."
)
async def list_reports(incident_id: Optional[str] = Query(None, description="Filter by associated incident ID")):
    return db.get_all_reports(incident_id=incident_id)


@router.get(
    "/reports/{report_id}",
    response_model=Report,
    summary="Get single report",
    description="Retrieve a single report by its ID."
)
async def get_report(report_id: str):
    report = db.get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' not found."
        )
    return report
