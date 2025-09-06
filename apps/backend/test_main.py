import pytest
import json
from datetime import datetime, date
from main import (
    get_nakshatra, get_sidereal_sign, get_tithi, get_yoga, get_karana,
    evaluate_yoga_rule, get_month_dates, julian_day,
    PositionsMonthRequest, PanchangaMonthRequest, NavataraRequest
)

class TestNakshatraCalculations:
    """Test nakshatra and pada calculations"""
    
    def test_nakshatra_calculation_ashwini(self):
        """Test nakshatra calculation for Ashwini (0-13.33 degrees)"""
        # Ashwini spans 0-13.33 degrees
        result = get_nakshatra(0.0)
        assert result["index"] == 1
        assert result["nameIAST"] == "Aśvinī"
        assert result["pada"] == 1
        
        result = get_nakshatra(6.66)
        assert result["index"] == 1
        assert result["nameIAST"] == "Aśvinī"
        assert result["pada"] == 2
        
        result = get_nakshatra(13.32)
        assert result["index"] == 1
        assert result["nameIAST"] == "Aśvinī"
        assert result["pada"] == 4
    
    def test_nakshatra_calculation_bharani(self):
        """Test nakshatra calculation for Bharani (13.33-26.66 degrees)"""
        result = get_nakshatra(13.34)
        assert result["index"] == 2
        assert result["nameIAST"] == "Bharaṇī"
        assert result["pada"] == 1
        
        result = get_nakshatra(20.0)
        assert result["index"] == 2
        assert result["nameIAST"] == "Bharaṇī"
        assert result["pada"] == 3
    
    def test_nakshatra_calculation_pushya(self):
        """Test nakshatra calculation for Pushya (93.33-106.66 degrees)"""
        result = get_nakshatra(93.34)
        assert result["index"] == 8
        assert result["nameIAST"] == "Puṣya"
        assert result["pada"] == 1
        
        result = get_nakshatra(100.0)
        assert result["index"] == 8
        assert result["nameIAST"] == "Puṣya"
        assert result["pada"] == 3
    
    def test_nakshatra_calculation_revati(self):
        """Test nakshatra calculation for Revati (346.67-360 degrees)"""
        result = get_nakshatra(346.68)
        assert result["index"] == 27
        assert result["nameIAST"] == "Revatī"
        assert result["pada"] == 1
        
        result = get_nakshatra(359.99)
        assert result["index"] == 27
        assert result["nameIAST"] == "Revatī"
        assert result["pada"] == 4
    
    def test_pada_calculation_boundaries(self):
        """Test pada calculation at boundaries"""
        # Each nakshatra is 13.33 degrees, each pada is 3.33 degrees
        # Test pada boundaries within Ashwini
        assert get_nakshatra(0.0)["pada"] == 1
        assert get_nakshatra(3.32)["pada"] == 1
        assert get_nakshatra(3.33)["pada"] == 2
        assert get_nakshatra(6.65)["pada"] == 2
        assert get_nakshatra(6.66)["pada"] == 3
        assert get_nakshatra(9.98)["pada"] == 3
        assert get_nakshatra(9.99)["pada"] == 4
        assert get_nakshatra(13.32)["pada"] == 4

class TestSiderealSignCalculations:
    """Test sidereal sign calculations"""
    
    def test_sidereal_sign_calculations(self):
        """Test sidereal sign calculations for all 12 signs"""
        # Aries (0-30 degrees)
        assert get_sidereal_sign(0.0) == "Meṣa"
        assert get_sidereal_sign(15.0) == "Meṣa"
        assert get_sidereal_sign(29.99) == "Meṣa"
        
        # Taurus (30-60 degrees)
        assert get_sidereal_sign(30.0) == "Vṛṣabha"
        assert get_sidereal_sign(45.0) == "Vṛṣabha"
        assert get_sidereal_sign(59.99) == "Vṛṣabha"
        
        # Gemini (60-90 degrees)
        assert get_sidereal_sign(60.0) == "Mithuna"
        assert get_sidereal_sign(75.0) == "Mithuna"
        assert get_sidereal_sign(89.99) == "Mithuna"
        
        # Cancer (90-120 degrees)
        assert get_sidereal_sign(90.0) == "Karkaṭa"
        assert get_sidereal_sign(105.0) == "Karkaṭa"
        assert get_sidereal_sign(119.99) == "Karkaṭa"
        
        # Leo (120-150 degrees)
        assert get_sidereal_sign(120.0) == "Siṃha"
        assert get_sidereal_sign(135.0) == "Siṃha"
        assert get_sidereal_sign(149.99) == "Siṃha"
        
        # Virgo (150-180 degrees)
        assert get_sidereal_sign(150.0) == "Kanyā"
        assert get_sidereal_sign(165.0) == "Kanyā"
        assert get_sidereal_sign(179.99) == "Kanyā"
        
        # Libra (180-210 degrees)
        assert get_sidereal_sign(180.0) == "Tulā"
        assert get_sidereal_sign(195.0) == "Tulā"
        assert get_sidereal_sign(209.99) == "Tulā"
        
        # Scorpio (210-240 degrees)
        assert get_sidereal_sign(210.0) == "Vṛścika"
        assert get_sidereal_sign(225.0) == "Vṛścika"
        assert get_sidereal_sign(239.99) == "Vṛścika"
        
        # Sagittarius (240-270 degrees)
        assert get_sidereal_sign(240.0) == "Dhanu"
        assert get_sidereal_sign(255.0) == "Dhanu"
        assert get_sidereal_sign(269.99) == "Dhanu"
        
        # Capricorn (270-300 degrees)
        assert get_sidereal_sign(270.0) == "Makara"
        assert get_sidereal_sign(285.0) == "Makara"
        assert get_sidereal_sign(299.99) == "Makara"
        
        # Aquarius (300-330 degrees)
        assert get_sidereal_sign(300.0) == "Kumbha"
        assert get_sidereal_sign(315.0) == "Kumbha"
        assert get_sidereal_sign(329.99) == "Kumbha"
        
        # Pisces (330-360 degrees)
        assert get_sidereal_sign(330.0) == "Mīna"
        assert get_sidereal_sign(345.0) == "Mīna"
        assert get_sidereal_sign(359.99) == "Mīna"

class TestTithiCalculations:
    """Test tithi calculations"""
    
    def test_tithi_calculation_new_moon(self):
        """Test tithi calculation for new moon (0 degrees difference)"""
        result = get_tithi(0.0, 0.0)  # Sun and Moon at same longitude
        assert result["code"] == "Pratipada"
        assert result["group"] == "Nanda"
    
    def test_tithi_calculation_full_moon(self):
        """Test tithi calculation for full moon (180 degrees difference)"""
        result = get_tithi(0.0, 180.0)  # Moon opposite to Sun
        assert result["code"] == "Purnima"
        assert result["group"] == "Purna"
    
    def test_tithi_calculation_first_quarter(self):
        """Test tithi calculation for first quarter (90 degrees difference)"""
        result = get_tithi(0.0, 90.0)  # Moon 90 degrees ahead of Sun
        assert result["code"] == "Ashtami"
        assert result["group"] == "Jaya"
    
    def test_tithi_calculation_last_quarter(self):
        """Test tithi calculation for last quarter (270 degrees difference)"""
        result = get_tithi(0.0, 270.0)  # Moon 270 degrees ahead of Sun
        assert result["code"] == "Chaturdashi"
        assert result["group"] == "Purna"
    
    def test_tithi_calculation_negative_difference(self):
        """Test tithi calculation when Moon is behind Sun"""
        result = get_tithi(180.0, 90.0)  # Moon behind Sun
        assert result["code"] == "Chaturdashi"
        assert result["group"] == "Purna"

class TestYogaCalculations:
    """Test yoga calculations"""
    
    def test_yoga_calculation(self):
        """Test yoga calculation"""
        # Test a few known yogas
        result = get_yoga(0.0, 0.0)  # Sun and Moon at same longitude
        assert result == "Viśkumbha"
        
        result = get_yoga(0.0, 13.33)  # Moon 13.33 degrees ahead
        assert result == "Priti"
        
        result = get_yoga(0.0, 26.66)  # Moon 26.66 degrees ahead
        assert result == "Āyuṣmān"

class TestKaranaCalculations:
    """Test karana calculations"""
    
    def test_karana_calculation(self):
        """Test karana calculation for different tithis"""
        # Test first 7 karanas
        assert get_karana(1) == "Bava"
        assert get_karana(2) == "Bālava"
        assert get_karana(3) == "Kaulava"
        assert get_karana(4) == "Taitila"
        assert get_karana(5) == "Garija"
        assert get_karana(6) == "Vaṇija"
        assert get_karana(7) == "Viṣṭi"
        
        # Test next 7 karanas
        assert get_karana(8) == "Śakuni"
        assert get_karana(9) == "Catuṣpāda"
        assert get_karana(10) == "Nāga"
        assert get_karana(11) == "Bava"
        assert get_karana(12) == "Bālava"
        assert get_karana(13) == "Kaulava"
        assert get_karana(14) == "Taitila"
        
        # Test last 7 karanas
        assert get_karana(15) == "Garija"
        assert get_karana(16) == "Vaṇija"
        assert get_karana(17) == "Viṣṭi"
        assert get_karana(18) == "Śakuni"
        assert get_karana(19) == "Catuṣpāda"
        assert get_karana(20) == "Nāga"
        assert get_karana(21) == "Bava"
        
        # Test remaining karanas
        assert get_karana(22) == "Bālava"
        assert get_karana(23) == "Kaulava"
        assert get_karana(24) == "Taitila"
        assert get_karana(25) == "Garija"
        assert get_karana(26) == "Vaṇija"
        assert get_karana(27) == "Viṣṭi"
        assert get_karana(28) == "Śakuni"
        assert get_karana(29) == "Catuṣpāda"
        assert get_karana(30) == "Nāga"

class TestDSLRuleEvaluation:
    """Test DSL rule evaluation"""
    
    def test_simple_equality_rule(self):
        """Test simple equality rule"""
        context = {"vara": "Thursday", "nakshatraIndex": 8}
        rule = "vara=='Thursday' && nakshatraIndex==8"
        assert evaluate_yoga_rule(rule, context) == True
        
        context = {"vara": "Friday", "nakshatraIndex": 8}
        assert evaluate_yoga_rule(rule, context) == False
    
    def test_in_operator_rule(self):
        """Test 'in' operator rule"""
        context = {"vara": "Monday", "tithiGroup": "Nanda"}
        rule = "vara in ['Monday', 'Wednesday', 'Friday'] && tithiGroup=='Nanda'"
        assert evaluate_yoga_rule(rule, context) == True
        
        context = {"vara": "Tuesday", "tithiGroup": "Nanda"}
        assert evaluate_yoga_rule(rule, context) == False
    
    def test_complex_rule(self):
        """Test complex rule with multiple conditions"""
        context = {"vara": "Thursday", "tithiGroup": "Jaya", "nakshatraIndex": 16}
        rule = "vara in ['Thursday', 'Friday'] && tithiGroup=='Jaya' && nakshatraIndex==16"
        assert evaluate_yoga_rule(rule, context) == True
        
        context = {"vara": "Tuesday", "tithiGroup": "Jaya", "nakshatraIndex": 16}
        assert evaluate_yoga_rule(rule, context) == False
    
    def test_invalid_rule(self):
        """Test invalid rule handling"""
        context = {"vara": "Thursday"}
        rule = "invalid_syntax && vara=='Thursday'"
        # Should return False for invalid rules
        assert evaluate_yoga_rule(rule, context) == False

class TestUtilityFunctions:
    """Test utility functions"""
    
    def test_julian_day_calculation(self):
        """Test Julian day calculation"""
        jd = julian_day("2024-01-01")
        assert isinstance(jd, float)
        assert jd > 2400000  # Julian day for 2024 should be > 2.4M
        
        jd = julian_day("2024-01-01", "12:00")
        assert isinstance(jd, float)
    
    def test_get_month_dates(self):
        """Test month dates generation"""
        dates = get_month_dates(2024, 1)
        assert len(dates) == 31  # January 2024 has 31 days
        assert dates[0] == "2024-01-01"
        assert dates[-1] == "2024-01-31"
        
        dates = get_month_dates(2024, 2)
        assert len(dates) == 29  # February 2024 (leap year) has 29 days
        assert dates[0] == "2024-02-01"
        assert dates[-1] == "2024-02-29"
        
        dates = get_month_dates(2023, 2)
        assert len(dates) == 28  # February 2023 has 28 days

class TestPydanticModels:
    """Test Pydantic model validation"""
    
    def test_positions_month_request_validation(self):
        """Test PositionsMonthRequest validation"""
        # Valid request
        request = PositionsMonthRequest(
            year=2024,
            month=1,
            timezone="Asia/Kolkata",
            latitude=28.6139,
            longitude=77.2090
        )
        assert request.year == 2024
        assert request.month == 1
        
        # Test invalid year
        with pytest.raises(ValueError):
            PositionsMonthRequest(
                year=1800,  # Too early
                month=1,
                timezone="Asia/Kolkata",
                latitude=28.6139,
                longitude=77.2090
            )
        
        # Test invalid month
        with pytest.raises(ValueError):
            PositionsMonthRequest(
                year=2024,
                month=13,  # Invalid month
                timezone="Asia/Kolkata",
                latitude=28.6139,
                longitude=77.2090
            )
        
        # Test invalid latitude
        with pytest.raises(ValueError):
            PositionsMonthRequest(
                year=2024,
                month=1,
                timezone="Asia/Kolkata",
                latitude=91.0,  # Invalid latitude
                longitude=77.2090
            )
    
    def test_panchanga_month_request_validation(self):
        """Test PanchangaMonthRequest validation"""
        # Valid request
        request = PanchangaMonthRequest(
            year=2024,
            month=1,
            timezone="Asia/Kolkata",
            latitude=28.6139,
            longitude=77.2090
        )
        assert request.year == 2024
        assert request.month == 1
    
    def test_navatara_request_validation(self):
        """Test NavataraRequest validation"""
        # Valid request with defaults
        request = NavataraRequest()
        assert request.frame is None
        assert request.scheme is None
        assert request.lang is None
        
        # Valid request with values
        request = NavataraRequest(
            frame="moon",
            scheme=27,
            lang="en",
            startNakshatraIndex=1
        )
        assert request.frame == "moon"
        assert request.scheme == 27
        assert request.lang == "en"
        assert request.startNakshatraIndex == 1
        
        # Test invalid frame
        with pytest.raises(ValueError):
            NavataraRequest(frame="invalid")
        
        # Test invalid scheme
        with pytest.raises(ValueError):
            NavataraRequest(scheme=26)
        
        # Test invalid lang
        with pytest.raises(ValueError):
            NavataraRequest(lang="fr")

if __name__ == "__main__":
    pytest.main([__file__])
















