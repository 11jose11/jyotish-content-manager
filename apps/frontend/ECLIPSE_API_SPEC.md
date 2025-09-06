# Panchanga API Endpoints Specification

## Endpoint Principal
**URL:** `/v1/panchanga/recommendations/panchanga/all`
**Método:** GET
**Descripción:** Devuelve todos los 5 angas del panchanga con recomendaciones completas

### Estructura de Respuesta:
```json
{
  "data": {
    "varas": [...], // 7 días de la semana
    "tithis": [...], // 15 días lunares
    "nakshatras": [...], // 27 constelaciones lunares
    "nitya_yogas": [...] // 27 yogas diarios
  }
}
```

## Endpoints de Soporte:
- `/v1/panchanga/recommendations/summary` - Resumen de todos los elementos
- `/v1/panchanga/recommendations/daily` - Recomendaciones diarias personalizadas
- Endpoints individuales para cada elemento (vara, tithi, nakshatra, nitya-yoga)

## URL del Servicio:
https://jyotish-api-ndcfqrjivq-uc.a.run.app


