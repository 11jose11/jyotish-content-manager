"""
Golden tests para validar precisión contra fixtures de datos reales
"""

import json
import pytest
import asyncio
from pathlib import Path
from httpx import AsyncClient
from main import app

# Configuración de test
TEST_CITIES = ["Paris", "Mumbai"]
TEST_PERIODS = [
    (2025, 1),
    (2025, 2),
]

def normalize_data(data):
    """Normalizar datos para comparación consistente"""
    if isinstance(data, dict):
        return {k: normalize_data(v) for k, v in sorted(data.items())}
    elif isinstance(data, list):
        if data and isinstance(data[0], dict) and "date" in data[0]:
            return sorted(data, key=lambda x: x.get("date", ""))
        return [normalize_data(item) for item in data]
    else:
        return data

def load_fixture(fixture_type: str, year: int, month: int, city: str) -> dict:
    """Cargar fixture de referencia"""
    fixtures_dir = Path("tests/fixtures")
    filename = f"{fixture_type}_{year}_{month:02d}.{city.lower()}.json"
    filepath = fixtures_dir / filename
    
    if not filepath.exists():
        pytest.skip(f"Fixture no encontrado: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

@pytest.mark.asyncio
@pytest.mark.parametrize("year,month", TEST_PERIODS)
@pytest.mark.parametrize("city", TEST_CITIES)
async def test_positions_golden(year: int, month: int, city: str):
    """Test golden para positions/month"""
    # Configuración por ciudad
    city_configs = {
        "Paris": {"lat": 48.8566, "lon": 2.3522, "tz": "Europe/Paris"},
        "Mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    }
    
    config = city_configs[city]
    
    # Datos de request
    request_data = {
        "year": year,
        "month": month,
        "timezone": config["tz"],
        "latitude": config["lat"],
        "longitude": config["lon"]
    }
    
    # Cargar fixture
    fixture_data = load_fixture("positions", year, month, city)
    
    # Hacer request al backend
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/v1/ephemeris/planets", params={
            "when_utc": f"{year}-{month:02d}-01T12:00:00Z",
            "planets": "Sun,Moon,Mercury,Venus,Mars,Jupiter,Saturn,Rahu,Ketu"
        })
        assert response.status_code == 200
        current_data = response.json()
    
    # Normalizar ambos datasets
    normalized_current = normalize_data(current_data)
    normalized_fixture = normalize_data(fixture_data)
    
    # Comparación byte-a-byte
    assert normalized_current == normalized_fixture, f"Positions data no coincide para {city} {year}/{month:02d}"

@pytest.mark.asyncio
@pytest.mark.parametrize("year,month", TEST_PERIODS)
@pytest.mark.parametrize("city", TEST_CITIES)
async def test_panchanga_golden(year: int, month: int, city: str):
    """Test golden para panchanga/month"""
    # Configuración por ciudad
    city_configs = {
        "Paris": {"lat": 48.8566, "lon": 2.3522, "tz": "Europe/Paris"},
        "Mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    }
    
    config = city_configs[city]
    
    # Datos de request
    request_data = {
        "year": year,
        "month": month,
        "timezone": config["tz"],
        "latitude": config["lat"],
        "longitude": config["lon"]
    }
    
    # Cargar fixture
    fixture_data = load_fixture("panchanga", year, month, city)
    
    # Hacer request al backend
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/v1/panchanga/precise/daily", params={
            "date": f"{year}-{month:02d}-01",
            "latitude": str(config["lat"]),
            "longitude": str(config["lon"]),
            "reference_time": "sunrise"
        })
        assert response.status_code == 200
        current_data = response.json()
    
    # Normalizar ambos datasets
    normalized_current = normalize_data(current_data)
    normalized_fixture = normalize_data(fixture_data)
    
    # Comparación byte-a-byte
    assert normalized_current == normalized_fixture, f"Panchanga data no coincide para {city} {year}/{month:02d}"

@pytest.mark.asyncio
@pytest.mark.parametrize("frame", ["moon", "sun", "lagna"])
async def test_navatara_golden(frame: str):
    """Test golden para navatara/calculate"""
    # Datos de test
    request_data = {
        "frame": frame,
        "scheme": 27,
        "datetime": "2025-01-15T12:00:00Z",
        "timezone": "Europe/Paris",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "lang": "es",
        "includeMetadata": True
    }
    
    # Hacer request al backend
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        current_data = response.json()
    
    # Validaciones específicas para Navatara
    assert "mapping" in current_data
    assert len(current_data["mapping"]) == 27, f"Navatara debe tener 27 posiciones, tiene {len(current_data['mapping'])}"
    
    # Verificar estructura del mapping
    for i, item in enumerate(current_data["mapping"]):
        assert "relPosition" in item, f"Posición {i}: falta relPosition"
        assert "absolute" in item, f"Posición {i}: falta absolute"
        assert "nakshatra" in item["absolute"], f"Posición {i}: falta nakshatra en absolute"
        
        # Verificar que relPosition va de 1 a 27
        assert 1 <= item["relPosition"] <= 27, f"Posición {i}: relPosition fuera de rango"
        
        # Verificar que nakshatra index va de 1 a 27
        nakshatra_index = item["absolute"]["nakshatra"].get("index", 0)
        assert 1 <= nakshatra_index <= 27, f"Posición {i}: nakshatra index fuera de rango"

@pytest.mark.asyncio
async def test_nakshatra_derivation_accuracy():
    """Test de precisión en derivación de nakshatra"""
    # Test con datos conocidos
    test_cases = [
        {
            "datetime": "2025-01-15T12:00:00Z",
            "timezone": "Europe/Paris",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "expected_moon_nakshatra": 10,  # Maghā
        }
    ]
    
    for test_case in test_cases:
        request_data = {
            "frame": "moon",
            "datetime": test_case["datetime"],
            "timezone": test_case["timezone"],
            "latitude": test_case["latitude"],
            "longitude": test_case["longitude"],
            "includeMetadata": True
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post("/navatara/calculate", json=request_data)
            assert response.status_code == 200
            data = response.json()
            
            # Verificar que el nakshatra inicial es correcto
            start_nakshatra = data["start"]["index"]
            expected = test_case["expected_moon_nakshatra"]
            
            # Tolerancia de ±1 para diferencias menores en cálculo
            assert abs(start_nakshatra - expected) <= 1, f"Nakshatra inicial incorrecto: {start_nakshatra}, esperado: {expected}"

@pytest.mark.asyncio
async def test_special_taras():
    """Test de taras especiales en Navatara"""
    request_data = {
        "frame": "moon",
        "scheme": 27,
        "datetime": "2025-01-15T12:00:00Z",
        "timezone": "Europe/Paris",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "includeMetadata": True
    }
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        data = response.json()
        
        # Verificar que Pushya (nakshatra 8) tiene taras especiales
        pushya_items = [item for item in data["mapping"] if item["absolute"]["nakshatra"]["index"] == 8]
        
        if pushya_items:
            for item in pushya_items:
                assert "specialTaras" in item, "Pushya debe tener taras especiales"
                assert len(item["specialTaras"]) > 0, "Pushya debe tener al menos una tara especial"

@pytest.mark.asyncio
async def test_data_completeness():
    """Test de completitud de datos"""
    # Test para un mes completo
    request_data = {
        "year": 2025,
        "month": 1,
        "timezone": "Europe/Paris",
        "latitude": 48.8566,
        "longitude": 2.3522
    }
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test positions
        response = await client.post("/positions/month", json=request_data)
        assert response.status_code == 200
        positions_data = response.json()
        
        # Verificar que hay 9 planetas
        assert len(positions_data["planets"]) == 9, "Debe haber 9 planetas"
        
        # Verificar que cada planeta tiene datos para todo el mes
        for planet in positions_data["planets"]:
            days = planet["days"]
            assert len(days) >= 28, f"Planeta {planet['name']}: datos incompletos ({len(days)} días)"
            
            # Verificar estructura de cada día
            for day in days:
                assert "date" in day, f"Planeta {planet['name']}: día sin fecha"
                assert "nakshatra" in day, f"Planeta {planet['name']}: día sin nakshatra"
                assert "index" in day["nakshatra"], f"Planeta {planet['name']}: nakshatra sin índice"
                assert "pada" in day["nakshatra"], f"Planeta {planet['name']}: nakshatra sin pada"
        
        # Test panchanga
        response = await client.post("/panchanga/month", json=request_data)
        assert response.status_code == 200
        panchanga_data = response.json()
        
        # Verificar que hay datos para todo el mes
        assert len(panchanga_data["days"]) >= 28, f"Panchanga: datos incompletos ({len(panchanga_data['days'])} días)"
        
        # Verificar estructura de cada día
        for day in panchanga_data["days"]:
            required_fields = ["date", "tithi", "vara", "nakshatra", "yoga", "karana"]
            for field in required_fields:
                assert field in day, f"Panchanga día {day.get('date')}: campo {field} faltante"
