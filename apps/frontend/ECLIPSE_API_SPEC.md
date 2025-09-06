# Eclipse API Endpoints Specification

Este documento especifica los endpoints que necesitas implementar en tu API backend para que el Eclipse Dashboard funcione correctamente.

## Endpoints Requeridos

### 1. GET /api/eclipse/seasons

**Descripción**: Obtiene las temporadas de eclipses para un año específico.

**Parámetros de Query**:
- `year` (int): Año para el cual obtener las temporadas
- `latitude` (float): Latitud de la ubicación
- `longitude` (float): Longitud de la ubicación  
- `countryISO` (string): Código ISO del país (ej: "IN", "US", "ES")

**Respuesta**:
```json
{
  "seasons": [
    {
      "id": "season-1",
      "startDate": "2025-03-20T10:00:00Z",
      "endDate": "2025-04-08T15:00:00Z",
      "startRashi": "Pisces",
      "startNakshatra": "Revati",
      "startNakshatraPada": 4,
      "verdict": "Bhoga",
      "order": 1,
      "ayana": "Uttarayana",
      "drgDirection": "North",
      "rule87": 3,
      "mainPair": {
        "start": "2025-03-25T08:00:00Z",
        "end": "2025-04-08T12:00:00Z",
        "duration": 14
      },
      "events": [
        {
          "id": "eclipse-1",
          "date": "2025-03-25T08:00:00Z",
          "type": "Solar",
          "sunRashi": "Pisces",
          "sunNakshatra": "Revati",
          "sunNakshatraPada": 4,
          "moonRashi": "Pisces",
          "moonNakshatra": "Revati",
          "moonNakshatraPada": 4,
          "jupiter": "Taurus",
          "visibility": ["IN", "US", "ES", "MX"],
          "isVisibleInCountry": true,
          "affects18Years": true
        }
      ]
    }
  ],
  "summary": {
    "totalEclipses": 4,
    "totalSeasons": 2,
    "seasonsWith3Events": 0
  }
}
```

### 2. POST /api/eclipse/check

**Descripción**: Analiza el impacto de los eclipses en una carta natal.

**Body**:
```json
{
  "natalPoints": {
    "sunRashi": "Aries",
    "sunNakshatra": "Ashwini",
    "sunLongitude": "12.5",
    "moonRashi": "Cancer",
    "moonNakshatra": "Pushya",
    "moonLongitude": "45.2",
    "marsRashi": "Scorpio",
    "marsNakshatra": "Anuradha",
    "marsLongitude": "78.9"
  },
  "year": 2025,
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

**Respuesta**:
```json
{
  "matches": [
    {
      "planet": "Sun",
      "rashi": "Aries",
      "nakshatra": "Ashwini",
      "severity": "High",
      "benefit": true,
      "loss": false,
      "prePost": "Pre-eclipse",
      "window18Years": "2025-2043"
    }
  ]
}
```

### 3. GET /api/eclipse/legend

**Descripción**: Obtiene la documentación/leyenda sobre eclipses.

**Respuesta**:
```json
{
  "content": "<h3>Leyenda de Eclipses</h3><p>Los eclipses son eventos astrológicos significativos...</p>"
}
```

## Implementación Sugerida

### Estructura de Datos

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EclipseEvent(BaseModel):
    id: str
    date: datetime
    type: str  # "Solar" or "Lunar"
    sunRashi: str
    sunNakshatra: str
    sunNakshatraPada: int
    moonRashi: str
    moonNakshatra: str
    moonNakshatraPada: int
    jupiter: str
    visibility: List[str]
    isVisibleInCountry: bool
    affects18Years: bool

class EclipseSeason(BaseModel):
    id: str
    startDate: datetime
    endDate: datetime
    startRashi: str
    startNakshatra: str
    startNakshatraPada: int
    verdict: str  # "Bhoga", "Mokṣa", "Neutral"
    order: int
    ayana: str  # "Uttarayana", "Dakshinayana"
    drgDirection: str
    rule87: int
    mainPair: dict
    events: List[EclipseEvent]

class EclipseSeasonsResponse(BaseModel):
    seasons: List[EclipseSeason]
    summary: dict
```

### Endpoints FastAPI

```python
@app.get("/api/eclipse/seasons")
async def get_eclipse_seasons(
    year: int = Query(...),
    latitude: float = Query(...),
    longitude: float = Query(...),
    countryISO: str = Query(...)
) -> EclipseSeasonsResponse:
    # Implementar lógica de cálculo de eclipses
    pass

@app.post("/api/eclipse/check")
async def check_eclipse_impact(request: EclipseCheckRequest) -> EclipseCheckResponse:
    # Implementar análisis de impacto
    pass

@app.get("/api/eclipse/legend")
async def get_eclipse_legend() -> dict:
    # Retornar documentación
    pass
```

## Notas de Implementación

1. **Cálculos Astronómicos**: Usar Swiss Ephemeris para cálculos precisos de eclipses
2. **Detección de Eclipses**: Implementar algoritmos para detectar eclipses solares y lunares
3. **Cálculo de Veredicto**: Implementar lógica para determinar Bhoga/Mokṣa/Neutral
4. **Regla 8.7**: Implementar cálculo de la regla 8.7 (división día/noche)
5. **Visibilidad**: Calcular países donde el eclipse es visible
6. **Ventana 18 años**: Implementar lógica para determinar efectos a largo plazo

## Datos de Ejemplo

El frontend actualmente usa datos de ejemplo cuando la API no está disponible. Una vez implementes estos endpoints, el frontend automáticamente usará los datos reales de la API.
