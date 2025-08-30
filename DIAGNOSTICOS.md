# 🔧 Sistema de Diagnóstico de Conectividad

## 📋 **Descripción General**

Sistema completo de diagnóstico end-to-end para monitorear la cadena de conectividad:
**Frontend → Backend → API Remota (Cloud Run)**

## 🏗️ **Arquitectura del Sistema**

### **Backend (FastAPI)**
- **Endpoint**: `GET /diagnostics/ping`
- **Funcionalidad**: Verifica estado del backend y conectividad con API remota
- **Tecnologías**: httpx, timeouts, reintentos exponenciales

### **Frontend (React)**
- **Componente**: `ConnectionStatus` - Chip de estado en header
- **Página**: `/diagnostics` - Diagnóstico completo
- **Funcionalidad**: Monitoreo en tiempo real, alertas visuales

## 🔍 **Endpoint de Diagnóstico**

### **URL**: `GET /diagnostics/ping`

### **Respuesta JSON**:
```json
{
  "backend": {
    "ok": true,
    "ts": "2025-01-23T12:00:00Z",
    "version": "1.0.0",
    "ephemeris": true
  },
  "remote": {
    "baseUrl": "https://your-api-service-xxxxx-uc.a.run.app",
    "ok": true,
    "latencyMs": 184,
    "endpoints": {
      "/healthz": {
        "ok": true,
        "status": 200,
        "latencyMs": 45.2
      },
      "/positions/month": {
        "ok": true,
        "status": 200,
        "latencyMs": 156.8
      },
      "/panchanga/month": {
        "ok": true,
        "status": 200,
        "latencyMs": 203.1
      }
    }
  }
}
```

## 🎯 **Estados de Conexión**

### **1. OK (Verde)**
- ✅ Backend local operativo
- ✅ API remota conectada
- ✅ Todos los endpoints responden

### **2. Warning (Amarillo)**
- ✅ Backend local operativo
- ❌ API remota no disponible
- 🔄 Modo degradado activo (cálculos locales)

### **3. Error (Rojo)**
- ❌ Backend local no disponible
- ❌ Sin conectividad
- 🚫 Funcionalidad limitada

## 🔧 **Implementación Backend**

### **Dependencias**:
```toml
dependencies = [
    "httpx>=0.25.0",
    "requests>=2.31.0"
]
```

### **Funciones Principales**:

#### **1. check_remote_endpoint()**
```python
async def check_remote_endpoint(client: httpx.AsyncClient, endpoint: str, timeout: float = 20.0) -> EndpointStatus:
    """Verifica un endpoint específico de la API remota"""
    # Headers con autenticación
    # Timeout de 20 segundos
    # Medición de latencia
    # Manejo de errores
```

#### **2. diagnose_remote_api()**
```python
async def diagnose_remote_api() -> RemoteDiagnostic:
    """Diagnóstico completo de la API remota"""
    # Verificación de conectividad base
    # Test de endpoints individuales
    # Medición de latencia general
    # Manejo de errores de red
```

#### **3. ping_diagnostics()**
```python
@app.get("/diagnostics/ping", response_model=DiagnosticResponse)
async def ping_diagnostics():
    """Endpoint principal de diagnóstico"""
    # Estado del backend
    # Diagnóstico remoto
    # Respuesta estructurada
```

## 🎨 **Implementación Frontend**

### **Componentes Creados**:

#### **1. ConnectionStatus**
- **Ubicación**: `src/components/ConnectionStatus.tsx`
- **Funcionalidad**: Chip de estado en header
- **Características**:
  - Indicador visual de estado
  - Tooltip con información básica
  - Panel expandible con detalles
  - Botón de refresh manual

#### **2. Diagnostics Page**
- **Ubicación**: `src/pages/Diagnostics.tsx`
- **Funcionalidad**: Página completa de diagnóstico
- **Características**:
  - Resumen visual del estado
  - Tabla de endpoints
  - JSON raw para debugging
  - Alertas de modo degradado

### **Utilidades**:
- **Ubicación**: `src/lib/diagnostics.ts`
- **Funciones**:
  - `getConnectionStatus()` - Determina estado general
  - `getStatusColor()` - Colores para UI
  - `formatLatency()` - Formateo de latencia
  - `formatTimestamp()` - Formateo de fechas

### **Hook de API**:
```typescript
export const useDiagnostics = () => {
  return useQuery({
    queryKey: ['diagnostics'],
    queryFn: () => apiClient.get('/diagnostics/ping'),
    refetchInterval: 60000, // Cada minuto
    staleTime: 30000, // Stale después de 30s
  })
}
```

## 🚀 **Características del Sistema**

### **1. Monitoreo Automático**
- ✅ **Refresh automático** cada 60 segundos
- ✅ **Cache inteligente** con TanStack Query
- ✅ **Actualización en tiempo real**

### **2. Timeouts y Reintentos**
- ✅ **Timeout de 20 segundos** por request
- ✅ **Reintentos exponenciales** (0.25s, 0.5s, 1s)
- ✅ **Manejo robusto de errores**

### **3. Autenticación**
- ✅ **Headers automáticos** (Authorization, x-api-key)
- ✅ **Configuración flexible** de API keys
- ✅ **Fallback seguro** si no hay credenciales

### **4. UI/UX**
- ✅ **Indicadores visuales** claros
- ✅ **Animaciones suaves** con Framer Motion
- ✅ **Responsive design** completo
- ✅ **Accesibilidad** mantenida

## 📊 **Métricas Monitoreadas**

### **Backend Local**:
- Estado operativo
- Versión del software
- Disponibilidad de efemérides
- Timestamp de última verificación

### **API Remota**:
- Conectividad base
- Latencia general
- Estado de endpoints individuales:
  - `/healthz` - Health check
  - `/positions/month` - Posiciones planetarias
  - `/panchanga/month` - Datos de panchanga

### **Endpoints Individuales**:
- Código de estado HTTP
- Latencia específica
- Mensajes de error detallados

## 🔄 **Modo Degradado**

### **Activación**:
- Backend local OK
- API remota no disponible
- Cálculos locales activos

### **Comportamiento**:
- ✅ Funcionalidad básica mantenida
- ⚠️ Alertas visuales de modo degradado
- 📊 Datos cacheados si están disponibles
- 🔄 Reintentos automáticos de conexión

### **UI Indicators**:
- Chip amarillo en header
- Alertas en página de diagnóstico
- Mensajes informativos para el usuario

## 🛠️ **Configuración**

### **Variables de Entorno Backend**:
```bash
REMOTE_API_BASE_URL=https://your-api-service-xxxxx-uc.a.run.app
REMOTE_API_KEY=your-api-key-here
```

### **Variables de Entorno Frontend**:
```bash
VITE_API_BASE_URL=https://your-backend-service-xxxxx-uc.a.run.app
VITE_API_KEY=your-api-key-here
```

## 📱 **Navegación**

### **Ruta**: `/diagnostics`
- Accesible desde el sidebar
- Icono: 🔧
- Nombre: "Diagnóstico"

### **Componentes de UI**:
- Chip de estado en header
- Página completa de diagnóstico
- Tooltips informativos
- Alertas contextuales

## 🔍 **Debugging**

### **JSON Raw**:
- Disponible en pestaña "JSON Raw"
- Datos completos del diagnóstico
- Formato legible para debugging

### **Logs del Backend**:
```bash
# Ver logs en tiempo real
gcloud logs tail --service=jyotish-backend --region=us-central1

# Filtrar por diagnóstico
gcloud logs tail --service=jyotish-backend --region=us-central1 --filter="diagnostics"
```

### **Testing Manual**:
```bash
# Test directo del endpoint
curl -X GET "https://your-backend-service-xxxxx-uc.a.run.app/diagnostics/ping"

# Con autenticación
curl -X GET "https://your-backend-service-xxxxx-uc.a.run.app/diagnostics/ping" \
  -H "Authorization: Bearer your-api-key"
```

## 🎯 **Casos de Uso**

### **1. Monitoreo Proactivo**
- Verificar estado de servicios
- Detectar problemas antes que afecten usuarios
- Monitorear latencia de API remota

### **2. Troubleshooting**
- Identificar punto de falla en la cadena
- Debugging de problemas de conectividad
- Análisis de performance

### **3. Modo Degradado**
- Continuidad de servicio cuando API remota falla
- Alertas claras al usuario
- Funcionalidad básica mantenida

### **4. DevOps**
- Health checks para load balancers
- Monitoreo de SLA
- Alertas automáticas

## ✨ **Beneficios**

1. **Visibilidad completa** de la infraestructura
2. **Detección temprana** de problemas
3. **Modo degradado** para continuidad de servicio
4. **Debugging simplificado** con datos estructurados
5. **UX mejorada** con indicadores claros
6. **Monitoreo proactivo** de la salud del sistema
