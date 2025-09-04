import pytest
import httpx
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/healthz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

class TestPositionsMonthEndpoint:
    """Test POST /positions/month endpoint"""
    
    def test_positions_month_valid_request(self):
        """Test valid positions month request"""
        request_data = {
            "year": 2024,
            "month": 1,
            "timezone": "Asia/Kolkata",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = client.post("/positions/month", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "range" in data
        assert "planets" in data
        assert "transitions" in data
        
        # Check range
        assert "startISO" in data["range"]
        assert "endISO" in data["range"]
        assert data["range"]["startISO"].startswith("2024-01-01")
        assert data["range"]["endISO"].startswith("2024-01-31")
        
        # Check planets
        assert len(data["planets"]) == 9  # 9 planets
        planet_names = [p["name"] for p in data["planets"]]
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]
        assert set(planet_names) == set(expected_planets)
        
        # Check each planet has days
        for planet in data["planets"]:
            assert "days" in planet
            assert len(planet["days"]) == 31  # January has 31 days
            
            # Check first day structure
            first_day = planet["days"][0]
            assert "date" in first_day
            assert "nakshatra" in first_day
            assert "signSidereal" in first_day
            assert "retrograde" in first_day
            assert "speed" in first_day
            
            # Check nakshatra structure
            nakshatra = first_day["nakshatra"]
            assert "index" in nakshatra
            assert "nameIAST" in nakshatra
            assert "pada" in nakshatra
            assert 1 <= nakshatra["index"] <= 27
            assert 1 <= nakshatra["pada"] <= 4
    
    def test_positions_month_invalid_year(self):
        """Test positions month with invalid year"""
        request_data = {
            "year": 1800,  # Too early
            "month": 1,
            "timezone": "Asia/Kolkata",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = client.post("/positions/month", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_positions_month_invalid_month(self):
        """Test positions month with invalid month"""
        request_data = {
            "year": 2024,
            "month": 13,  # Invalid month
            "timezone": "Asia/Kolkata",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = client.post("/positions/month", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_positions_month_invalid_latitude(self):
        """Test positions month with invalid latitude"""
        request_data = {
            "year": 2024,
            "month": 1,
            "timezone": "Asia/Kolkata",
            "latitude": 91.0,  # Invalid latitude
            "longitude": 77.2090
        }
        
        response = client.post("/positions/month", json=request_data)
        assert response.status_code == 422  # Validation error

class TestPanchangaMonthEndpoint:
    """Test POST /panchanga/month endpoint"""
    
    def test_panchanga_month_valid_request(self):
        """Test valid panchanga month request"""
        request_data = {
            "year": 2024,
            "month": 1,
            "timezone": "Asia/Kolkata",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = client.post("/panchanga/month", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "days" in data
        assert len(data["days"]) == 31  # January has 31 days
        
        # Check first day structure
        first_day = data["days"][0]
        assert "date" in first_day
        assert "sunriseISO" in first_day
        assert "sunsetISO" in first_day
        assert "tithi" in first_day
        assert "vara" in first_day
        assert "nakshatra" in first_day
        assert "yoga" in first_day
        assert "karana" in first_day
        assert "specialYogas" in first_day
        
        # Check tithi structure
        tithi = first_day["tithi"]
        assert "code" in tithi
        assert "group" in tithi
        assert tithi["group"] in ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"]
        
        # Check nakshatra structure
        nakshatra = first_day["nakshatra"]
        assert "index" in nakshatra
        assert "nameIAST" in nakshatra
        assert "pada" in nakshatra
        assert 1 <= nakshatra["index"] <= 27
        assert 1 <= nakshatra["pada"] <= 4
        
        # Check special yogas
        assert isinstance(first_day["specialYogas"], list)
        for yoga in first_day["specialYogas"]:
            assert "name" in yoga
            assert "polarity" in yoga
            assert "rule" in yoga
            assert "reason" in yoga
            assert yoga["polarity"] in ["auspicious", "inauspicious"]
    
    def test_panchanga_month_february_leap_year(self):
        """Test panchanga month for February in leap year"""
        request_data = {
            "year": 2024,
            "month": 2,
            "timezone": "Asia/Kolkata",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = client.post("/panchanga/month", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["days"]) == 29  # February 2024 has 29 days (leap year)
    
    def test_panchanga_month_february_non_leap_year(self):
        """Test panchanga month for February in non-leap year"""
        request_data = {
            "year": 2023,
            "month": 2,
            "timezone": "Asia/Kolkata",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = client.post("/panchanga/month", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["days"]) == 28  # February 2023 has 28 days

class TestNavataraCalculateEndpoint:
    """Test POST /navatara/calculate endpoint"""
    
    def test_navatara_calculate_default_request(self):
        """Test navatara calculate with default parameters"""
        request_data = {}
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "frame" in data
        assert "scheme" in data
        assert "start" in data
        assert "lokas" in data
        assert "groups9" in data
        assert "mapping" in data
        
        # Check defaults
        assert data["frame"] == "moon"
        assert data["scheme"] == 27
        
        # Check start structure
        start = data["start"]
        assert "index" in start
        assert "nameIAST" in start
        assert "planetLord" in start
        assert 1 <= start["index"] <= 27
        
        # Check lokas and groups9
        assert data["lokas"] == ["Bhu", "Bhuva", "Swarga"]
        assert data["groups9"] == ["Deva", "Manushya", "Rakshasa"]
        
        # Check mapping
        assert len(data["mapping"]) == 27
        for mapping in data["mapping"]:
            assert "relPosition" in mapping
            assert "cycle" in mapping
            assert "loka" in mapping
            assert "group9" in mapping
            assert "groupDeity" in mapping
            assert "absolute" in mapping
            assert "specialTaras" in mapping
            assert "roleLabel" in mapping
            
            assert 1 <= mapping["relPosition"] <= 27
            assert mapping["cycle"] in [1, 2, 3]
            assert mapping["loka"] in ["Bhu", "Bhuva", "Swarga"]
            assert mapping["group9"] in ["Deva", "Manushya", "Rakshasa"]
            
            # Check absolute nakshatra
            absolute = mapping["absolute"]
            assert "index" in absolute
            assert "nameIAST" in absolute
            assert "pada" in absolute
            assert 1 <= absolute["index"] <= 27
            assert 1 <= absolute["pada"] <= 4
    
    def test_navatara_calculate_with_start_nakshatra_index(self):
        """Test navatara calculate with start nakshatra index"""
        request_data = {
            "startNakshatraIndex": 8  # Pushya
        }
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["start"]["index"] == 8
        assert data["start"]["nameIAST"] == "Puṣya"
    
    def test_navatara_calculate_with_start_nakshatra_name(self):
        """Test navatara calculate with start nakshatra name"""
        request_data = {
            "startNakshatraName": "Puṣya"
        }
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["start"]["index"] == 8
        assert data["start"]["nameIAST"] == "Puṣya"
    
    def test_navatara_calculate_with_metadata(self):
        """Test navatara calculate with metadata included"""
        request_data = {
            "includeMetadata": True
        }
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "metadata" in data
        
        metadata = data["metadata"]
        assert "nakshatras" in metadata
        assert "roleLabels" in metadata
        assert "groupDeities" in metadata
        assert "specialTarasLegend" in metadata
        
        assert len(metadata["nakshatras"]) == 27
        assert len(metadata["roleLabels"]) == 27
    
    def test_navatara_calculate_with_frame_and_scheme(self):
        """Test navatara calculate with custom frame and scheme"""
        request_data = {
            "frame": "sun",
            "scheme": 28
        }
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["frame"] == "sun"
        assert data["scheme"] == 28
    
    def test_navatara_calculate_invalid_frame(self):
        """Test navatara calculate with invalid frame"""
        request_data = {
            "frame": "invalid"
        }
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_navatara_calculate_invalid_scheme(self):
        """Test navatara calculate with invalid scheme"""
        request_data = {
            "scheme": 26
        }
        
        response = client.post("/navatara/calculate", json=request_data)
        assert response.status_code == 422  # Validation error

class TestLegacyEndpoints:
    """Test legacy endpoints for backward compatibility"""
    
    def test_legacy_positions_endpoint(self):
        """Test legacy GET /positions endpoint"""
        response = client.get("/positions?date=2024-01-01&lat=28.6139&lon=77.2090")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 9  # 9 planets
        
        for position in data:
            assert "planet" in position
            assert "longitude" in position
            assert "latitude" in position
            assert "speed" in position
            assert "house" in position
    
    def test_legacy_panchanga_endpoint(self):
        """Test legacy GET /panchanga endpoint"""
        response = client.get("/panchanga?date=2024-01-01&lat=28.6139&lon=77.2090")
        assert response.status_code == 200
        
        data = response.json()
        assert "date" in data
        assert "tithi" in data
        assert "vara" in data
        assert "nakshatra" in data
        assert "yoga" in data
        assert "karana" in data
    
    def test_legacy_navatara_endpoint(self):
        """Test legacy GET /navatara/calculate endpoint"""
        response = client.get("/navatara/calculate?date=2024-01-01&lat=28.6139&lon=77.2090&birth_nakshatra=Aśvinī")
        assert response.status_code == 200
        
        data = response.json()
        assert "date" in data
        assert "birth_nakshatra" in data
        assert "current_nakshatra" in data
        assert "navatara_period" in data
        assert "navatara_number" in data
        assert "is_auspicious" in data
        assert "recommendations" in data

class TestErrorHandling:
    """Test error handling"""
    
    def test_missing_required_fields(self):
        """Test missing required fields"""
        response = client.post("/positions/month", json={})
        assert response.status_code == 422  # Validation error
    
    def test_invalid_json(self):
        """Test invalid JSON"""
        response = client.post("/positions/month", data="invalid json", headers={"Content-Type": "application/json"})
        assert response.status_code == 422  # Validation error
    
    def test_invalid_date_format(self):
        """Test invalid date format in legacy endpoints"""
        response = client.get("/positions?date=invalid-date&lat=28.6139&lon=77.2090")
        assert response.status_code == 400  # Bad request

if __name__ == "__main__":
    pytest.main([__file__])












