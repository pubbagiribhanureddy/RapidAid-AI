from typing import List, Optional, Tuple
from datetime import datetime, timezone
import dateutil.parser

from config import DUPLICATE_DISTANCE_THRESHOLD_METERS, DUPLICATE_TIME_WINDOW_HOURS
from models import Incident, ReportSubmission
from services.geo_service import haversine_distance

# Categories that frequently co-occur in the same emergency incident
COMPATIBLE_CATEGORIES = {
    "road_accident": {"medical_emergency", "power_outage", "other"},
    "medical_emergency": {"road_accident", "building_collapse", "fire", "flood", "other"},
    "fire": {"building_collapse", "gas_leak", "power_outage", "medical_emergency", "other"},
    "flood": {"power_outage", "medical_emergency", "other"},
    "building_collapse": {"medical_emergency", "power_outage", "gas_leak", "other"},
    "gas_leak": {"fire", "medical_emergency", "other"},
    "power_outage": {"flood", "road_accident", "other"},
    "other": {"flood", "fire", "road_accident", "building_collapse", "medical_emergency", "gas_leak", "power_outage", "other"}
}


def are_categories_compatible(cat1: str, cat2: str) -> bool:
    """Checks if two incident/report categories are compatible for deduplication."""
    if cat1 == cat2:
        return True
    if cat1 == "other" or cat2 == "other":
        return True
    return cat2 in COMPATIBLE_CATEGORIES.get(cat1, set()) or cat1 in COMPATIBLE_CATEGORIES.get(cat2, set())


def parse_iso_timestamp(ts_str: str) -> datetime:
    """Safely parses an ISO timestamp string into a timezone-aware datetime."""
    try:
        dt = dateutil.parser.parse(ts_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return datetime.now(timezone.utc)


def is_within_time_window(incident_timestamp_str: str, report_timestamp_str: Optional[str] = None) -> bool:
    """
    Checks if report is within DUPLICATE_TIME_WINDOW_HOURS of the incident's timestamp.
    """
    incident_dt = parse_iso_timestamp(incident_timestamp_str)
    
    if report_timestamp_str:
        report_dt = parse_iso_timestamp(report_timestamp_str)
    else:
        report_dt = datetime.now(timezone.utc)

    diff_seconds = abs((report_dt - incident_dt).total_seconds())
    diff_hours = diff_seconds / 3600.0
    return diff_hours <= DUPLICATE_TIME_WINDOW_HOURS


def find_matching_incident(
    report_sub: ReportSubmission,
    existing_incidents: List[Incident],
    extracted_category: Optional[str] = None
) -> Optional[str]:
    """
    Finds an existing incident that matches the incoming report submission.
    Returns the incident_id of the closest matching incident, or None.
    
    Criteria:
    1. Distance <= DUPLICATE_DISTANCE_THRESHOLD_METERS (500m)
    2. Incident is not 'resolved' or 'closed' (or if resolved, was updated very recently)
    3. Category compatibility
    4. Timestamp within 2 hours
    """
    effective_category = extracted_category or report_sub.category or "other"
    candidates: List[Tuple[float, Incident]] = []

    for incident in existing_incidents:
        # Ignore closed or old resolved incidents
        if incident.status in ["closed", "resolved"]:
            continue

        # 1. Geographic distance check
        distance_m = haversine_distance(
            report_sub.latitude,
            report_sub.longitude,
            incident.location.latitude,
            incident.location.longitude
        )

        if distance_m > DUPLICATE_DISTANCE_THRESHOLD_METERS:
            continue

        # 2. Time window check (using incident's last_updated or first_reported)
        check_time = incident.last_updated or incident.first_reported
        if not is_within_time_window(check_time, report_sub.timestamp):
            continue

        # 3. Category similarity check
        if not are_categories_compatible(effective_category, incident.category):
            continue

        candidates.append((distance_m, incident))

    if not candidates:
        return None

    # Return the candidate with the smallest distance
    candidates.sort(key=lambda item: item[0])
    best_match_incident = candidates[0][1]
    return best_match_incident.id
