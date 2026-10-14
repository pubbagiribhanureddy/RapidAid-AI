import math
from typing import List, Tuple, Dict, Any, Optional

# Earth's mean radius in meters
EARTH_RADIUS_METERS = 6371000.0

# Curated reference points for Hyderabad and surrounding Telangana areas
HYDERABAD_LOCALITIES = [
    {
        "name": "Hitec City / Cyber Towers",
        "locality": "Hitec City",
        "area": "Madhapur",
        "pincode": "500081",
        "lat": 17.4504,
        "lon": 78.3808,
        "landmarks": ["Cyber Towers", "Mindspace IT Park", "Inorbit Mall"]
    },
    {
        "name": "Banjara Hills Road No. 12",
        "locality": "Banjara Hills",
        "area": "Central Hyderabad",
        "pincode": "500034",
        "lat": 17.4156,
        "lon": 78.4350,
        "landmarks": ["Care Hospital", "Taj Krishna", "City Center Mall"]
    },
    {
        "name": "Jubilee Hills Checkpost",
        "locality": "Jubilee Hills",
        "area": "West Hyderabad",
        "pincode": "500033",
        "lat": 17.4319,
        "lon": 78.4073,
        "landmarks": ["Jubilee Hills Check Post", "Apollo Hospital", "Road No 36 Metro"]
    },
    {
        "name": "Charminar Heritage Zone",
        "locality": "Old City",
        "area": "South Hyderabad",
        "pincode": "500002",
        "lat": 17.3616,
        "lon": 78.4747,
        "landmarks": ["Charminar Monument", "Mecca Masjid", "Laad Bazaar"]
    },
    {
        "name": "Begumpet Airport Road",
        "locality": "Begumpet",
        "area": "North-Central Hyderabad",
        "pincode": "500016",
        "lat": 17.4447,
        "lon": 78.4664,
        "landmarks": ["Old Airport Terminal", "Begumpet Railway Station", "Prakas Nagar Metro"]
    },
    {
        "name": "Secunderabad Railway Station",
        "locality": "Secunderabad",
        "area": "Twin Cities",
        "pincode": "500003",
        "lat": 17.4344,
        "lon": 78.5013,
        "landmarks": ["Secunderabad Junction", "Clock Tower", "St. Ann's High School"]
    },
    {
        "name": "Gachibowli Financial District",
        "locality": "Gachibowli",
        "area": "Cyberabad",
        "pincode": "500032",
        "lat": 17.4401,
        "lon": 78.3489,
        "landmarks": ["Gachibowli Stadium", "ISB Campus", "Wipro Circle"]
    },
    {
        "name": "Kukatpally KPHB Colony",
        "locality": "Kukatpally",
        "area": "North-West Hyderabad",
        "pincode": "500072",
        "lat": 17.4938,
        "lon": 78.3995,
        "landmarks": ["KPHB Metro Station", "Forum Sujana Mall", "JNTU Hyderabad"]
    },
    {
        "name": "Mehdipatnam / PVNR Expressway",
        "locality": "Mehdipatnam",
        "area": "South-West Hyderabad",
        "pincode": "500028",
        "lat": 17.3916,
        "lon": 78.4398,
        "landmarks": ["PVNR Expressway Pillar 80", "Rythu Bazaar", "Sarojini Devi Eye Hospital"]
    },
    {
        "name": "Tolichowki / Al-Jubail",
        "locality": "Tolichowki",
        "area": "South-West Hyderabad",
        "pincode": "500008",
        "lat": 17.3970,
        "lon": 78.4110,
        "landmarks": ["Tolichowki Flyover", "Rethi Bowli Junction", "Galaxy Cinema"]
    },
    {
        "name": "Ameerpet Metro Junction",
        "locality": "Ameerpet",
        "area": "Central Hyderabad",
        "pincode": "500016",
        "lat": 17.4375,
        "lon": 78.4482,
        "landmarks": ["Ameerpet Metro Interchange", "Maitrivanam", "Sarathi Studios"]
    },
    {
        "name": "Dilsukhnagar Main Road",
        "locality": "Dilsukhnagar",
        "area": "East Hyderabad",
        "pincode": "500060",
        "lat": 17.3688,
        "lon": 78.5247,
        "landmarks": ["Dilsukhnagar Metro Station", "Sai Baba Temple", "Konark Theatre"]
    },
    {
        "name": "LB Nagar Ring Road Circle",
        "locality": "LB Nagar",
        "area": "East Hyderabad",
        "pincode": "500074",
        "lat": 17.3457,
        "lon": 78.5522,
        "landmarks": ["LB Nagar Metro Terminal", "Outer Ring Road Junction", "Kamineni Hospital"]
    },
    {
        "name": "Hussain Sagar Tank Bund",
        "locality": "Tank Bund",
        "area": "Central Hyderabad",
        "pincode": "500029",
        "lat": 17.4239,
        "lon": 78.4738,
        "landmarks": ["Buddha Statue", "Sanjeevaiah Park", "Secretariat"]
    },
    {
        "name": "Musarambagh Musi River Bridge",
        "locality": "Musarambagh",
        "area": "Old City Outskirts",
        "pincode": "500036",
        "lat": 17.3700,
        "lon": 78.4900,
        "landmarks": ["Musarambagh Bridge", "Musi River Bank", "Amberpet Causeway"]
    },
    {
        "name": "Balanagar Industrial Corridor",
        "locality": "Balanagar",
        "area": "North Hyderabad",
        "pincode": "500037",
        "lat": 17.4720,
        "lon": 78.4410,
        "landmarks": ["Balanagar X Roads", "HAL Complex", "IDPL Colony"]
    },
    {
        "name": "Koti Sultan Bazaar",
        "locality": "Koti",
        "area": "Central Hyderabad",
        "pincode": "500095",
        "lat": 17.3833,
        "lon": 78.4833,
        "landmarks": ["Koti Women's College", "Osmania Medical College", "Sultan Bazaar"]
    },
    {
        "name": "Moghalpura Heritage Quarter",
        "locality": "Moghalpura",
        "area": "Old City",
        "pincode": "500002",
        "lat": 17.3580,
        "lon": 78.4720,
        "landmarks": ["Moghalpura Fire Station", "Salar Jung Museum", "Purani Haveli"]
    }
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in meters.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    
    # Avoid numerical instability with values slightly greater than 1.0
    c = 2.0 * math.atan2(math.sqrt(min(1.0, a)), math.sqrt(max(0.0, 1.0 - a)))
    return EARTH_RADIUS_METERS * c


def get_closest_reference_locality(lat: float, lon: float) -> Tuple[Dict[str, Any], float]:
    """
    Finds the closest locality from the predefined Hyderabad reference points.
    Returns (locality_dict, distance_in_meters).
    """
    best_loc = HYDERABAD_LOCALITIES[0]
    min_dist = float('inf')

    for loc in HYDERABAD_LOCALITIES:
        dist = haversine_distance(lat, lon, loc["lat"], loc["lon"])
        if dist < min_dist:
            min_dist = dist
            best_loc = loc

    return best_loc, min_dist


def reverse_geocode_simple(lat: float, lon: float) -> str:
    """
    Returns a realistic simulated address string based on coordinates.
    """
    closest, dist_m = get_closest_reference_locality(lat, lon)
    
    if dist_m < 150:
        return f"{closest['name']}, {closest['locality']}, Hyderabad, Telangana {closest['pincode']}"
    elif dist_m < 800:
        dist_str = f"{int(dist_m)}m"
        return f"Approx {dist_str} from {closest['landmarks'][0]}, {closest['locality']}, Hyderabad {closest['pincode']}"
    elif dist_m < 3000:
        km = round(dist_m / 1000.0, 1)
        return f"Approx {km} km from {closest['locality']}, {closest['area']}, Hyderabad {closest['pincode']}"
    else:
        return f"Coordinates ({lat:.4f}, {lon:.4f}), Greater Hyderabad Area, Telangana, India"


def get_nearby_landmarks(lat: float, lon: float) -> List[str]:
    """
    Returns a list of simulated landmark names near coordinates.
    """
    closest, dist_m = get_closest_reference_locality(lat, lon)
    landmarks = list(closest.get("landmarks", []))
    
    # Include distance-qualified landmark
    if dist_m < 500:
        landmarks.insert(0, f"Adjacent to {closest['name']}")
    elif dist_m < 1500:
        landmarks.insert(0, f"Near {closest['locality']} area")
        
    return landmarks[:3]


def is_in_bounds(lat: float, lon: float, min_lat: Optional[float], max_lat: Optional[float],
                 min_lng: Optional[float], max_lng: Optional[float]) -> bool:
    """
    Check if a coordinate is within a bounding box.
    """
    if min_lat is not None and lat < min_lat:
        return False
    if max_lat is not None and lat > max_lat:
        return False
    if min_lng is not None and lon < min_lng:
        return False
    if max_lng is not None and lon > max_lng:
        return False
    return True
