import os
import json
import math
import requests
import time
import httpx
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Union
import swisseph as swe
import pytz
from dateutil import parser
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

# Remote API configuration
REMOTE_API_BASE_URL = os.getenv("REMOTE_API_BASE_URL")
REMOTE_API_KEY = os.getenv("REMOTE_API_KEY")

# Retry configuration
RETRY_DELAYS = [0.25, 0.5, 1.0]  # seconds
TIMEOUT = 20  # seconds

# Initialize Swiss Ephemeris
swe.set_ephe_path(os.getenv("EPHE_PATH", "/app/ephe"))

# Remote API client with retry logic
def call_remote_api(endpoint: str, method: str = "GET", data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
    """Call remote API with exponential backoff retry"""
    if not REMOTE_API_BASE_URL:
        raise HTTPException(status_code=500, detail="Remote API not configured")
    
    url = f"{REMOTE_API_BASE_URL.rstrip('/')}/{endpoint.lstrip('/')}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    if REMOTE_API_KEY:
        headers["X-API-Key"] = REMOTE_API_KEY
    
    for attempt, delay in enumerate(RETRY_DELAYS):
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
            else:
                response = requests.post(url, headers=headers, json=data, timeout=TIMEOUT)
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            if attempt == len(RETRY_DELAYS) - 1:  # Last attempt
                raise HTTPException(status_code=502, detail=f"Remote API error: {str(e)}")
            
            print(f"Remote API attempt {attempt + 1} failed, retrying in {delay}s...")
            time.sleep(delay)
    
    raise HTTPException(status_code=502, detail="Remote API unavailable")

async def check_remote_endpoint(client: httpx.AsyncClient, endpoint: str, timeout: float = 20.0) -> EndpointStatus:
    """Check a specific remote endpoint"""
    url = f"{REMOTE_API_BASE_URL.rstrip('/')}/{endpoint.lstrip('/')}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    if REMOTE_API_KEY:
        headers["X-API-Key"] = REMOTE_API_KEY
    
    try:
        start_time = time.time()
        response = await client.get(url, headers=headers, timeout=timeout)
        latency = (time.time() - start_time) * 1000
        
        return EndpointStatus(
            ok=response.status_code < 400,
            status=response.status_code,
            latencyMs=round(latency, 2)
        )
    except Exception as e:
        return EndpointStatus(
            ok=False,
            error=str(e),
            latencyMs=None
        )

async def diagnose_remote_api() -> RemoteDiagnostic:
    """Diagnose remote API connectivity"""
    if not REMOTE_API_BASE_URL:
        return RemoteDiagnostic(
            baseUrl="",
            ok=False,
            error="REMOTE_API_BASE_URL not configured",
            endpoints={}
        )
    
            # Test endpoints to check
        endpoints_to_test = [
            "/health/healthz",
            "/v1/panchanga/precise/daily",
            "/v1/ephemeris/planets"
        ]
    
    async with httpx.AsyncClient() as client:
        # Test base connectivity first
        base_start = time.time()
        try:
            base_response = await client.get(
                f"{REMOTE_API_BASE_URL.rstrip('/')}/health/healthz",
                timeout=20.0
            )
            base_latency = (time.time() - base_start) * 1000
            base_ok = base_response.status_code < 400
        except Exception as e:
            base_latency = None
            base_ok = False
        
        # Test individual endpoints
        endpoint_results = {}
        for endpoint in endpoints_to_test:
            result = await check_remote_endpoint(client, endpoint)
            endpoint_results[endpoint] = result
        
        return RemoteDiagnostic(
            baseUrl=REMOTE_API_BASE_URL,
            ok=base_ok,
            latencyMs=round(base_latency, 2) if base_latency else None,
            endpoints=endpoint_results
        )

def transform_remote_positions(remote_data: Dict) -> PositionsMonthResponse:
    """Transform remote API response to our contract"""
    try:
        # Transform the remote API response to match our expected format
        planets = []
        transitions = []
        
        if "planets" in remote_data:
            for planet_name, planet_data in remote_data["planets"].items():
                planet_info = {
                    "name": planet_name,
                    "days": []
                }
                
                # Create a single day entry for the planet
                if "nakshatra" in planet_data:
                    nakshatra_info = {
                        "index": planet_data["nakshatra"]["number"],
                        "nameIAST": planet_data["nakshatra"]["name"],
                        "pada": planet_data["nakshatra"]["pada"]
                    }
                    
                    day_info = {
                        "date": remote_data.get("timestamp", "2025-01-01").split("T")[0],
                        "nakshatra": nakshatra_info,
                        "signSidereal": planet_data.get("rasi", {}).get("name", ""),
                        "retrograde": False,  # Default value
                        "speed": 1.0  # Default value
                    }
                    
                    planet_info["days"].append(day_info)
                
                planets.append(planet_info)
        
        return PositionsMonthResponse(
            range={"startISO": "2025-01-01T00:00:00Z", "endISO": "2025-01-31T23:59:59Z"},
            planets=planets,
            transitions=transitions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transforming remote data: {str(e)}")

def transform_remote_panchanga(remote_data: Dict) -> PanchangaMonthResponse:
    """Transform remote API response to our contract"""
    try:
        # Transform the remote API response to match our expected format
        days = []
        
        if "panchanga" in remote_data:
            panchanga_data = remote_data["panchanga"]
            day_info = {
                "date": remote_data.get("date", "2025-01-01"),
                "tithi": {
                    "code": panchanga_data.get("tithi", {}).get("display", "K1"),
                    "group": "Nanda"  # Default value
                },
                "vara": panchanga_data.get("vara", {}).get("name", "Monday"),
                "nakshatra": {
                    "name": panchanga_data.get("nakshatra", {}).get("name", "Ashwini"),
                    "pada": 1  # Default value
                },
                "yoga": panchanga_data.get("yoga", {}).get("name", "Vishkumbha"),
                "karana": panchanga_data.get("karana", {}).get("name", "Bava"),
                "sunrise": remote_data.get("sunrise_time", "06:00:00"),
                "sunset": remote_data.get("sunset_time", "18:00:00"),
                "specialYogas": [],
                "recommendations": []
            }
            days.append(day_info)
        
        return PanchangaMonthResponse(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transforming remote data: {str(e)}")

app = FastAPI(
    title="Jyotish API",
    description="API for Vedic astrology calculations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "http://localhost:3000",  # Alternative local port
        "https://jyotish-content-manager.vercel.app",  # Main Vercel domain
        "https://jyotish-content-manager-5zmiphx2e-11jose11s-projects.vercel.app",  # Current deployment
        "https://jyotish-content-manager-17mlfqb6m-11jose11s-projects.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-q1j0djcof-11jose11s-projects.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-xccgfos13-11jose11s-projects.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-kyrgdgk5e-11jose11s-projects.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-3gexc8wrf-11jose11s-projects.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-l453usnu8-11jose11s-projects.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-BiwcYoJJEuNLGm2JCh3TAhXVAyUE.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-7oA7e2BeqZyLmazmhqQWTtMozxaf.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-F4TSxaQEBZLkBfsPBMwDuCFwiPPT.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-CRWMPK7W8wwZx1Z2CxPwjqdLDhPF.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-8yHi4SS6NwxiDgtkVemHbWB6XMpa.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-Co2gZpfDf3gxcAVcmz4ftitUUGCE.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-AoH6Lb1E1jK6xrrqqh7EmP6SNo2r.vercel.app",  # Previous deployment
        "https://jyotish-content-manager-pm68stg3n-11jose11s-projects.vercel.app",  # Previous deployment
        "*"  # Allow all origins for now (configure appropriately for production)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models for new endpoints
class PositionsMonthRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    timezone: str = Field(..., description="Timezone string like 'Asia/Kolkata'")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class NakshatraInfo(BaseModel):
    index: int = Field(..., ge=1, le=27)
    nameIAST: str
    pada: int = Field(..., ge=1, le=4)

class PlanetDay(BaseModel):
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    nakshatra: NakshatraInfo
    signSidereal: str
    retrograde: Optional[bool] = None
    speed: Optional[float] = None

class PlanetMonth(BaseModel):
    name: str = Field(..., pattern='^(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)$')
    days: List[PlanetDay]

class Transition(BaseModel):
    planet: str
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    from_nak: int = Field(..., ge=1, le=27, alias="from")
    to_nak: int = Field(..., ge=1, le=27, alias="to")
    
    model_config = {"populate_by_name": True}

class PositionsMonthResponse(BaseModel):
    range: Dict[str, str]
    planets: List[PlanetMonth]
    transitions: List[Transition]

class PanchangaMonthRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    timezone: str = Field(..., description="Timezone string like 'Asia/Kolkata'")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class TithiInfo(BaseModel):
    code: str
    group: str = Field(..., pattern='^(Nanda|Bhadra|Jaya|Rikta|Purna)$')

class SpecialYoga(BaseModel):
    name: str
    polarity: str = Field(..., pattern='^(auspicious|inauspicious)$')
    rule: str
    reason: str
    fulfilled_variables: Optional[Dict[str, Any]] = None

class PanchangaDay(BaseModel):
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    sunriseISO: str
    sunsetISO: str
    tithi: TithiInfo
    vara: str
    nakshatra: NakshatraInfo
    yoga: str
    karana: str
    specialYogas: List[SpecialYoga]

class PanchangaMonthResponse(BaseModel):
    days: List[PanchangaDay]

# Diagnostic models
class EndpointStatus(BaseModel):
    ok: bool
    status: Optional[int] = None
    error: Optional[str] = None
    latencyMs: Optional[float] = None

class RemoteDiagnostic(BaseModel):
    baseUrl: str
    ok: bool
    latencyMs: Optional[float] = None
    error: Optional[str] = None
    endpoints: Dict[str, EndpointStatus]

class BackendDiagnostic(BaseModel):
    ok: bool
    ts: str
    version: str = "1.0.0"
    ephemeris: bool = True

class DiagnosticResponse(BaseModel):
    backend: BackendDiagnostic
    remote: RemoteDiagnostic

class NavataraRequest(BaseModel):
    frame: Optional[str] = Field(None, pattern='^(moon|sun|lagna)$')
    scheme: Optional[int] = Field(None, ge=27, le=28)
    datetime: Optional[str] = None
    timezone: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    startNakshatraName: Optional[str] = None
    startNakshatraIndex: Optional[int] = Field(None, ge=1, le=28)
    lang: Optional[str] = Field(None, pattern='^(es|en)$')
    includeMetadata: Optional[bool] = False

class NavataraMapping(BaseModel):
    relPosition: int = Field(..., ge=1, le=27)
    cycle: int = Field(..., ge=1, le=3)
    loka: str
    group9: str
    groupDeity: str
    absolute: NakshatraInfo
    specialTaras: List[str]
    roleLabel: str
    roleSummary: Optional[str] = None

class NavataraResponse(BaseModel):
    frame: str
    scheme: int
    start: Dict[str, Any]
    lokas: List[str]
    groups9: List[str]
    mapping: List[NavataraMapping]
    metadata: Optional[Dict[str, Any]] = None

# Legacy models (keeping for backward compatibility)
class PositionResponse(BaseModel):
    planet: str
    longitude: float
    latitude: float
    speed: float
    house: int

class TithiInfoLegacy(BaseModel):
    name: str
    number: int
    paksha: str

class NakshatraInfoLegacy(BaseModel):
    name: str
    number: int

class PanchangaResponse(BaseModel):
    date: str
    tithi: TithiInfoLegacy
    vara: str
    nakshatra: NakshatraInfoLegacy
    yoga: str
    karana: str

class NavataraResponseLegacy(BaseModel):
    date: str
    birth_nakshatra: str
    current_nakshatra: str
    navatara_period: str
    navatara_number: int
    is_auspicious: bool
    recommendations: List[str]

class HealthResponse(BaseModel):
    status: str

# Planetary constants
PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,
    "Ketu": swe.MEAN_NODE,
}

NAKSHATRAS_IAST = [
    "Aśvinī", "Bharaṇī", "Kṛttikā", "Rohiṇī", "Mṛgaśira", "Ārdrā",
    "Punarvasu", "Puṣya", "Āśleṣā", "Maghā", "Pūrva Phalgunī", "Uttara Phalgunī",
    "Hasta", "Citrā", "Svātī", "Viśākhā", "Anurādhā", "Jyeṣṭhā",
    "Mūla", "Pūrva Āṣāḍhā", "Uttara Āṣāḍhā", "Śravaṇa", "Dhaniṣṭhā", "Śatabhiṣā",
    "Pūrva Bhādrapada", "Uttara Bhādrapada", "Revatī"
]

SIGNS_SIDEREAL = [
    "Meṣa", "Vṛṣabha", "Mithuna", "Karkaṭa", "Siṃha", "Kanyā",
    "Tulā", "Vṛścika", "Dhanu", "Makara", "Kumbha", "Mīna"
]

TITHI_GROUPS = {
    "Pratipada": "Nanda", "Dwitiya": "Nanda", "Tritiya": "Nanda",
    "Chaturthi": "Bhadra", "Panchami": "Bhadra", "Shashthi": "Bhadra",
    "Saptami": "Jaya", "Ashtami": "Jaya", "Navami": "Jaya",
    "Dashami": "Rikta", "Ekadashi": "Rikta", "Dwadashi": "Rikta",
    "Trayodashi": "Purna", "Chaturdashi": "Purna", "Purnima": "Purna",
    "Amavasya": "Purna"
}

# Load yoga rules
def load_yoga_rules():
    try:
        with open("data/yogas.rules.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Load panchanga recommendations
def load_panchanga_recommendations():
    try:
        with open("data/panchanga.recommendations.es.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# Load navatara data
def load_navatara_data():
    try:
        with open("data/navatara.es.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def julian_day(date_str: str, time_str: str = "12:00") -> float:
    """Convert date and time to Julian Day Number"""
    dt = parser.parse(f"{date_str} {time_str}")
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0)

def get_planet_position(planet_id: int, jd: float) -> dict:
    """Get planetary position"""
    result = swe.calc_ut(jd, planet_id)
    longitude = result[0][0]
    latitude = result[0][1]
    speed = result[0][3]
    
    # Calculate house (1-12)
    house = int(longitude / 30) + 1
    if house > 12:
        house = 12
    
    return {
        "longitude": longitude,
        "latitude": latitude,
        "speed": speed,
        "house": house
    }

def get_nakshatra(longitude: float) -> dict:
    """Get nakshatra from longitude using True Citra Paksha (Lahiri) ayanamsa"""
    # Apply Lahiri ayanamsa correction
    ayanamsa = swe.get_ayanamsa_ut(julian_day("2000-01-01"))
    corrected_longitude = (longitude - ayanamsa) % 360
    
    nakshatra_num = int(corrected_longitude * 27 / 360)
    pada = int((corrected_longitude * 27 / 360 - nakshatra_num) * 4) + 1
    
    # Ensure pada is within valid range
    if pada > 4:
        pada = 4
    
    return {
        "index": nakshatra_num + 1,
        "nameIAST": NAKSHATRAS_IAST[nakshatra_num],
        "pada": pada
    }

def get_sidereal_sign(longitude: float) -> str:
    """Get sidereal sign from longitude"""
    ayanamsa = swe.get_ayanamsa_ut(julian_day("2000-01-01"))
    corrected_longitude = (longitude - ayanamsa) % 360
    sign_num = int(corrected_longitude / 30)
    return SIGNS_SIDEREAL[sign_num]

def get_tithi(sun_long: float, moon_long: float) -> dict:
    """Get tithi from Sun and Moon longitudes"""
    diff = moon_long - sun_long
    if diff < 0:
        diff += 360
    
    tithi_num = int(diff * 30 / 360)
    # Ensure tithi_num is within valid range (0-29)
    tithi_num = tithi_num % 30
    
    # Get tithi names in order
    tithi_names = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
        "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
        "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya",
        "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami",
        "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ]
    
    tithi_name = tithi_names[tithi_num]
    
    return {
        "code": tithi_name,
        "group": TITHI_GROUPS[tithi_name]
    }

def get_yoga(sun_long: float, moon_long: float) -> str:
    """Get yoga from Sun and Moon longitudes"""
    total = (sun_long + moon_long) % 360
    yoga_num = int(total * 27 / 360)
    yogas = [
        "Viśkumbha", "Priti", "Āyuṣmān", "Saubhāgya", "Śobhana", "Atigaṇḍa",
        "Sukarman", "Dhṛti", "Śūla", "Gaṇḍa", "Vṛddhi", "Dhruva",
        "Vyāghāta", "Harṣaṇa", "Vajra", "Siddhi", "Vyatīpāta", "Variyan",
        "Parigha", "Śiva", "Siddha", "Sādhya", "Śubha", "Śukla",
        "Brahma", "Indra", "Vaidhṛti"
    ]
    return yogas[yoga_num]

def get_karana(tithi_num: int) -> str:
    """Get karana from tithi number"""
    karanas = [
        "Bava", "Bālava", "Kaulava", "Taitila", "Garija", "Vaṇija", "Viṣṭi",
        "Śakuni", "Catuṣpāda", "Nāga"
    ]
    
    if tithi_num <= 7:
        return karanas[tithi_num - 1]
    elif tithi_num <= 14:
        return karanas[tithi_num - 8]
    elif tithi_num <= 22:
        return karanas[tithi_num - 15]
    else:
        return karanas[tithi_num - 23]

def evaluate_yoga_rule(rule: str, context: dict) -> bool:
    """Safely evaluate yoga rule DSL"""
    # Simple rule parser - replace with proper DSL interpreter
    try:
        # Create a safe environment for evaluation
        safe_dict = {
            "vara": context.get("vara", ""),
            "tithiGroup": context.get("tithiGroup", ""),
            "nakshatraIndex": context.get("nakshatraIndex", 0)
        }
        
        # Normalize quotes and operators in the rule
        rule = rule.replace("'", '"')
        rule = rule.replace("&&", "and")
        rule = rule.replace("||", "or")
        
        # Safe evaluation with limited operations
        return eval(rule, {"__builtins__": {}}, safe_dict)
    except:
        return False

def get_month_dates(year: int, month: int) -> List[str]:
    """Get all dates in a month"""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)
    
    return dates

def call_remote_api(endpoint: str, params: dict) -> dict:
    """Call remote API if configured"""
    remote_url = os.getenv("REMOTE_API_BASE_URL")
    if not remote_url:
        return None
    
    try:
        response = requests.get(f"{remote_url}{endpoint}", params=params)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def transform_remote_positions(data: dict) -> PositionsMonthResponse:
    """Transform remote positions response to our contract"""
    planets_data = {}
    transitions = []
    
    for planet_name, planet_data in data.items():
        if planet_name == "Ketu":
            # Ketu is opposite to Rahu
            rahu_pos = get_planet_position(PLANETS[planet_name], julian_day("2000-01-01")) # Use a fixed date for Rahu
            ketu_long = (rahu_pos["longitude"] + 180) % 360
            nakshatra = get_nakshatra(ketu_long)
            sign = get_sidereal_sign(ketu_long)
            
            planet_day = PlanetDay(
                date="2000-01-01", # Placeholder date, will be replaced by actual date
                nakshatra=NakshatraInfo(**nakshatra),
                signSidereal=sign,
                retrograde=rahu_pos["speed"] < 0,
                speed=abs(rahu_pos["speed"])
            )
        else:
            pos = get_planet_position(PLANETS[planet_name], julian_day("2000-01-01")) # Use a fixed date for other planets
            nakshatra = get_nakshatra(pos["longitude"])
            sign = get_sidereal_sign(pos["longitude"])
            
            planet_day = PlanetDay(
                date="2000-01-01", # Placeholder date, will be replaced by actual date
                nakshatra=NakshatraInfo(**nakshatra),
                signSidereal=sign,
                retrograde=pos["speed"] < 0,
                speed=abs(pos["speed"])
            )
        
        planets_data[planet_name] = {"name": planet_name, "days": [planet_day]}
    
    # Detect transitions (simplified)
    for planet_name, planet_data in planets_data.items():
        for i in range(1, len(planet_data["days"])):
            prev_nak = planet_data["days"][i-1].nakshatra.index
            curr_nak = planet_data["days"][i].nakshatra.index
            if prev_nak != curr_nak:
                transitions.append(Transition(
                    planet=planet_name,
                    date="2000-01-01", # Placeholder date, will be replaced by actual date
                    from_nak=prev_nak,
                    to_nak=curr_nak
                ))
    
    return PositionsMonthResponse(
        range={"startISO": "2000-01-01T00:00:00Z", "endISO": "2000-01-31T23:59:59Z"}, # Placeholder range
        planets=list(planets_data.values()),
        transitions=transitions
    )

@app.get("/healthz", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/diagnostics/ping", response_model=DiagnosticResponse)
async def ping_diagnostics():
    """Complete end-to-end connectivity diagnostics"""
    # Check backend status
    backend_status = BackendDiagnostic(
        ok=True,
        ts=datetime.utcnow().isoformat(),
        version="1.0.0",
        ephemeris=os.path.exists(os.getenv("EPHE_PATH", "/app/ephe"))
    )
    
    # Check remote API status
    remote_status = await diagnose_remote_api()
    
    return DiagnosticResponse(
        backend=backend_status,
        remote=remote_status
    )

@app.get("/data/yogas")
async def get_yoga_rules():
    """Get yoga rules dataset"""
    return load_yoga_rules()

@app.get("/data/navatara.es")
async def get_navatara_data():
    """Get navatara dataset in Spanish"""
    return load_navatara_data()

@app.get("/data/panchanga/recommendations")
async def get_panchanga_recommendations():
    """Get panchanga recommendations dataset"""
    return load_panchanga_recommendations()

@app.post("/positions/month", response_model=PositionsMonthResponse)
async def get_positions_month(request: PositionsMonthRequest):
    """Get planetary positions for an entire month"""
    try:
        # Try remote API first if configured
        if REMOTE_API_BASE_URL:
            try:
                # Convert our request to the remote API format
                remote_params = {
                    "when_utc": f"{request.year}-{request.month:02d}-01T12:00:00Z",
                    "planets": "Sun,Moon,Mercury,Venus,Mars,Jupiter,Saturn,Rahu,Ketu"
                }
                remote_data = call_remote_api("v1/ephemeris/planets", "GET", params=remote_params)
                # Transform remote response to our contract
                return transform_remote_positions(remote_data)
            except HTTPException as e:
                print(f"Remote API failed, falling back to local calculation: {e.detail}")
                # Fall back to local calculation
        
        # Local calculation
        dates = get_month_dates(request.year, request.month)
        planets_data = {}
        transitions = []
        
        # Initialize planets
        for planet_name in PLANETS.keys():
            planets_data[planet_name] = {"name": planet_name, "days": []}
        
        # Calculate for each day
        for date_str in dates:
            jd = julian_day(date_str)
            
            for planet_name, planet_id in PLANETS.items():
                if planet_name == "Ketu":
                    # Ketu is opposite to Rahu
                    rahu_pos = get_planet_position(planet_id, jd)
                    ketu_long = (rahu_pos["longitude"] + 180) % 360
                    nakshatra = get_nakshatra(ketu_long)
                    sign = get_sidereal_sign(ketu_long)
                    
                    planet_day = PlanetDay(
                        date=date_str,
                        nakshatra=NakshatraInfo(**nakshatra),
                        signSidereal=sign,
                        retrograde=rahu_pos["speed"] < 0,
                        speed=abs(rahu_pos["speed"])
                    )
                else:
                    pos = get_planet_position(planet_id, jd)
                    nakshatra = get_nakshatra(pos["longitude"])
                    sign = get_sidereal_sign(pos["longitude"])
                    
                    planet_day = PlanetDay(
                        date=date_str,
                        nakshatra=NakshatraInfo(**nakshatra),
                        signSidereal=sign,
                        retrograde=pos["speed"] < 0,
                        speed=abs(pos["speed"])
                    )
                
                planets_data[planet_name]["days"].append(planet_day)
        
        # Detect transitions (simplified)
        for planet_name, planet_data in planets_data.items():
            for i in range(1, len(planet_data["days"])):
                prev_nak = planet_data["days"][i-1].nakshatra.index
                curr_nak = planet_data["days"][i].nakshatra.index
                if prev_nak != curr_nak:
                    transitions.append(Transition(
                        planet=planet_name,
                        date=planet_data["days"][i].date,
                        from_nak=prev_nak,
                        to_nak=curr_nak
                    ))
        
        return PositionsMonthResponse(
            range={"startISO": f"{dates[0]}T00:00:00Z", "endISO": f"{dates[-1]}T23:59:59Z"},
            planets=list(planets_data.values()),
            transitions=transitions
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/panchanga/month", response_model=PanchangaMonthResponse)
async def get_panchanga_month(request: PanchangaMonthRequest):
    """Get Panchanga for an entire month"""
    try:
        # Try remote API first if configured
        if REMOTE_API_BASE_URL:
            try:
                # Convert our request to the remote API format
                remote_params = {
                    "date": f"{request.year}-{request.month:02d}-01",
                    "latitude": request.latitude,
                    "longitude": request.longitude,
                    "reference_time": "sunrise"
                }
                remote_data = call_remote_api("v1/panchanga/precise/daily", "GET", params=remote_params)
                # Transform remote response to our contract
                return transform_remote_panchanga(remote_data)
            except HTTPException as e:
                print(f"Remote API failed, falling back to local calculation: {e.detail}")
                # Fall back to local calculation
        
        # Local calculation
        dates = get_month_dates(request.year, request.month)
        days_data = []
        yoga_rules = load_yoga_rules()
        
        for date_str in dates:
            jd = julian_day(date_str)
            
            # Get Sun and Moon positions
            sun_pos = get_planet_position(swe.SUN, jd)
            moon_pos = get_planet_position(swe.MOON, jd)
            
            # Calculate Panchanga elements
            tithi = get_tithi(sun_pos["longitude"], moon_pos["longitude"])
            nakshatra = get_nakshatra(moon_pos["longitude"])
            yoga = get_yoga(sun_pos["longitude"], moon_pos["longitude"])
            karana = get_karana(list(TITHI_GROUPS.keys()).index(tithi["code"]) + 1)
            
            # Get vara (day of week)
            dt = parser.parse(date_str)
            vara = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dt.weekday()]
            
            # Calculate sunrise/sunset (simplified)
            sunrise_iso = f"{date_str}T06:00:00Z"
            sunset_iso = f"{date_str}T18:00:00Z"
            
            # Evaluate special yogas
            special_yogas = []
            context = {
                "vara": vara,
                "tithiGroup": tithi["group"],
                "nakshatraIndex": nakshatra["index"]
            }
            
            for rule in yoga_rules:
                if evaluate_yoga_rule(rule["rule"], context):
                    # Add variables that fulfilled the rule
                    fulfilled_vars = {}
                    if "vara" in rule["rule"] and context["vara"] in rule["rule"]:
                        fulfilled_vars["vara"] = context["vara"]
                    if "tithiGroup" in rule["rule"] and context["tithiGroup"] in rule["rule"]:
                        fulfilled_vars["tithiGroup"] = context["tithiGroup"]
                    if "nakshatraIndex" in rule["rule"] and str(context["nakshatraIndex"]) in rule["rule"]:
                        fulfilled_vars["nakshatraIndex"] = context["nakshatraIndex"]
                    
                    yoga_data = {
                        "name": rule["name"],
                        "polarity": rule["polarity"],
                        "rule": rule["rule"],
                        "reason": rule["explain"],
                        "fulfilled_variables": fulfilled_vars
                    }
                    special_yogas.append(SpecialYoga(**yoga_data))
            
            panchanga_day = PanchangaDay(
                date=date_str,
                sunriseISO=sunrise_iso,
                sunsetISO=sunset_iso,
                tithi=TithiInfo(**tithi),
                vara=vara,
                nakshatra=NakshatraInfo(**nakshatra),
                yoga=yoga,
                karana=karana,
                specialYogas=special_yogas
            )
            
            days_data.append(panchanga_day)
        
        return PanchangaMonthResponse(days=days_data)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/navatara/calculate", response_model=NavataraResponse)
async def calculate_navatara(request: NavataraRequest):
    """Calculate Navatara with advanced options"""
    try:
        # Set defaults
        frame = request.frame or "moon"
        scheme = request.scheme or 27
        lang = request.lang or "en"
        
        # If frame is defined and we have datetime, try to get position from remote API
        if frame in ["moon", "sun", "lagna"] and request.datetime and REMOTE_API_BASE_URL:
            try:
                # Try remote API first
                remote_data = call_remote_api("navatara/calculate", "POST", request.model_dump())
                return NavataraResponse(**remote_data)
            except HTTPException:
                # Fall back to local calculation
                print(f"Remote API failed for navatara, using local calculation")
            except Exception as e:
                print(f"Error with remote API for navatara: {e}")
                # Continue with local calculation
        
        # Calculate start nakshatra
        if request.startNakshatraIndex:
            start_index = request.startNakshatraIndex
            start_name = NAKSHATRAS_IAST[start_index - 1]
        elif request.startNakshatraName:
            start_name = request.startNakshatraName
            start_index = NAKSHATRAS_IAST.index(start_name) + 1
        else:
            # Default to current moon nakshatra
            if request.datetime and request.latitude and request.longitude:
                jd = julian_day(request.datetime)
                moon_pos = get_planet_position(swe.MOON, jd)
                nakshatra = get_nakshatra(moon_pos["longitude"])
                start_index = nakshatra["index"]
                start_name = nakshatra["nameIAST"]
            else:
                start_index = 1
                start_name = NAKSHATRAS_IAST[0]
        
        # Generate mapping
        lokas = ["Bhu", "Bhuva", "Swarga"]
        groups9 = ["Deva", "Manushya", "Rakshasa"]
        mapping = []
        
        for i in range(27):
            rel_position = i + 1
            cycle = ((i + start_index - 1) // 9) % 3 + 1
            loka = lokas[i % 3]
            group9 = groups9[i % 3]
            group_deity = "Vishnu" if group9 == "Deva" else "Brahma" if group9 == "Manushya" else "Shiva"
            
            absolute_index = ((start_index - 1 + i) % 27) + 1
            absolute_name = NAKSHATRAS_IAST[absolute_index - 1]
            
            special_taras = []
            if absolute_index == 8:  # Pushya
                special_taras.append("Abhijit")
            
            role_label = f"Tara {rel_position}"
            role_summary = f"Position {rel_position} in {loka} loka"
            
            mapping.append(NavataraMapping(
                relPosition=rel_position,
                cycle=cycle,
                loka=loka,
                group9=group9,
                groupDeity=group_deity,
                absolute=NakshatraInfo(
                    index=absolute_index,
                    nameIAST=absolute_name,
                    pada=1
                ),
                specialTaras=special_taras,
                roleLabel=role_label,
                roleSummary=role_summary
            ))
        
        response_data = {
            "frame": frame,
            "scheme": scheme,
            "start": {
                "index": start_index,
                "nameIAST": start_name,
                "planetLord": "Moon"
            },
            "lokas": lokas,
            "groups9": groups9,
            "mapping": mapping
        }
        
        if request.includeMetadata:
            response_data["metadata"] = {
                "nakshatras": NAKSHATRAS_IAST,
                "roleLabels": [f"Tara {i+1}" for i in range(27)],
                "groupDeities": {
                    "Deva": "Vishnu",
                    "Manushya": "Brahma", 
                    "Rakshasa": "Shiva"
                },
                "specialTarasLegend": {
                    "Abhijit": "Special Tara for auspicious activities"
                }
            }
        
        return NavataraResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Legacy endpoints (keeping for backward compatibility)
@app.get("/positions", response_model=List[PositionResponse])
async def get_positions(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get planetary positions for a given date and location"""
    try:
        jd = julian_day(date)
        positions = []
        
        for planet_name, planet_id in PLANETS.items():
            if planet_name == "Ketu":
                # Ketu is opposite to Rahu
                rahu_pos = get_planet_position(planet_id, jd)
                ketu_long = (rahu_pos["longitude"] + 180) % 360
                positions.append(PositionResponse(
                    planet=planet_name,
                    longitude=ketu_long,
                    latitude=-rahu_pos["latitude"],
                    speed=rahu_pos["speed"],
                    house=int(ketu_long / 30) + 1
                ))
            else:
                pos = get_planet_position(planet_id, jd)
                positions.append(PositionResponse(
                    planet=planet_name,
                    longitude=pos["longitude"],
                    latitude=pos["latitude"],
                    speed=pos["speed"],
                    house=pos["house"]
                ))
        
        return positions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/panchanga", response_model=PanchangaResponse)
async def get_panchanga(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get Panchanga (five elements of time) for a given date and location"""
    try:
        jd = julian_day(date)
        
        # Get Sun and Moon positions
        sun_pos = get_planet_position(swe.SUN, jd)
        moon_pos = get_planet_position(swe.MOON, jd)
        
        # Calculate Panchanga elements
        tithi = get_tithi(sun_pos["longitude"], moon_pos["longitude"])
        nakshatra = get_nakshatra(moon_pos["longitude"])
        yoga = get_yoga(sun_pos["longitude"], moon_pos["longitude"])
        karana = get_karana(list(TITHI_GROUPS.keys()).index(tithi["code"]) + 1)
        
        # Get vara (day of week)
        dt = parser.parse(date)
        vara = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dt.weekday()]
        
        # Convert to legacy format
        tithi_legacy = {
            "name": tithi["code"],
            "number": list(TITHI_GROUPS.keys()).index(tithi["code"]) + 1,
            "paksha": "Shukla" if tithi["code"] in ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"] else "Krishna"
        }
        
        nakshatra_legacy = {
            "name": nakshatra["nameIAST"],
            "number": nakshatra["index"]
        }
        
        return PanchangaResponse(
            date=date,
            tithi=TithiInfoLegacy(**tithi_legacy),
            vara=vara,
            nakshatra=NakshatraInfoLegacy(**nakshatra_legacy),
            yoga=yoga,
            karana=karana
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/navatara/calculate", response_model=NavataraResponseLegacy)
async def calculate_navatara_legacy(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    birth_nakshatra: str = Query(..., description="Birth nakshatra")
):
    """Calculate Navatara for a given date, location, and birth nakshatra"""
    try:
        if birth_nakshatra not in NAKSHATRAS_IAST:
            raise HTTPException(status_code=400, detail="Invalid birth nakshatra")
        
        jd = julian_day(date)
        moon_pos = get_planet_position(swe.MOON, jd)
        current_nakshatra = get_nakshatra(moon_pos["longitude"])
        
        # Calculate navatara number
        birth_idx = NAKSHATRAS_IAST.index(birth_nakshatra)
        current_idx = current_nakshatra["index"] - 1
        diff = current_idx - birth_idx
        if diff < 0:
            diff += 27
        navatara_num = (diff % 9) + 1
        
        # Determine if auspicious
        auspicious_navataras = [1, 3, 5, 7, 9]
        is_auspicious = navatara_num in auspicious_navataras
        
        # Generate recommendations
        recommendations = []
        if is_auspicious:
            recommendations.extend([
                "Good time for starting new ventures",
                "Auspicious for ceremonies and rituals",
                "Favorable for important decisions"
            ])
        else:
            recommendations.extend([
                "Consider postponing important activities",
                "Focus on spiritual practices",
                "Avoid starting new projects"
            ])
        
        return NavataraResponseLegacy(
            date=date,
            birth_nakshatra=birth_nakshatra,
            current_nakshatra=current_nakshatra["nameIAST"],
            navatara_period=f"Navatara {navatara_num}",
            navatara_number=navatara_num,
            is_auspicious=is_auspicious,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/proxy/panchanga/yogas/detect")
async def proxy_panchanga_yogas_detect(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude")
):
    """Proxy endpoint to call remote API for panchanga yogas detection"""
    try:
        # Call remote API through the proxy
        params = {
            "date": date,
            "latitude": latitude,
            "longitude": longitude
        }
        
        result = call_remote_api("v1/panchanga/yogas/detect", "GET", params=params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
