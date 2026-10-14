import os
from typing import List

# Application Metadata
APP_TITLE = "RapidAid AI API"
APP_DESCRIPTION = "Intelligent Emergency Response System Backend API"
VERSION = "1.0.0"

# CORS Configuration
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

# Regional Center (Default: Hyderabad, Telangana, India)
DEFAULT_CENTER_LAT = 17.385044
DEFAULT_CENTER_LNG = 78.486671
DEFAULT_CITY = "Hyderabad"
DEFAULT_STATE = "Telangana"
DEFAULT_COUNTRY = "India"

# Deduplication Thresholds
DUPLICATE_DISTANCE_THRESHOLD_METERS = 500.0  # Proximity match within ~500 meters
DUPLICATE_TIME_WINDOW_HOURS = 2.0           # Time window within 2 hours

# Supported Categories
CATEGORIES = [
    "flood",
    "fire",
    "road_accident",
    "building_collapse",
    "medical_emergency",
    "gas_leak",
    "power_outage",
    "other"
]

# Severity Levels
SEVERITIES = ["critical", "high", "medium", "low"]

# Statuses
INCIDENT_STATUSES = ["new", "verified", "in_progress", "resolved", "closed"]
VERIFICATION_STATUSES = ["unverified", "community_verified", "official_verified", "rejected"]
