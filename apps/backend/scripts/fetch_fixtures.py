#!/usr/bin/env python3
"""
Script para obtener fixtures de datos reales de la API remota
Uso: python scripts/fetch_fixtures.py [YYYY] [MM] [CITY]
"""

import os
import sys
import json
import asyncio
import httpx
from datetime import datetime
from pathlib import Path

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

def get_coordinates(city: str) -> dict:
    """Obtener coordenadas y timezone para una ciudad"""
    return DEFAULT_COORDS.get(city, DEFAULT_COORDS["Paris"])

async def fetch_from_api(client: httpx.AsyncClient, endpoint: str, params: dict = None) -> dict:
    """Hacer request a la API remota"""
    remote_url = os.getenv("REMOTE_API_BASE_URL")
    if not remote_url:
        raise ValueError("REMOTE_API_BASE_URL no está configurado")
    
    url = f"{remote_url.rstrip('/')}/{endpoint.lstrip('/')}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Agregar autenticación si está disponible
    api_key = os.getenv("REMOTE_API_KEY")
    if api_key:
        headers["X-API-Key"] = api_key
    
    try:
        if params:
            response = await client.get(url, params=params, headers=headers, timeout=30.0)
        else:
            response = await client.get(url, headers=headers, timeout=30.0)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        raise

async def fetch_month_data(year: int, month: int, city: str) -> tuple[dict, dict]:
    """Obtener datos de positions y panchanga para un mes"""
    coords = get_coordinates(city)
    
    # Datos base para ambos endpoints
    base_data = {
        "year": year,
        "month": month,
        "timezone": coords["tz"],
        "latitude": coords["lat"],
        "longitude": coords["lon"]
    }
    
    async with httpx.AsyncClient() as client:
        print(f"Obteniendo datos para {city} - {year}/{month:02d}")
        
        # Fetch positions
        print("  - Obteniendo positions...")
        positions_params = {
            "when_utc": f"{year}-{month:02d}-01T12:00:00Z",
            "planets": "Sun,Moon,Mercury,Venus,Mars,Jupiter,Saturn,Rahu,Ketu"
        }
        positions_data = await fetch_from_api(client, "v1/ephemeris/planets", positions_params)
        
        # Fetch panchanga
        print("  - Obteniendo panchanga...")
        panchanga_params = {
            "date": f"{year}-{month:02d}-01",
            "latitude": str(coords["lat"]),
            "longitude": str(coords["lon"]),
            "reference_time": "sunrise"
        }
        panchanga_data = await fetch_from_api(client, "v1/panchanga/precise/daily", panchanga_params)
        
        return positions_data, panchanga_data

def normalize_data(data: dict) -> dict:
    """Normalizar datos para comparación consistente"""
    if isinstance(data, dict):
        # Ordenar claves para comparación consistente
        return {k: normalize_data(v) for k, v in sorted(data.items())}
    elif isinstance(data, list):
        # Ordenar listas por fecha si es posible
        if data and isinstance(data[0], dict) and "date" in data[0]:
            return sorted(data, key=lambda x: x.get("date", ""))
        return [normalize_data(item) for item in data]
    else:
        return data

def save_fixture(data: dict, fixture_type: str, year: int, month: int, city: str):
    """Guardar fixture en archivo JSON"""
    fixtures_dir = Path("tests/fixtures")
    fixtures_dir.mkdir(exist_ok=True)
    
    filename = f"{fixture_type}_{year}_{month:02d}.{city.lower()}.json"
    filepath = fixtures_dir / filename
    
    # Normalizar y guardar
    normalized_data = normalize_data(data)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(normalized_data, f, indent=2, ensure_ascii=False)
    
    print(f"  ✅ Fixture guardado: {filepath}")
    return filepath

async def main():
    """Función principal"""
    # Parsear argumentos
    year = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_YEAR
    month = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_MONTH
    city = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_CITY
    
    print(f"🔄 Obteniendo fixtures para {city} - {year}/{month:02d}")
    
    try:
        # Obtener datos
        positions_data, panchanga_data = await fetch_month_data(year, month, city)
        
        # Guardar fixtures
        save_fixture(positions_data, "positions", year, month, city)
        save_fixture(panchanga_data, "panchanga", year, month, city)
        
        # Estadísticas
        print(f"\n📊 Estadísticas:")
        print(f"  - Positions: {len(positions_data.get('planets', []))} planetas")
        print(f"  - Transitions: {len(positions_data.get('transitions', []))} cambios")
        print(f"  - Panchanga days: {len(panchanga_data.get('days', []))} días")
        
        print(f"\n✅ Fixtures obtenidos exitosamente!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
