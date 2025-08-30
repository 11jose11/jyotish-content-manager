#!/usr/bin/env python3
"""
Script para validar precisión de datos mensuales
Uso: python scripts/validate_month.py [YYYY] [MM] [CITY]
"""

import os
import sys
import json
import asyncio
import httpx
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Configuración por defecto
DEFAULT_YEAR = 2025
DEFAULT_MONTH = 1
DEFAULT_CITY = "Paris"
DEFAULT_COORDS = {
    "Paris": {"lat": 48.8566, "lon": 2.3522, "tz": "Europe/Paris"},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    "New York": {"lat": 40.7128, "lon": -74.0060, "tz": "America/New_York"},
    "Tokyo": {"lat": 35.6762, "lon": 139.6503, "tz": "Asia/Tokyo"},
}

class DataValidator:
    def __init__(self, year: int, month: int, city: str):
        self.year = year
        self.month = month
        self.city = city
        self.coords = DEFAULT_COORDS.get(city, DEFAULT_COORDS["Paris"])
        
    async def fetch_current_data(self) -> tuple[dict, dict]:
        """Obtener datos actuales del backend"""
        base_data = {
            "year": self.year,
            "month": self.month,
            "timezone": self.coords["tz"],
            "latitude": self.coords["lat"],
            "longitude": self.coords["lon"]
        }
        
        async with httpx.AsyncClient() as client:
            # Obtener del backend local
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            
            print(f"Obteniendo datos actuales del backend...")
            
            # Positions
            positions_params = {
                "when_utc": f"{self.year}-{self.month:02d}-01T12:00:00Z",
                "planets": "Sun,Moon,Mercury,Venus,Mars,Jupiter,Saturn,Rahu,Ketu"
            }
            positions_response = await client.get(
                f"{backend_url}/v1/ephemeris/planets",
                params=positions_params,
                timeout=30.0
            )
            positions_data = positions_response.json()
            
            # Panchanga
            panchanga_params = {
                "date": f"{self.year}-{self.month:02d}-01",
                "latitude": str(self.coords["lat"]),
                "longitude": str(self.coords["lon"]),
                "reference_time": "sunrise"
            }
            panchanga_response = await client.get(
                f"{backend_url}/v1/panchanga/precise/daily",
                params=panchanga_params,
                timeout=30.0
            )
            panchanga_data = panchanga_response.json()
            
            return positions_data, panchanga_data
    
    def load_fixtures(self) -> tuple[dict, dict]:
        """Cargar fixtures de referencia"""
        fixtures_dir = Path("tests/fixtures")
        
        positions_file = fixtures_dir / f"positions_{self.year}_{self.month:02d}.{self.city.lower()}.json"
        panchanga_file = fixtures_dir / f"panchanga_{self.year}_{self.month:02d}.{self.city.lower()}.json"
        
        if not positions_file.exists():
            raise FileNotFoundError(f"Fixture no encontrado: {positions_file}")
        if not panchanga_file.exists():
            raise FileNotFoundError(f"Fixture no encontrado: {panchanga_file}")
        
        with open(positions_file, 'r', encoding='utf-8') as f:
            positions_fixture = json.load(f)
        
        with open(panchanga_file, 'r', encoding='utf-8') as f:
            panchanga_fixture = json.load(f)
        
        return positions_fixture, panchanga_fixture
    
    def analyze_positions(self, current: dict, fixture: dict) -> dict:
        """Analizar precisión de positions"""
        stats = {
            "total_planets": len(current.get("planets", [])),
            "total_transitions": len(current.get("transitions", [])),
            "fixture_transitions": len(fixture.get("transitions", [])),
            "data_gaps": 0,
            "missing_transitions": 0,
            "extra_transitions": 0,
            "precision_issues": []
        }
        
        # Verificar transiciones
        current_transitions = {(t["planet"], t["date"]) for t in current.get("transitions", [])}
        fixture_transitions = {(t["planet"], t["date"]) for t in fixture.get("transitions", [])}
        
        stats["missing_transitions"] = len(fixture_transitions - current_transitions)
        stats["extra_transitions"] = len(current_transitions - fixture_transitions)
        
        # Verificar datos por planeta
        for planet in current.get("planets", []):
            planet_name = planet["name"]
            days = planet.get("days", [])
            
            if len(days) < 28:  # Mes completo debería tener al menos 28 días
                stats["data_gaps"] += 1
                stats["precision_issues"].append(f"Planeta {planet_name}: datos incompletos ({len(days)} días)")
            
            # Verificar nakshatra y pada
            for day in days:
                if "nakshatra" not in day or "pada" not in day.get("nakshatra", {}):
                    stats["precision_issues"].append(f"Planeta {planet_name} {day.get('date')}: datos de nakshatra incompletos")
        
        return stats
    
    def analyze_panchanga(self, current: dict, fixture: dict) -> dict:
        """Analizar precisión de panchanga"""
        stats = {
            "total_days": len(current.get("days", [])),
            "fixture_days": len(fixture.get("days", [])),
            "special_yogas": 0,
            "missing_yogas": 0,
            "data_gaps": 0,
            "precision_issues": []
        }
        
        # Verificar días
        if len(current.get("days", [])) < 28:
            stats["data_gaps"] = 28 - len(current.get("days", []))
            stats["precision_issues"].append(f"Datos incompletos: {len(current.get('days', []))} días")
        
        # Verificar yogas especiales
        for day in current.get("days", []):
            special_yogas = day.get("specialYogas", [])
            stats["special_yogas"] += len(special_yogas)
            
            # Verificar estructura de datos
            required_fields = ["tithi", "vara", "nakshatra", "yoga", "karana"]
            for field in required_fields:
                if field not in day:
                    stats["precision_issues"].append(f"Día {day.get('date')}: campo {field} faltante")
        
        return stats
    
    def print_report(self, positions_stats: dict, panchanga_stats: dict):
        """Imprimir reporte de validación"""
        print(f"\n📊 REPORTE DE PRECISIÓN - {self.city} {self.year}/{self.month:02d}")
        print("=" * 60)
        
        # Positions
        print(f"\n🌙 POSITIONS:")
        print(f"  - Planetas: {positions_stats['total_planets']}")
        print(f"  - Transiciones actuales: {positions_stats['total_transitions']}")
        print(f"  - Transiciones fixture: {positions_stats['fixture_transitions']}")
        print(f"  - Transiciones faltantes: {positions_stats['missing_transitions']}")
        print(f"  - Transiciones extra: {positions_stats['extra_transitions']}")
        print(f"  - Huecos de datos: {positions_stats['data_gaps']}")
        
        # Panchanga
        print(f"\n📅 PANCHANGA:")
        print(f"  - Días actuales: {panchanga_stats['total_days']}")
        print(f"  - Días fixture: {panchanga_stats['fixture_days']}")
        print(f"  - Yogas especiales: {panchanga_stats['special_yogas']}")
        print(f"  - Huecos de datos: {panchanga_stats['data_gaps']}")
        
        # Issues
        all_issues = positions_stats["precision_issues"] + panchanga_stats["precision_issues"]
        if all_issues:
            print(f"\n⚠️  PROBLEMAS DETECTADOS:")
            for issue in all_issues:
                print(f"  - {issue}")
        else:
            print(f"\n✅ No se detectaron problemas de precisión")
        
        # Resumen
        total_issues = len(all_issues)
        if total_issues == 0:
            print(f"\n🎉 VALIDACIÓN EXITOSA")
        else:
            print(f"\n❌ VALIDACIÓN FALLIDA - {total_issues} problemas encontrados")

async def main():
    """Función principal"""
    # Parsear argumentos
    year = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_YEAR
    month = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_MONTH
    city = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_CITY
    
    print(f"🔍 Validando precisión para {city} - {year}/{month:02d}")
    
    try:
        validator = DataValidator(year, month, city)
        
        # Obtener datos actuales
        current_positions, current_panchanga = await validator.fetch_current_data()
        
        # Cargar fixtures
        fixture_positions, fixture_panchanga = validator.load_fixtures()
        
        # Analizar precisión
        positions_stats = validator.analyze_positions(current_positions, fixture_positions)
        panchanga_stats = validator.analyze_panchanga(current_panchanga, fixture_panchanga)
        
        # Imprimir reporte
        validator.print_report(positions_stats, panchanga_stats)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
