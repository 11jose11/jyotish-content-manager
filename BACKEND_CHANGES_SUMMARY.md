# Cambios Necesarios en el Backend

## Problema Identificado
El frontend está intentando llamar a endpoints de la API que no existen:
- `/v1/panchanga/recommendations/panchanga/all`
- `/v1/panchanga/recommendations/daily`

Solo existe el endpoint `/data/panchanga/recommendations` que devuelve datos estáticos.

## Solución Implementada
Se agregaron los siguientes endpoints al backend:

### 1. Endpoint para todas las recomendaciones
```
GET /v1/panchanga/recommendations/panchanga/all
```

**Respuesta esperada:**
```json
{
  "data": {
    "varas": [
      {
        "nombre": "Sunday",
        "es": "Domingo", 
        "planeta": "Sol",
        "tipo": "día_semana",
        "alias": "Ravivara",
        "descripcion_corta": "Día del Sol - favorable para actividades de liderazgo y autoridad",
        "consejo": "Día del Sol - favorable para actividades de liderazgo y autoridad",
        "actividades_sugeridas": ["Liderazgo", "Autoridad", "Actividades oficiales", "Deportes"],
        "lista_tradicional": ["Liderazgo", "Autoridad", "Actividades oficiales", "Deportes"]
      }
    ],
    "tithis": [...],
    "nakshatras": [...],
    "nitya_yogas": [...]
  }
}
```

### 2. Endpoint para recomendaciones diarias
```
GET /v1/panchanga/recommendations/daily?date=2025-01-15&latitude=19.0760&longitude=72.8777&vara=Monday&tithi=Pratipada&nakshatra=Aśvinī&nitya_yoga=Viśkumbha
```

**Respuesta esperada:**
```json
{
  "data": {
    "date": "2025-01-15",
    "latitude": 19.076,
    "longitude": 72.8777,
    "recommendations": {
      "vara": {
        "nombre": "Monday",
        "planeta": "Luna",
        "descripcion": "Día de la Luna - favorable para actividades emocionales y creativas",
        "actividades_sugeridas": ["Actividades emocionales", "Creatividad", "Arte", "Meditación"],
        "evitar": ["Actividades agresivas"]
      },
      "tithi": {...},
      "nakshatra": {...},
      "nitya_yoga": {...}
    }
  }
}
```

## Código a Agregar al Backend

### 1. Endpoints principales
```python
@app.get("/v1/panchanga/recommendations/panchanga/all")
async def get_all_panchanga_recommendations():
    """Get all panchanga recommendations in the new API format"""
    try:
        recommendations = load_panchanga_recommendations()
        
        # Transform the data to match the expected API format
        response_data = {
            "data": {
                "varas": [],
                "tithis": [],
                "nakshatras": [],
                "nitya_yogas": []
            }
        }
        
        # Transform varas
        if "varas" in recommendations:
            for vara_name, vara_data in recommendations["varas"].items():
                response_data["data"]["varas"].append({
                    "nombre": vara_name,
                    "es": get_vara_translation(vara_name),
                    "planeta": get_vara_planet(vara_name),
                    "tipo": "día_semana",
                    "alias": get_vara_alias(vara_name),
                    "descripcion_corta": vara_data.get("general", ""),
                    "consejo": vara_data.get("general", ""),
                    "actividades_sugeridas": vara_data.get("activities", []),
                    "lista_tradicional": vara_data.get("activities", [])
                })
        
        # Transform tithis, nakshatras, and yogas similarly...
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading panchanga recommendations: {str(e)}")

@app.get("/v1/panchanga/recommendations/daily")
async def get_daily_panchanga_recommendations(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    vara: Optional[str] = Query(None, description="Vara name"),
    tithi: Optional[str] = Query(None, description="Tithi name"),
    nakshatra: Optional[str] = Query(None, description="Nakshatra name"),
    nitya_yoga: Optional[str] = Query(None, description="Nitya yoga name")
):
    """Get daily panchanga recommendations based on specific elements"""
    try:
        recommendations = load_panchanga_recommendations()
        
        # Get recommendations for each element if provided
        daily_recommendations = {}
        
        if vara and "varas" in recommendations and vara in recommendations["varas"]:
            vara_data = recommendations["varas"][vara]
            daily_recommendations["vara"] = {
                "nombre": vara,
                "planeta": get_vara_planet(vara),
                "descripcion": vara_data.get("general", ""),
                "actividades_sugeridas": vara_data.get("activities", []),
                "evitar": vara_data.get("avoid", [])
            }
        
        # Similar logic for tithi, nakshatra, and nitya_yoga...
        
        return {
            "data": {
                "date": date,
                "latitude": latitude,
                "longitude": longitude,
                "recommendations": daily_recommendations
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading daily recommendations: {str(e)}")
```

### 2. Funciones auxiliares
```python
def get_vara_translation(vara_name: str) -> str:
    translations = {
        "Sunday": "Domingo",
        "Monday": "Lunes", 
        "Tuesday": "Martes",
        "Wednesday": "Miércoles",
        "Thursday": "Jueves",
        "Friday": "Viernes",
        "Saturday": "Sábado"
    }
    return translations.get(vara_name, vara_name)

def get_vara_planet(vara_name: str) -> str:
    planets = {
        "Sunday": "Sol",
        "Monday": "Luna",
        "Tuesday": "Marte", 
        "Wednesday": "Mercurio",
        "Thursday": "Júpiter",
        "Friday": "Venus",
        "Saturday": "Saturno"
    }
    return planets.get(vara_name, "Desconocido")

def get_vara_alias(vara_name: str) -> str:
    aliases = {
        "Sunday": "Ravivara",
        "Monday": "Somavara",
        "Tuesday": "Mangalavara",
        "Wednesday": "Budhavara", 
        "Thursday": "Guruvara",
        "Friday": "Shukravara",
        "Saturday": "Shanivara"
    }
    return aliases.get(vara_name, vara_name)

# Similar functions for tithi, nakshatra, and yoga transformations...
```

## Archivo de Datos Requerido
El backend necesita el archivo `data/panchanga.recommendations.es.json` con la estructura:
```json
{
  "varas": {
    "Sunday": {
      "general": "Día del Sol - favorable para actividades de liderazgo y autoridad",
      "activities": ["Liderazgo", "Autoridad", "Actividades oficiales", "Deportes"],
      "avoid": ["Actividades subordinadas"]
    }
  },
  "tithis": {...},
  "nakshatras": {...},
  "yogas": {...},
  "karanas": {...}
}
```

## Pruebas
Una vez implementado, puedes probar los endpoints:

```bash
# Probar endpoint general
curl "https://jyotish-api-ndcfqrjivq-uc.a.run.app/v1/panchanga/recommendations/panchanga/all"

# Probar endpoint diario
curl "https://jyotish-api-ndcfqrjivq-uc.a.run.app/v1/panchanga/recommendations/daily?date=2025-01-15&latitude=19.0760&longitude=72.8777&vara=Monday"
```

## Estado Actual
- ✅ Frontend configurado correctamente
- ✅ Endpoints implementados localmente y probados
- ⏳ Pendiente: Implementar en el backend del otro proyecto
- ⏳ Pendiente: Desplegar el backend actualizado
