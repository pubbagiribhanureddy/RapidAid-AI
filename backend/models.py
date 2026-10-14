from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, model_validator
from datetime import datetime


class IncidentLocation(BaseModel):
    latitude: float
    longitude: float
    address: str
    landmarks: List[str] = Field(default_factory=list)


class AIExtractedDetails(BaseModel):
    category: str
    severity: str
    hazards: List[str] = Field(default_factory=list)
    affected_people: Optional[str] = None
    location_details: Optional[str] = None
    summary: str
    missing_info: List[str] = Field(default_factory=list)
    translated_text: Optional[str] = None


class ReportSubmission(BaseModel):
    text: Optional[str] = None
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    language: str = "en"
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    timestamp: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def populate_text_or_description(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Ensure at least text or description is present
            text_val = data.get("text") or data.get("description") or ""
            data["text"] = text_val
            data["description"] = text_val
            if not data.get("timestamp"):
                data["timestamp"] = datetime.utcnow().isoformat() + "Z"
        return data

    def get_content(self) -> str:
        return self.text or self.description or ""


class Report(BaseModel):
    id: str
    incident_id: Optional[str] = None
    text: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    language: str = "en"
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    created_at: str
    ai_summary: str
    ai_extracted_details: Dict[str, Any]


class Incident(BaseModel):
    id: str
    title: str
    category: str
    severity: str  # critical, high, medium, low
    status: str    # new, verified, in_progress, resolved, closed
    location: IncidentLocation
    reports: List[str] = Field(default_factory=list)
    report_count: int = 0
    first_reported: str
    last_updated: str
    ai_summary: str
    ai_priority_explanation: str
    hazards: List[str] = Field(default_factory=list)
    affected_people_estimate: Optional[str] = None
    missing_info: List[str] = Field(default_factory=list)
    verification_status: str = "unverified"  # unverified, community_verified, official_verified, rejected
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class IncidentDetailResponse(Incident):
    linked_reports: List[Report] = Field(default_factory=list)


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    verification_status: Optional[str] = None
    severity: Optional[str] = None
    hazards: Optional[List[str]] = None


class DashboardStats(BaseModel):
    total_incidents: int
    critical_count: int
    active_count: int
    resolved_count: int
    total_reports: int
    incidents_by_category: Dict[str, int]
    incidents_by_severity: Dict[str, int]
    recent_activity: List[Dict[str, Any]] = Field(default_factory=list)


class ReportProcessResult(BaseModel):
    report: Report
    incident: Incident
    is_new_incident: bool
    message: str
