# 🌙 Jyotish Content Manager - Versión 2.0

**Sistema completo de gestión de contenido Jyotish con frontend y backend conectados**

## 🚀 **Estado Actual - Versión 2.0**

### ✅ **Funcionalidades Implementadas:**

#### **Frontend (React + TypeScript + Vite)**
- **🌐 Páginas principales:**
  - **Panchanga Calendar**: Calendario mensual con elementos panchanga
  - **Transits**: Posiciones planetarias de los 9 planetas con nakshatras y padas
  - **Positions**: Visualización de posiciones planetarias
  - **Navatara**: Cálculos de navatara
  - **Diagnostics**: Estado del sistema y API

- **🎨 UI/UX:**
  - Diseño moderno con Tailwind CSS
  - Componentes animados y responsivos
  - Autocompletado de ubicaciones
  - Interfaz intuitiva y accesible

#### **Backend (FastAPI + Python)**
- **🔧 API Endpoints:**
  - `/v1/calendar/month` - Calendario mensual con posiciones planetarias
  - `/v1/panchanga/precise/daily` - Panchanga diario preciso
  - `/v1/panchanga/yogas/detect` - Detección de yogas especiales
  - `/v1/chesta-bala/calculate` - Cálculo de Chesta Bala
  - `/health` - Estado del sistema

- **🌍 CORS configurado** para múltiples dominios Vercel
- **📊 True Citra Paksha Ayanamsa** para cálculos astronómicamente precisos
- **🔮 Swiss Ephemeris** para posiciones planetarias exactas

### 🌟 **Características Destacadas:**

1. **Posiciones Planetarias Precisas:**
   - 9 planetas (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu)
   - Nakshatras y padas calculados con True Citra Paksha
   - Estados de movimiento (retrógrado, directo)
   - Longitudes eclípticas precisas

2. **Calendario Panchanga:**
   - Tithi, Vara, Nakshatra, Yoga, Karana
   - Yogas especiales detectados automáticamente
   - Cálculos basados en sunrise como referencia

3. **Sistema de Ubicaciones:**
   - Autocompletado de ciudades
   - Coordenadas geográficas automáticas
   - Zonas horarias precisas

## 🛠 **Tecnologías Utilizadas:**

### **Frontend:**
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **Tailwind CSS** para estilos
- **TanStack Query** para gestión de estado
- **Shadcn/ui** para componentes
- **Vercel** para despliegue

### **Backend:**
- **FastAPI** con Python
- **Swiss Ephemeris** para cálculos astronómicos
- **Google Cloud Run** para despliegue
- **CORS** configurado para frontend

## 📦 **Estructura del Proyecto:**

```
Jyotish content manager/
├── apps/
│   ├── frontend/          # React frontend
│   │   ├── src/
│   │   │   ├── components/    # Componentes UI
│   │   │   ├── pages/         # Páginas principales
│   │   │   └── lib/           # Utilidades y API
│   │   └── ...
│   └── backend/           # FastAPI backend
│       ├── main.py        # API principal
│       ├── data/          # Datos JSON
│       └── ...
├── json-database/         # Base de datos JSON
└── ...
```

## 🚀 **Despliegue:**

### **Frontend:**
- **URL**: https://jyotish-content-manager.vercel.app
- **Plataforma**: Vercel
- **Build**: Automático desde GitHub

### **Backend:**
- **URL**: https://jyotish-api-273065401301.us-central1.run.app
- **Plataforma**: Google Cloud Run
- **CORS**: Configurado para frontend

## 🔧 **Configuración Local:**

### **Prerrequisitos:**
- Node.js 18+
- Python 3.11+
- pnpm

### **Instalación:**
```bash
# Clonar repositorio
git clone <repository-url>
cd "Jyotish content manager"

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Ejecutar setup
./setup.sh
```

### **Desarrollo:**
```bash
# Frontend
cd apps/frontend
pnpm dev

# Backend
cd apps/backend
uvicorn main:app --reload
```

## 📊 **Endpoints API Principales:**

### **Calendario Mensual:**
```
GET /v1/calendar/month
Parámetros: year, month, place_id, format, anchor
```

### **Panchanga Diario:**
```
GET /v1/panchanga/precise/daily
Parámetros: date, latitude, longitude, reference_time
```

### **Yogas Especiales:**
```
GET /v1/panchanga/yogas/detect
Parámetros: date, latitude, longitude
```

## 🌟 **Mejoras en Versión 2.0:**

1. **✅ Conexión Frontend-Backend:**
   - Endpoints reales en lugar de mock data
   - Datos astronómicamente precisos
   - Manejo robusto de errores

2. **✅ Página de Tránsitos Funcional:**
   - 9 planetas con nakshatras y padas
   - Posiciones calculadas con True Citra Paksha
   - Visualización clara y organizada

3. **✅ CORS Configurado:**
   - Múltiples dominios Vercel permitidos
   - Comunicación segura frontend-backend

4. **✅ Sistema de Ubicaciones:**
   - Autocompletado funcional
   - Coordenadas automáticas
   - Zonas horarias precisas

## 🔮 **Próximas Mejoras:**

- [ ] Integración con Google Places API para place_id dinámico
- [ ] Panel detallado de panchanga diario
- [ ] Exportación de datos a CSV/PDF
- [ ] Más opciones de ayanamsa
- [ ] Cálculos de horóscopo natal

## 📝 **Licencia:**

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 🤝 **Contribución:**

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

**🌙 Jyotish Content Manager v2.0 - Conectando tradición védica con tecnología moderna** ✨

