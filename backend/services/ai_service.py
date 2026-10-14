import re
from typing import Dict, Any, List, Optional, Tuple


# Keyword dictionaries for categorization
CATEGORY_KEYWORDS = {
    "flood": [
        "flood", "waterlogging", "rising water", "water level", "submerged",
        "inundated", "drowning", "drainage", "overflow", "musi", "water entered",
        "stagnant water", "flooding", "heavy rain water", "canals overflowing",
        "వరద", "నీళ్లు", "నీరు", "మునిగిపోయింది"
    ],
    "fire": [
        "fire", "smoke", "flames", "blaze", "burning", "explosion", "spark",
        "cylinder blast", "ash", "fire brigade", "burnt", "caught fire",
        "flame", "short circuit fire", "మంటలు", "కాలిపోతోంది", "పొగ"
    ],
    "road_accident": [
        "accident", "crash", "collision", "overturned", "hit and run", "vehicle",
        "bike", "car", "bus", "truck", "lorry", "auto", "traffic jam", "pedestrian",
        "pileup", "head-on", "two-wheeler", "scooter", "ప్రమాదం", "వాహనం", "ఢీకొంది"
    ],
    "building_collapse": [
        "collapse", "collapsed", "debris", "rubble", "cracked", "wall fell",
        "slab", "structural", "concrete", "pillars cracked", "roof collapse",
        "heritage wall", "భవనం కూలిపోయింది", "గోడ కూలింది"
    ],
    "medical_emergency": [
        "heart attack", "cardiac", "stroke", "unconscious", "bleeding", "severe injury",
        "pregnant", "ambulance", "breathing", "choking", "seizure", "cpr",
        "critical condition", "fainted", "head injury", "fracture",
        "స్పృహతప్పి", "తీవ్ర గాయాలు", "గుండెపోటు"
    ],
    "gas_leak": [
        "gas leak", "lpg", "chemical smell", "toxic", "cylinder leak", "suffocating",
        "pungent", "pipeline leak", "methane", "fumes", "gas cylinder",
        "గ్యాస్ లీక్", "వాసన"
    ],
    "power_outage": [
        "power outage", "blackout", "live wire", "electric pole", "transformer",
        "electrocution", "short circuit", "sparking wire", "high voltage wire",
        "wire snapped", "కరెంట్ పోయింది", "కరెంట్ తీగ", "ట్రాన్స్‌ఫార్మర్"
    ]
}

# Critical indicators
CRITICAL_INDICATORS = [
    "trapped", "stuck inside", "cannot escape", "buried", "unconscious",
    "severe injury", "bleeding profusely", "dead", "cardiac arrest", "not breathing",
    "critical", "fatal", "raging fire", "massive explosion", "submerged car with people",
    "submerged transformer", "electrocution", "electrical shock", "gas explosion",
    "చిక్కుకున్నారు", "స్పృహతప్పి", "గుండెపోటు", "తీవ్ర గాయాలు", "ట్రాన్స్‌ఫార్మర్", "విద్యుత్ షాక్"
]

HIGH_INDICATORS = [
    "spreading fast", "rising fast", "multiple injured", "fuel leak", "lpg leak",
    "live wire in water", "building shaking", "choking on smoke", "highway blocked",
    "heavy flow", "two floors", "water entered", "submerged", "stranded",
    "మంటలు వ్యాపిస్తున్నాయి", "నీరు పెరుగుతోంది", "మునిగిపోయింది", "ఇళ్లలోకి"
]

MEDIUM_INDICATORS = [
    "moderate waterlogging", "minor injury", "traffic stopped", "one lane blocked",
    "smoke without flames", "fallen branch", "knee deep water", "electric pole bent",
    "power cut", "water stagnation"
]

LOW_INDICATORS = [
    "minor damage", "fender bender", "clearing up", "under control", "ankle deep",
    "non-injury", "power flicker"
]

# Telugu to English translation mappings for realistic simulation
TELUGU_TRANSLATIONS = {
    "వరద": "flood / water inundation",
    "నీళ్లు": "water",
    "నీరు": "water",
    "మంటలు": "fire / high flames",
    "పొగ": "dense smoke",
    "ప్రమాదం": "accident / collision",
    "భవనం": "building",
    "కూలిపోయింది": "collapsed",
    "గాయపడ్డారు": "people injured",
    "స్పృహతప్పి": "unconscious",
    "సహాయం": "urgent assistance needed",
    "గ్యాస్ లీక్": "gas leak",
    "కరెంట్ తీగ": "live electrical wire",
    "ట్రాన్స్‌ఫార్మర్": "electrical transformer submerged",
    "విద్యుత్ షాక్": "electrical shock hazard",
    "మునిగిపోయింది": "submerged in water",
    "ఇళ్లలోకి": "water entered houses",
    "చిక్కుకున్నారు": "people trapped",
    "రోడ్డు": "road",
    "బస్సు": "bus",
    "కారు": "car"
}


def is_telugu_text(text: str) -> bool:
    """Detect if text contains Telugu Unicode characters."""
    return any('\u0C00' <= char <= '\u0C7F' for char in text)


def simulate_translation(text: str) -> str:
    """Translates Telugu text or provides simulated English translation."""
    if not is_telugu_text(text):
        return text

    detected_elements = []
    for telugu_word, en_trans in TELUGU_TRANSLATIONS.items():
        if telugu_word in text:
            detected_elements.append(en_trans)

    if detected_elements:
        core = ", ".join(detected_elements)
        return f"[Translated from Telugu]: Emergency situation reported regarding {core}. Original report: '{text}'"
    return f"[Translated from Telugu]: Emergency report submitted: '{text}'"


def classify_category(text: str, user_category: Optional[str] = None) -> str:
    """Classify the emergency category from text and optional user hint."""
    if user_category and user_category in CATEGORY_KEYWORDS:
        return user_category

    text_lower = text.lower()
    scores: Dict[str, int] = {cat: 0 for cat in CATEGORY_KEYWORDS}

    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                scores[cat] += 2

    best_cat = max(scores, key=lambda k: scores[k])
    if scores[best_cat] > 0:
        return best_cat

    # Fallback to user category if given, or 'other'
    return user_category if user_category else "other"


def extract_severity(text: str) -> Tuple[str, str]:
    """
    Evaluates severity score and returns (severity_level, explanation).
    Levels: critical, high, medium, low
    """
    text_lower = text.lower()
    score = 0
    reasons = []

    for word in CRITICAL_INDICATORS:
        if word.lower() in text_lower:
            score += 4
            reasons.append(f"Critical indicator detected: '{word}'")

    for word in HIGH_INDICATORS:
        if word.lower() in text_lower:
            score += 2
            reasons.append(f"High-threat factor present: '{word}'")

    for word in MEDIUM_INDICATORS:
        if word.lower() in text_lower:
            score += 1
            reasons.append(f"Moderate disruption factor: '{word}'")

    for word in LOW_INDICATORS:
        if word.lower() in text_lower:
            score -= 1

    if score >= 4:
        severity = "critical"
        explanation = (
            "Immediate life-safety hazard identified. "
            + (reasons[0] if reasons else "High-risk signals detected requiring immediate dispatch.")
        )
    elif score >= 2:
        severity = "high"
        explanation = (
            "Elevated urgency situation with potential for escalation. "
            + (reasons[0] if reasons else "Active threat detected.")
        )
    elif score >= 1:
        severity = "medium"
        explanation = "Moderate emergency requiring standard first-responder response."
    else:
        severity = "low"
        explanation = "Non-life-threatening situation, monitored for escalation or clearing."

    return severity, explanation


def extract_hazards(text: str, category: str) -> List[str]:
    """Identifies specific hazards mentioned or implied in the report."""
    text_lower = text.lower()
    hazards = []

    if any(k in text_lower for k in ["electric", "wire", "spark", "transformer", "current", "కరెంట్"]):
        hazards.append("Exposed live electrical wiring / electrocution risk")
    if any(k in text_lower for k in ["smoke", "suffocat", "chok", "fumes", "toxic", "పొగ"]):
        hazards.append("Toxic smoke inhalation danger")
    if any(k in text_lower for k in ["water", "flood", "submerge", "current", "flow", "నీరు"]):
        hazards.append("Fast-flowing water or submerged hidden hazards / open drains")
    if any(k in text_lower for k in ["fuel", "petrol", "diesel", "gas", "cylinder", "lpg", "గ్యాస్"]):
        hazards.append("Flammable liquid / gas combustion risk")
    if any(k in text_lower for k in ["collapse", "rubble", "crack", "falling", "debris", "కూలి"]):
        hazards.append("Structural instability and secondary falling debris")
    if any(k in text_lower for k in ["traffic", "jam", "blocked", "pileup", "expressway", "flyover"]):
        hazards.append("Roadway blockage preventing emergency vehicle access")
    if any(k in text_lower for k in ["trapped", "stuck", "inside", "cannot get out", "చిక్కుకున్నారు"]):
        hazards.append("Trapped occupants requiring extrication or water rescue")

    # Category defaults if no specific keyword matched
    if not hazards:
        defaults = {
            "flood": ["Waterlogging obstructing pedestrian and vehicular transit"],
            "fire": ["Active flame spread and smoke contamination"],
            "road_accident": ["Secondary vehicle collisions on roadway"],
            "building_collapse": ["Structural instability in adjacent areas"],
            "gas_leak": ["Hazardous atmospheric vapor accumulation"],
            "power_outage": ["Loss of lighting and signaling systems"],
            "medical_emergency": ["Acute patient deterioration prior to medical transit"],
            "other": ["General situational hazards"]
        }
        hazards = defaults.get(category, ["Environmental hazard present"])

    return hazards[:4]


def extract_affected_people(text: str) -> Optional[str]:
    """Extracts mentions of affected, injured, or trapped people."""
    text_lower = text.lower()

    # Look for explicit digit counts
    num_match = re.search(r'(\d+)\s*(people|persons|passengers|victims|injured|trapped|families|workers)', text_lower)
    if num_match:
        return f"{num_match.group(1)} {num_match.group(2)}"

    word_numbers = {
        "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
        "several": "Several", "multiple": "Multiple", "many": "Multiple"
    }
    for word, count in word_numbers.items():
        if f"{word} people" in text_lower or f"{word} injured" in text_lower or f"{word} trapped" in text_lower:
            return f"{count} individuals reported"

    if "trapped" in text_lower:
        return "Occupants reported trapped (exact count unverified)"
    if "injured" in text_lower or "bleeding" in text_lower:
        return "Injuries reported at the scene"
    if "unconscious" in text_lower:
        return "1 or more unconscious individuals"

    return "No casualties reported yet"


def identify_missing_info(text: str, category: str) -> List[str]:
    """Identifies missing data points useful for dispatchers."""
    text_lower = text.lower()
    missing = []

    if not any(k in text_lower for k in ["floor", "apartment", "shop", "pillar", "gate", "landmark", "near", "opposite"]):
        missing.append("Precise landmark, floor, or building entrance location")

    if not re.search(r'\d+', text_lower) and not any(k in text_lower for k in ["no one", "0", "nobody", "driver"]):
        missing.append("Confirmed headcount of affected or injured individuals")

    if category in ["fire", "gas_leak", "power_outage"]:
        if not any(k in text_lower for k in ["shut off", "evacuated", "isolated", "main switch"]):
            missing.append("Status of utility shut-off (mains electricity / gas valves)")

    if category in ["flood", "road_accident"]:
        if not any(k in text_lower for k in ["ambulance arrived", "police", "fire engine", "towing", "boat"]):
            missing.append("Clearance of approach route for heavy emergency equipment")

    return missing[:3]


def generate_single_summary(text: str, category: str, severity: str) -> str:
    """Generates a concise AI summary for a single report."""
    clean_text = text.strip()
    if len(clean_text) > 140:
        clean_text = clean_text[:137] + "..."
    
    cat_title = category.replace("_", " ").title()
    return f"AI Assessment: {severity.upper()} {cat_title}. Citizen report: \"{clean_text}\""


def analyze_report(text: str, image_url: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
    """
    Main AI report analysis function.
    Simulates Google Gemini extraction of key incident details.
    """
    effective_text = text or ""
    translated = None

    if language.lower() == "te" or is_telugu_text(effective_text):
        translated = simulate_translation(effective_text)
        analysis_input = translated
    else:
        analysis_input = effective_text

    category = classify_category(analysis_input)
    severity, explanation = extract_severity(analysis_input)
    hazards = extract_hazards(analysis_input, category)
    affected_people = extract_affected_people(analysis_input)
    missing_info = identify_missing_info(analysis_input, category)
    summary = generate_single_summary(analysis_input, category, severity)

    # Extract location hints from text
    loc_hints = []
    for term in ["near", "opposite", "beside", "behind", "at", "road", "metro", "colony", "nagar", "junction"]:
        match = re.search(rf'{term}\s+([A-Za-z0-9\-\s]{{3,30}})', analysis_input, re.IGNORECASE)
        if match:
            loc_hints.append(f"{term.title()} {match.group(1).strip()}")
    location_details = ", ".join(loc_hints[:2]) if loc_hints else "GPS coordinates supplied by reporter"

    return {
        "category": category,
        "severity": severity,
        "priority_explanation": explanation,
        "hazards": hazards,
        "affected_people": affected_people,
        "location_details": location_details,
        "summary": summary,
        "missing_info": missing_info,
        "translated_text": translated,
        "image_analyzed": bool(image_url)
    }


def generate_incident_summary(incident_title: str, category: str, reports_data: List[Dict[str, Any]]) -> str:
    """
    Synthesizes multiple reports for an incident into a unified operational summary.
    """
    count = len(reports_data)
    cat_label = category.replace("_", " ").title()

    if count <= 1:
        single_text = reports_data[0].get("text", "") if reports_data else ""
        return f"Verified {cat_label} incident: {single_text}"

    # Collect distinct hazards
    all_hazards = set()
    for r in reports_data:
        for h in r.get("ai_extracted_details", {}).get("hazards", []):
            all_hazards.add(h)

    hazard_str = (
        f" Identified ongoing hazards include: {'; '.join(list(all_hazards)[:2])}."
        if all_hazards else ""
    )

    return (
        f"Consolidated Incident ({count} citizen reports received): Ongoing {cat_label} at {incident_title}."
        f"{hazard_str} Emergency responders have been notified with combined telemetry."
    )


def assess_priority(category: str, reports_data: List[Dict[str, Any]]) -> Tuple[str, str]:
    """
    Assesses priority based on accumulated report data.
    Returns (severity_level, explanation).
    """
    if not reports_data:
        return "medium", "Initial assessment pending field reports."

    highest_score = 0
    accumulated_signals = []

    severity_scores = {"critical": 4, "high": 3, "medium": 2, "low": 1}

    for r in reports_data:
        details = r.get("ai_extracted_details", {})
        sev = details.get("severity", "medium")
        highest_score = max(highest_score, severity_scores.get(sev, 2))
        
        # Check for multiple reports increasing urgency
        if len(reports_data) >= 3 and highest_score < 3:
            highest_score = 3
            accumulated_signals.append("High report volume (>3 reports) indicates escalating situation.")

    # Critical conditions
    if highest_score >= 4:
        return (
            "critical",
            f"CRITICAL: Life safety hazard confirmed through {len(reports_data)} emergency report(s). Immediate resource deployment required."
        )
    elif highest_score >= 3:
        return (
            "high",
            f"HIGH PRIORITY: Multi-faceted emergency with active threats reported. Coordinated response underway."
        )
    elif highest_score >= 2:
        return (
            "medium",
            f"MEDIUM PRIORITY: Localized emergency under observation. Standard operational response dispatched."
        )
    else:
        return (
            "low",
            "LOW PRIORITY: Minor incident with no immediate risk to human life."
        )
