import threading
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any

from models import (
    Report,
    Incident,
    IncidentLocation,
    IncidentUpdate,
    DashboardStats
)
from services.geo_service import is_in_bounds


class InMemoryDatabase:
    """
    Thread-safe in-memory database store for RapidAid AI.
    Holds emergency reports, incidents, and activity audit logs.
    """
    def __init__(self):
        self._lock = threading.RLock()
        self.reports: Dict[str, Report] = {}
        self.incidents: Dict[str, Incident] = {}
        self.activities: List[Dict[str, Any]] = []

    def record_activity(self, action: str, entity_type: str, entity_id: str, details: str):
        """Records an operational audit activity."""
        with self._lock:
            activity = {
                "id": f"ACT-{len(self.activities) + 1}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "details": details
            }
            self.activities.append(activity)
            # Keep the last 100 activities
            if len(self.activities) > 100:
                self.activities.pop(0)

    # ------------------ Reports ------------------

    def add_report(self, report: Report) -> Report:
        with self._lock:
            self.reports[report.id] = report
            self.record_activity(
                action="report_submitted",
                entity_type="report",
                entity_id=report.id,
                details=f"New report received for category '{report.category or 'general'}'"
            )
            return report

    def get_report(self, report_id: str) -> Optional[Report]:
        with self._lock:
            return self.reports.get(report_id)

    def get_all_reports(self, incident_id: Optional[str] = None) -> List[Report]:
        with self._lock:
            all_r = list(self.reports.values())
            if incident_id:
                return [r for r in all_r if r.incident_id == incident_id]
            # Sorted newest first
            return sorted(all_r, key=lambda x: x.created_at, reverse=True)

    # ------------------ Incidents ------------------

    def add_incident(self, incident: Incident) -> Incident:
        with self._lock:
            self.incidents[incident.id] = incident
            self.record_activity(
                action="incident_created",
                entity_type="incident",
                entity_id=incident.id,
                details=f"Created {incident.severity.upper()} incident '{incident.title}'"
            )
            return incident

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        with self._lock:
            return self.incidents.get(incident_id)

    def get_all_incidents(
        self,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        min_lat: Optional[float] = None,
        max_lat: Optional[float] = None,
        min_lng: Optional[float] = None,
        max_lng: Optional[float] = None
    ) -> List[Incident]:
        with self._lock:
            results = []
            for inc in self.incidents.values():
                if category and inc.category != category:
                    continue
                if severity and inc.severity != severity:
                    continue
                if status and inc.status != status:
                    continue
                if not is_in_bounds(
                    inc.location.latitude,
                    inc.location.longitude,
                    min_lat,
                    max_lat,
                    min_lng,
                    max_lng
                ):
                    continue
                results.append(inc)

            # Sort by severity urgency (critical > high > medium > low), then latest update
            severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
            results.sort(
                key=lambda x: (
                    severity_order.get(x.severity, 4),
                    x.last_updated
                ),
                reverse=False
            )
            return results

    def update_incident(self, incident_id: str, update_data: IncidentUpdate) -> Optional[Incident]:
        with self._lock:
            incident = self.incidents.get(incident_id)
            if not incident:
                return None

            now_iso = datetime.now(timezone.utc).isoformat()
            changes = []

            if update_data.status is not None and update_data.status != incident.status:
                changes.append(f"Status changed from {incident.status} to {update_data.status}")
                incident.status = update_data.status

            if update_data.notes is not None:
                incident.notes = update_data.notes
                changes.append("Notes updated")

            if update_data.assigned_to is not None:
                incident.assigned_to = update_data.assigned_to
                changes.append(f"Assigned to {update_data.assigned_to}")

            if update_data.verification_status is not None:
                incident.verification_status = update_data.verification_status
                changes.append(f"Verification updated to {update_data.verification_status}")

            if update_data.severity is not None:
                incident.severity = update_data.severity
                changes.append(f"Severity adjusted to {update_data.severity}")

            if update_data.hazards is not None:
                incident.hazards = update_data.hazards
                changes.append("Hazards modified")

            incident.last_updated = now_iso
            self.incidents[incident_id] = incident

            if changes:
                self.record_activity(
                    action="incident_updated",
                    entity_type="incident",
                    entity_id=incident_id,
                    details="; ".join(changes)
                )

            return incident

    def attach_report_to_incident(
        self,
        incident_id: str,
        report_id: str,
        new_summary: Optional[str] = None,
        new_severity: Optional[str] = None,
        new_explanation: Optional[str] = None,
        new_hazards: Optional[List[str]] = None,
        affected_people: Optional[str] = None
    ) -> Optional[Incident]:
        """
        Attaches a report to an existing incident and recalculates incident metrics.
        """
        with self._lock:
            incident = self.incidents.get(incident_id)
            if not incident:
                return None

            if report_id not in incident.reports:
                incident.reports.append(report_id)
                incident.report_count = len(incident.reports)

            # Update report object's incident_id
            if report_id in self.reports:
                self.reports[report_id].incident_id = incident_id

            if new_summary:
                incident.ai_summary = new_summary
            if new_severity:
                incident.severity = new_severity
            if new_explanation:
                incident.ai_priority_explanation = new_explanation
            if new_hazards:
                merged_hazards = list(dict.fromkeys(incident.hazards + new_hazards))
                incident.hazards = merged_hazards[:6]
            if affected_people and not incident.affected_people_estimate:
                incident.affected_people_estimate = affected_people

            incident.last_updated = datetime.now(timezone.utc).isoformat()
            self.incidents[incident_id] = incident

            self.record_activity(
                action="report_correlated",
                entity_type="incident",
                entity_id=incident_id,
                details=f"Correlated new report '{report_id}' with incident '{incident.title}'"
            )
            return incident

    # ------------------ Dashboard Stats ------------------

    def get_dashboard_stats(self) -> DashboardStats:
        with self._lock:
            incidents_list = list(self.incidents.values())
            total_incidents = len(incidents_list)
            critical_count = sum(1 for i in incidents_list if i.severity == "critical")
            active_count = sum(1 for i in incidents_list if i.status in ["new", "verified", "in_progress"])
            resolved_count = sum(1 for i in incidents_list if i.status in ["resolved", "closed"])
            total_reports = len(self.reports)

            incidents_by_category: Dict[str, int] = {}
            for inc in incidents_list:
                incidents_by_category[inc.category] = incidents_by_category.get(inc.category, 0) + 1

            incidents_by_severity: Dict[str, int] = {}
            for inc in incidents_list:
                incidents_by_severity[inc.severity] = incidents_by_severity.get(inc.severity, 0) + 1

            # Recent activity feed
            recent_act = list(reversed(self.activities))[:15]

            return DashboardStats(
                total_incidents=total_incidents,
                critical_count=critical_count,
                active_count=active_count,
                resolved_count=resolved_count,
                total_reports=total_reports,
                incidents_by_category=incidents_by_category,
                incidents_by_severity=incidents_by_severity,
                recent_activity=recent_act
            )

    def get_recent_activity(self, limit: int = 15) -> List[Dict[str, Any]]:
        with self._lock:
            return list(reversed(self.activities))[:limit]

    # ------------------ Seed Data ------------------

    def seed_data(self):
        """Populates the in-memory database with realistic demo data for Hyderabad."""
        with self._lock:
            # Avoid re-seeding if data already exists
            if self.incidents:
                return

            now = datetime.now(timezone.utc)
            t_now_str = now.isoformat()
            t_10m_ago = (now - timedelta(minutes=10)).isoformat()
            t_15m_ago = (now - timedelta(minutes=15)).isoformat()
            t_20m_ago = (now - timedelta(minutes=20)).isoformat()
            t_30m_ago = (now - timedelta(minutes=30)).isoformat()
            t_45m_ago = (now - timedelta(minutes=45)).isoformat()
            t_1h_ago = (now - timedelta(hours=1)).isoformat()
            t_2h_ago = (now - timedelta(hours=2)).isoformat()
            t_3h_ago = (now - timedelta(hours=3)).isoformat()

            # Seed Reports
            demo_reports = [
                # Incident 1 Reports (Flooding)
                Report(
                    id="RPT-HYD-001",
                    incident_id="RA-HYD-101",
                    text="Water level reached 4 feet in Al-Jubail Colony! People trapped on ground floor, need boats immediately.",
                    description="Water level reached 4 feet in Al-Jubail Colony! People trapped on ground floor, need boats immediately.",
                    latitude=17.3970,
                    longitude=78.4110,
                    category="flood",
                    image_url=None,
                    language="en",
                    reporter_name="Mohammed Rizwan",
                    reporter_phone="+91-98490-12345",
                    created_at=t_45m_ago,
                    ai_summary="AI Assessment: CRITICAL Flood. Trapped residents on ground floor due to 4ft water level.",
                    ai_extracted_details={
                        "category": "flood",
                        "severity": "critical",
                        "hazards": ["4ft deep fast flowing water", "Ground floor inundation", "Open storm drains"],
                        "affected_people": "Multiple families trapped",
                        "location_details": "Al-Jubail Colony, Tolichowki",
                        "summary": "Urgent boat rescue needed for residents trapped by rapid flood waters.",
                        "missing_info": ["Exact number of elderly/infants trapped"]
                    }
                ),
                Report(
                    id="RPT-HYD-002",
                    incident_id="RA-HYD-101",
                    text="వరద నీరు ఇళ్లలోకి వచ్చింది. ట్రాన్స్‌ఫార్మర్ నీటిలో మునిగిపోయింది, విద్యుత్ షాక్ ప్రమాదం ఉంది సహాయం చేయండి.",
                    description="వరద నీరు ఇళ్లలోకి వచ్చింది. ట్రాన్స్‌ఫార్మర్ నీటిలో మునిగిపోయింది, విద్యుత్ షాక్ ప్రమాదం ఉంది సహాయం చేయండి.",
                    latitude=17.3972,
                    longitude=78.4115,
                    category="flood",
                    image_url=None,
                    language="te",
                    reporter_name="Srinivas Rao",
                    reporter_phone="+91-99887-54321",
                    created_at=t_30m_ago,
                    ai_summary="AI Assessment: CRITICAL Flood. [Telugu Translated]: Flood water entered houses, transformer submerged with severe electrocution hazard.",
                    ai_extracted_details={
                        "category": "flood",
                        "severity": "critical",
                        "hazards": ["Submerged electrical transformer", "Electrocution threat", "Rising house water"],
                        "affected_people": "Local street residents",
                        "location_details": "Near Al-Jubail transformer pole",
                        "summary": "Submerged transformer requires immediate TSSPDCL power isolation.",
                        "missing_info": ["Status of main grid breaker trip"],
                        "translated_text": "[Translated from Telugu]: Flood water entered houses. Transformer submerged in water, electrical shock hazard present, please help."
                    }
                ),
                Report(
                    id="RPT-HYD-003",
                    incident_id="RA-HYD-101",
                    text="Tolichowki main road underpass completely inundated. Cars floating, traffic at total standstill.",
                    description="Tolichowki main road underpass completely inundated. Cars floating, traffic at total standstill.",
                    latitude=17.3965,
                    longitude=78.4105,
                    category="flood",
                    image_url=None,
                    language="en",
                    reporter_name="Kiran Kumar",
                    reporter_phone="+91-97000-88776",
                    created_at=t_15m_ago,
                    ai_summary="AI Assessment: HIGH Flood. Underpass inundated, floating vehicles blocking access.",
                    ai_extracted_details={
                        "category": "flood",
                        "severity": "high",
                        "hazards": ["Inundated underpass", "Submerged vehicles"],
                        "affected_people": "Stranded motorists",
                        "location_details": "Tolichowki underpass",
                        "summary": "Underpass blocked by deep flood waters preventing traffic movement.",
                        "missing_info": ["Emergency access alternate route"]
                    }
                ),

                # Incident 2 Reports (Accident)
                Report(
                    id="RPT-HYD-004",
                    incident_id="RA-HYD-102",
                    text="Major collision on PVNR Expressway near Pillar 134! RTC bus hit 2 cars, petrol spilling on the road, 4 people severely injured.",
                    description="Major collision on PVNR Expressway near Pillar 134! RTC bus hit 2 cars, petrol spilling on the road, 4 people severely injured.",
                    latitude=17.3820,
                    longitude=78.4350,
                    category="road_accident",
                    image_url=None,
                    language="en",
                    reporter_name="Vikram Varma",
                    reporter_phone="+91-91234-56789",
                    created_at=t_30m_ago,
                    ai_summary="AI Assessment: CRITICAL Road Accident. Bus and multi-car crash with fuel leak and 4 severe casualties.",
                    ai_extracted_details={
                        "category": "road_accident",
                        "severity": "critical",
                        "hazards": ["Fuel spillage on expressway", "Risk of fire", "Trapped victims in crushed car"],
                        "affected_people": "4 people severely injured",
                        "location_details": "PVNR Expressway Pillar 134",
                        "summary": "Multi-vehicle collision with severe injuries and fuel spillage fire hazard.",
                        "missing_info": ["Hydraulic cutter equipment needed"]
                    }
                ),
                Report(
                    id="RPT-HYD-005",
                    incident_id="RA-HYD-102",
                    text="Expressway traffic blocked completely towards Shamshabad Airport due to bus accident. Ambulance struggling to arrive through gridlock.",
                    description="Expressway traffic blocked completely towards Shamshabad Airport due to bus accident. Ambulance struggling to arrive through gridlock.",
                    latitude=17.3824,
                    longitude=78.4348,
                    category="road_accident",
                    image_url=None,
                    language="en",
                    reporter_name="Deepa Reddy",
                    reporter_phone="+91-94401-22334",
                    created_at=t_20m_ago,
                    ai_summary="AI Assessment: HIGH Road Accident. Complete corridor blockage towards airport, emergency vehicle passage hindered.",
                    ai_extracted_details={
                        "category": "road_accident",
                        "severity": "high",
                        "hazards": ["Traffic gridlock", "Hindered emergency transit"],
                        "affected_people": "Dozens of stranded commuters",
                        "location_details": "Expressway Mehdipatnam ramp",
                        "summary": "Corridor gridlock delaying medical assistance to crash scene.",
                        "missing_info": ["Traffic police clearance on wrong-way lane"]
                    }
                ),

                # Incident 3 Reports (Fire)
                Report(
                    id="RPT-HYD-006",
                    incident_id="RA-HYD-103",
                    text="Thick black smoke and flames coming out from 2nd floor coaching centre at Maitrivanam Ameerpet. Students running down stairs.",
                    description="Thick black smoke and flames coming out from 2nd floor coaching centre at Maitrivanam Ameerpet. Students running down stairs.",
                    latitude=17.4375,
                    longitude=78.4482,
                    category="fire",
                    image_url=None,
                    language="en",
                    reporter_name="Arun Prasad",
                    reporter_phone="+91-98765-43210",
                    created_at=t_1h_ago,
                    ai_summary="AI Assessment: HIGH Fire. Commercial building 2nd floor blaze with dense smoke and evacuation.",
                    ai_extracted_details={
                        "category": "fire",
                        "severity": "high",
                        "hazards": ["Dense toxic smoke inhalation", "Stampede risk in narrow staircase", "Electrical wiring fire"],
                        "affected_people": "60+ students evacuating",
                        "location_details": "Maitrivanam Complex, Ameerpet",
                        "summary": "Coaching institute electrical fire with active evacuation.",
                        "missing_info": ["Any students trapped on upper floors"]
                    }
                ),

                # Incident 4 Reports (Building Collapse)
                Report(
                    id="RPT-HYD-007",
                    incident_id="RA-HYD-104",
                    text="Old heritage building boundary wall collapsed into the alley in Moghalpura near Purani Haveli. Two pedestrians caught under bricks.",
                    description="Old heritage building boundary wall collapsed into the alley in Moghalpura near Purani Haveli. Two pedestrians caught under bricks.",
                    latitude=17.3580,
                    longitude=78.4720,
                    category="building_collapse",
                    image_url=None,
                    language="en",
                    reporter_name="Syed Farooq",
                    reporter_phone="+91-93910-44556",
                    created_at=t_2h_ago,
                    ai_summary="AI Assessment: HIGH Building Collapse. Heritage wall collapse with 2 pedestrians injured under debris.",
                    ai_extracted_details={
                        "category": "building_collapse",
                        "severity": "high",
                        "hazards": ["Unstable adjoining wall", "Snapped overhead electrical cables", "Narrow alley obstruction"],
                        "affected_people": "2 pedestrians injured",
                        "location_details": "Purani Haveli Lane, Moghalpura",
                        "summary": "Heritage structure failure with pedestrian casualties requiring extrication.",
                        "missing_info": ["Stability of adjoining two-story structure"]
                    }
                ),

                # Incident 5 Reports (Gas Leak)
                Report(
                    id="RPT-HYD-008",
                    incident_id="RA-HYD-105",
                    text="Heavy pungent LPG gas smell spreading throughout Balanagar industrial area warehouse. Workers vomiting and suffocating.",
                    description="Heavy pungent LPG gas smell spreading throughout Balanagar industrial area warehouse. Workers vomiting and suffocating.",
                    latitude=17.4720,
                    longitude=78.4410,
                    category="gas_leak",
                    image_url=None,
                    language="en",
                    reporter_name="Rajesh Goud",
                    reporter_phone="+91-94901-77889",
                    created_at=t_15m_ago,
                    ai_summary="AI Assessment: CRITICAL Gas Leak. Toxic LPG concentration causing asphyxiation and acute explosion danger.",
                    ai_extracted_details={
                        "category": "gas_leak",
                        "severity": "critical",
                        "hazards": ["Combustible atmospheric gas mixture", "Toxic inhalation and chemical asphyxiation"],
                        "affected_people": "25 warehouse workers",
                        "location_details": "Balanagar Industrial Phase II",
                        "summary": "Hazardous LPG industrial storage leak requiring immediate 300m perimeter evacuation.",
                        "missing_info": ["Main tank valve shutoff location"]
                    }
                ),

                # Incident 6 Reports (Medical)
                Report(
                    id="RPT-HYD-009",
                    incident_id="RA-HYD-106",
                    text="Elderly man collapsed unconscious at KPHB metro station concourse. Possible cardiac arrest, staff administering CPR, ambulance needed ASAP!",
                    description="Elderly man collapsed unconscious at KPHB metro station concourse. Possible cardiac arrest, staff administering CPR, ambulance needed ASAP!",
                    latitude=17.4938,
                    longitude=78.3995,
                    category="medical_emergency",
                    image_url=None,
                    language="en",
                    reporter_name="Sneha Patil",
                    reporter_phone="+91-96520-33445",
                    created_at=t_15m_ago,
                    ai_summary="AI Assessment: CRITICAL Medical Emergency. Acute cardiac arrest at transit terminal requiring ALS ambulance.",
                    ai_extracted_details={
                        "category": "medical_emergency",
                        "severity": "critical",
                        "hazards": ["Cardiac arrest without advanced life support"],
                        "affected_people": "1 elderly male passenger",
                        "location_details": "KPHB Metro Station Concourse",
                        "summary": "Active CPR in progress, advanced cardiac resuscitation kit required urgently.",
                        "missing_info": ["Availability of station AED"]
                    }
                ),

                # Incident 7 Reports (Power Outage)
                Report(
                    id="RPT-HYD-010",
                    incident_id="RA-HYD-107",
                    text="Heavy tree branch fell on 11kV live electrical wire at Jubilee Hills Checkpost. Live wire is sparking on the road pavement.",
                    description="Heavy tree branch fell on 11kV live electrical wire at Jubilee Hills Checkpost. Live wire is sparking on the road pavement.",
                    latitude=17.4319,
                    longitude=78.4073,
                    category="power_outage",
                    image_url=None,
                    language="en",
                    reporter_name="Tarun Joshi",
                    reporter_phone="+91-91770-55667",
                    created_at=t_1h_ago,
                    ai_summary="AI Assessment: MEDIUM Power Outage. Snapped 11kV electrical wire actively sparking on pedestrian pavement.",
                    ai_extracted_details={
                        "category": "power_outage",
                        "severity": "medium",
                        "hazards": ["Live high-voltage electrocution risk", "Pavement arc sparks"],
                        "affected_people": "Pedestrians on Road No. 36",
                        "location_details": "Jubilee Hills Check Post",
                        "summary": "Exposed high voltage line on sidewalk cordoned off by local security.",
                        "missing_info": ["Feeder line shutdown confirmation"]
                    }
                ),

                # Incident 8 Reports (Resolved Flood)
                Report(
                    id="RPT-HYD-011",
                    incident_id="RA-HYD-108",
                    text="Musi river overflowing over Musarambagh bridge causeway. Water is rushing fast, car was stranded on bridge.",
                    description="Musi river overflowing over Musarambagh bridge causeway. Water is rushing fast, car was stranded on bridge.",
                    latitude=17.3700,
                    longitude=78.4900,
                    category="flood",
                    image_url=None,
                    language="en",
                    reporter_name="Anil Kumar",
                    reporter_phone="+91-99490-66778",
                    created_at=t_3h_ago,
                    ai_summary="AI Assessment: HIGH Flood. Musi river flood overtopping causeway with stranded vehicle.",
                    ai_extracted_details={
                        "category": "flood",
                        "severity": "high",
                        "hazards": ["Fast river current", "Submerged bridge road"],
                        "affected_people": "3 occupants in stranded car",
                        "location_details": "Musarambagh Causeway",
                        "summary": "Vehicle trapped by surging river current.",
                        "missing_info": ["River gauge water discharge rate"]
                    }
                )
            ]

            for r in demo_reports:
                self.reports[r.id] = r

            # Seed Incidents
            demo_incidents = [
                Incident(
                    id="RA-HYD-101",
                    title="Severe Urban Flooding & Submerged Colony",
                    category="flood",
                    severity="critical",
                    status="in_progress",
                    location=IncidentLocation(
                        latitude=17.3970,
                        longitude=78.4110,
                        address="Al-Jubail Colony, Near Tolichowki Flyover, Hyderabad, Telangana 500008",
                        landmarks=["Tolichowki Flyover", "Rethi Bowli Junction", "Galaxy Cinema"]
                    ),
                    reports=["RPT-HYD-001", "RPT-HYD-002", "RPT-HYD-003"],
                    report_count=3,
                    first_reported=t_45m_ago,
                    last_updated=t_15m_ago,
                    ai_summary="Consolidated Incident (3 citizen reports): High-threat inundation across Al-Jubail Colony with 4ft water depth. Multiple ground floor families trapped and a submerged power transformer poses catastrophic electrocution hazard. TSSPDCL requested for immediate grid cut-off.",
                    ai_priority_explanation="CRITICAL: Severe risk to human life from deep swirling waters combined with submerged electrical assets and trapped residents.",
                    hazards=[
                        "Submerged electrical transformer / electrocution hazard",
                        "Fast moving 4-foot deep flood water",
                        "Trapped occupants on ground floor",
                        "Inundated underpass blocking rescue craft entry"
                    ],
                    affected_people_estimate="15+ families stranded on ground floors",
                    missing_info=["Exact headcount of vulnerable elderly in lane 4", "Status of upstream drainage gate opening"],
                    verification_status="official_verified",
                    assigned_to="GHMC Disaster Response Force (DRF) Unit 4",
                    notes="DRF inflatable rescue dinghies deployed. TSSPDCL isolated Tolichowki 11kV feeder line."
                ),

                Incident(
                    id="RA-HYD-102",
                    title="Multi-Vehicle Collision with Fuel Spillage",
                    category="road_accident",
                    severity="critical",
                    status="in_progress",
                    location=IncidentLocation(
                        latitude=17.3820,
                        longitude=78.4350,
                        address="PVNR Expressway Pillar 134, Mehdipatnam, Hyderabad, Telangana 500028",
                        landmarks=["PVNR Expressway Pillar 134", "Sarojini Devi Eye Hospital", "Rythu Bazaar Mehdipatnam"]
                    ),
                    reports=["RPT-HYD-004", "RPT-HYD-005"],
                    report_count=2,
                    first_reported=t_30m_ago,
                    last_updated=t_20m_ago,
                    ai_summary="Consolidated Incident (2 citizen reports): Severe high-speed collision on elevated expressway involving an RTC bus and two passenger cars. 4 severe injuries with fuel leaking across both airport-bound lanes, causing 3km gridlock.",
                    ai_priority_explanation="CRITICAL: Severe trauma injuries coupled with flammable fuel spill on elevated highway with restricted emergency egress.",
                    hazards=[
                        "Fuel spillage on expressway pavement / explosion risk",
                        "Severe vehicular trauma with trapped occupants",
                        "Corridor gridlock delaying incoming ambulances"
                    ],
                    affected_people_estimate="4 injured (2 critical)",
                    missing_info=["Hydraulic spreader tool status from fire tender"],
                    verification_status="official_verified",
                    assigned_to="Traffic Police Mehdipatnam & 108 EMRI Trauma Team",
                    notes="Two ambulances reached scene via wrong-way escorted corridor. Fire tender applying foam blanket to fuel leak."
                ),

                Incident(
                    id="RA-HYD-103",
                    title="Commercial Complex Coaching Center Fire",
                    category="fire",
                    severity="high",
                    status="verified",
                    location=IncidentLocation(
                        latitude=17.4375,
                        longitude=78.4482,
                        address="Maitrivanam Commercial Complex, Ameerpet X Roads, Hyderabad, Telangana 500016",
                        landmarks=["Ameerpet Metro Interchange", "Maitrivanam", "Sarathi Studios"]
                    ),
                    reports=["RPT-HYD-006"],
                    report_count=1,
                    first_reported=t_1h_ago,
                    last_updated=t_45m_ago,
                    ai_summary="Verified Fire: 2nd floor coaching institute computer lab caught fire following short circuit. Intense black smoke filled primary stairwell. 60+ students evacuated safely by security staff.",
                    ai_priority_explanation="HIGH PRIORITY: Rapid smoke generation in densely occupied multi-story commercial education hub.",
                    hazards=[
                        "Toxic smoke inhalation hazard",
                        "Stairwell visibility impairment",
                        "Secondary electrical panel ignition"
                    ],
                    affected_people_estimate="60+ students evacuated; 3 treated on site for smoke",
                    missing_info=["Confirmation of complete upper-floor clear sweep"],
                    verification_status="community_verified",
                    assigned_to="Sanathnagar Fire Station Tender #2",
                    notes="Primary flames doused. Fire crew utilizing smoke exhaust fans on 2nd and 3rd floors."
                ),

                Incident(
                    id="RA-HYD-104",
                    title="Old Heritage Wall Collapse in Narrow Lane",
                    category="building_collapse",
                    severity="high",
                    status="verified",
                    location=IncidentLocation(
                        latitude=17.3580,
                        longitude=78.4720,
                        address="Purani Haveli Lane, Moghalpura Heritage Quarter, Old City, Hyderabad 500002",
                        landmarks=["Moghalpura Fire Station", "Salar Jung Museum", "Purani Haveli"]
                    ),
                    reports=["RPT-HYD-007"],
                    report_count=1,
                    first_reported=t_2h_ago,
                    last_updated=t_1h_ago,
                    ai_summary="Verified Structural Collapse: Masonry wall of 90-year-old unoccupied heritage haveli collapsed into a bustling pedestrian alley. 2 pedestrians sustained limb fractures.",
                    ai_priority_explanation="HIGH PRIORITY: Narrow alleyway blocked with secondary risk of overhead electrical wire pull-down and adjacent wall instability.",
                    hazards=[
                        "Unstable adjoining brick facade",
                        "Entangled low-hanging electrical supply cables",
                        "Restricted rescue vehicle access in narrow lane"
                    ],
                    affected_people_estimate="2 pedestrians injured (hospitalized)",
                    missing_info=["Structural audit clearance for remaining haveli wall"],
                    verification_status="official_verified",
                    assigned_to="South Zone Fire & Rescue Taskforce",
                    notes="Injured persons transported to Osmania General Hospital. Alley cordoned off with caution tape."
                ),

                Incident(
                    id="RA-HYD-105",
                    title="Industrial LPG Chemical Vapor Leak",
                    category="gas_leak",
                    severity="critical",
                    status="new",
                    location=IncidentLocation(
                        latitude=17.4720,
                        longitude=78.4410,
                        address="Phase II Industrial Corridor, Balanagar, Hyderabad, Telangana 500037",
                        landmarks=["Balanagar X Roads", "HAL Complex", "IDPL Colony"]
                    ),
                    reports=["RPT-HYD-008"],
                    report_count=1,
                    first_reported=t_15m_ago,
                    last_updated=t_15m_ago,
                    ai_summary="AI Assessment: CRITICAL Gas Leak. Dense cloud of escaping LPG reported from bulk cylinder decanting facility. Workers experiencing acute respiratory distress.",
                    ai_priority_explanation="CRITICAL: Severe risk of explosive vapor cloud ignition in active industrial zone; immediate 300-meter safety perimeter required.",
                    hazards=[
                        "Flammable explosive gas cloud",
                        "Asphyxiation and inhalation poisoning hazard",
                        "Adjacent industrial electrical sources"
                    ],
                    affected_people_estimate="25 warehouse personnel (evacuated to windward)",
                    missing_info=["Distance to nearest open flame or boiler unit", "Exact capacity of leaking tank"],
                    verification_status="unverified",
                    assigned_to="Hazmat Quick Response Team (HQ)",
                    notes="Automated siren sounded. Balanagar police sealing entry access roads."
                ),

                Incident(
                    id="RA-HYD-106",
                    title="Platform Medical Emergency - Sudden Cardiac Arrest",
                    category="medical_emergency",
                    severity="critical",
                    status="in_progress",
                    location=IncidentLocation(
                        latitude=17.4938,
                        longitude=78.3995,
                        address="KPHB Colony Metro Station Concourse, Pillar 742, Kukatpally, Hyderabad 500072",
                        landmarks=["KPHB Metro Station", "Forum Sujana Mall", "JNTU Hyderabad"]
                    ),
                    reports=["RPT-HYD-009"],
                    report_count=1,
                    first_reported=t_15m_ago,
                    last_updated=t_10m_ago,
                    ai_summary="AI Assessment: CRITICAL Medical Emergency. 62-year-old male passenger collapsed with no pulse. High-quality bystander CPR underway by trained station controller.",
                    ai_priority_explanation="CRITICAL: Sudden cardiac arrest with survival timeline diminishing every minute without advanced defibrillation.",
                    hazards=[
                        "Time-critical patient deterioration",
                        "Public crowding around medical scene"
                    ],
                    affected_people_estimate="1 elderly male passenger",
                    missing_info=["AED shock delivery confirmation"],
                    verification_status="official_verified",
                    assigned_to="108 Advanced Cardiac Ambulance Medic 14",
                    notes="108 paramedic unit 3 minutes away from station entrance. Metro staff clearing elevator."
                ),

                Incident(
                    id="RA-HYD-107",
                    title="Snapped High-Voltage 11kV Overhead Cable",
                    category="power_outage",
                    severity="medium",
                    status="in_progress",
                    location=IncidentLocation(
                        latitude=17.4319,
                        longitude=78.4073,
                        address="Near Apollo Hospital Junction, Road No 36, Jubilee Hills, Hyderabad 500033",
                        landmarks=["Jubilee Hills Check Post", "Apollo Hospital", "Road No 36 Metro"]
                    ),
                    reports=["RPT-HYD-010"],
                    report_count=1,
                    first_reported=t_1h_ago,
                    last_updated=t_30m_ago,
                    ai_summary="Verified Electrical Incident: Tree branch sheared 11kV conductor which fell across footpath. Wire actively sparking against moist curbing.",
                    ai_priority_explanation="MEDIUM PRIORITY: High voltage shock hazard localized to sidewalk; security guard established initial cordon.",
                    hazards=[
                        "Live 11,000V electric arcing",
                        "Pedestrian foot-traffic exposure"
                    ],
                    affected_people_estimate="Zero injuries reported",
                    missing_info=["Substation lineman arrival time"],
                    verification_status="community_verified",
                    assigned_to="TSSPDCL Jubilee Hills Emergency Lineman Crew",
                    notes="Power trip confirmed at Jubilee Hills substation breaker 4. Repair crew on site."
                ),

                Incident(
                    id="RA-HYD-108",
                    title="Causeway Flooding at Musarambagh Bridge",
                    category="flood",
                    severity="high",
                    status="resolved",
                    location=IncidentLocation(
                        latitude=17.3700,
                        longitude=78.4900,
                        address="Musarambagh Causeway, Musi River Bank, Amberpet, Hyderabad 500036",
                        landmarks=["Musarambagh Bridge", "Musi River Bank", "Amberpet Causeway"]
                    ),
                    reports=["RPT-HYD-011"],
                    report_count=1,
                    first_reported=t_3h_ago,
                    last_updated=t_30m_ago,
                    ai_summary="Resolved Incident: Musi river overflowed causeway by 2 feet during peak dam discharge. Stranded sedan with 3 passengers successfully pulled to safety by DRF rope team.",
                    ai_priority_explanation="HIGH (Resolved): Life threat neutralized following successful riverine extrication.",
                    hazards=[
                        "Slippery silt and debris on road surface"
                    ],
                    affected_people_estimate="3 occupants rescued safely",
                    missing_info=[],
                    verification_status="official_verified",
                    assigned_to="Amberpet DRF Team & Hyderabad Traffic Police",
                    notes="River water level has receded below bridge deck. Silt cleared and vehicular movement restored safely."
                )
            ]

            for inc in demo_incidents:
                self.incidents[inc.id] = inc

            # Initial seed activity records
            self.activities = [
                {
                    "id": "ACT-1",
                    "timestamp": t_3h_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-108",
                    "details": "Musi river bridge overflow incident registered."
                },
                {
                    "id": "ACT-2",
                    "timestamp": t_2h_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-104",
                    "details": "Moghalpura heritage wall collapse registered."
                },
                {
                    "id": "ACT-3",
                    "timestamp": t_1h_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-103",
                    "details": "Maitrivanam commercial complex fire report received."
                },
                {
                    "id": "ACT-4",
                    "timestamp": t_45m_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-101",
                    "details": "Critical flood incident opened for Al-Jubail Colony, Tolichowki."
                },
                {
                    "id": "ACT-5",
                    "timestamp": t_30m_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-102",
                    "details": "Critical collision reported on PVNR Expressway Pillar 134."
                },
                {
                    "id": "ACT-6",
                    "timestamp": t_30m_ago,
                    "action": "report_correlated",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-101",
                    "details": "Report RPT-HYD-002 (Telugu) correlated with Tolichowki flood incident."
                },
                {
                    "id": "ACT-7",
                    "timestamp": t_20m_ago,
                    "action": "report_correlated",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-102",
                    "details": "Report RPT-HYD-005 (gridlock) correlated with expressway crash."
                },
                {
                    "id": "ACT-8",
                    "timestamp": t_15m_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-105",
                    "details": "Critical LPG industrial leak registered at Balanagar."
                },
                {
                    "id": "ACT-9",
                    "timestamp": t_15m_ago,
                    "action": "incident_created",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-106",
                    "details": "Critical cardiac emergency opened at KPHB metro station."
                },
                {
                    "id": "ACT-10",
                    "timestamp": t_30m_ago,
                    "action": "incident_updated",
                    "entity_type": "incident",
                    "entity_id": "RA-HYD-108",
                    "details": "Status changed from in_progress to resolved. Causeway cleared."
                }
            ]


# Global singleton instance
db = InMemoryDatabase()
