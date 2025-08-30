# 🌙 Jyotish Content Manager - Versión 2.0

Sistema completo de gestión de contenido Jyotish con calendario panchanga interactivo y datos detallados.

## ✨ Características Principales

### 📅 Calendario Panchanga Interactivo
- **Carga progresiva** de datos del mes con pausas estratégicas para evitar errores CORS
- **Datos precisos** desde API con True Citra Paksha Ayanamsa
- **Información completa** de cada día: Nakshatra, Tithi, Karana, Vara, Yoga
- **Yogas especiales** detectados automáticamente
- **Panel de detalles** expandible con información completa del panchanga

### 🗃️ Sistema de Datos Optimizado
- **Archivo JSON unificado** (`panchanga-simplified.json`) con estructura consistente
- **Sistema de mapeo inteligente** para manejar diferentes formatos de nombres del API
- **Búsqueda en 4 niveles**: mapeo directo, exacta normalizada, parcial, mapeo inverso
- **Cache automático** con fallback para datos locales
- **27 Nakshatras** completos con clasificaciones y recomendaciones
- **15 Tithis** con elementos, deidades y actividades favorables/desfavorables
- **11 Karanas** móviles y fijos con planetas regentes
- **7 Varas** (días de la semana) con planetas y clasificaciones
- **27 Yogas** principales con deidades y significados

### 🤖 Generación de Reportes con AI
- **Prompt automático** construido con todos los datos del panchanga
- **Formato estructurado** para reportes de 90 segundos
- **Instrucciones específicas** para análisis narrativo
- **Copia y descarga** de prompts generados

### 🎨 Interfaz Moderna
- **Diseño responsivo** con Tailwind CSS y Shadcn/ui
- **Animaciones suaves** y transiciones elegantes
- **Tema oscuro/claro** automático
- **Indicadores de estado** para API y carga de datos
- **Debug visual** para monitoreo de datos

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Estado**: React Query (TanStack Query)
- **API**: Fetch con retry automático y backoff exponencial
- **Despliegue**: Vercel con configuración optimizada
- **Backend**: Python FastAPI con cálculos astronómicos precisos

## 📊 Estructura de Datos

### Archivo JSON Unificado
```json
{
  "metadata": { "version": "2.0", "structure": "unified" },
  "nakshatras": [...], // 27 nakshatras completos
  "tithis": [...],     // 15 tithis principales
  "karanas": [...],    // 11 karanas móviles y fijos
  "varas": [...],      // 7 días de la semana
  "yogas": [...],      // 27 yogas principales
  "specialYogas": [...] // Yogas especiales
}
```

### Sistema de Mapeo
```typescript
nameMappings = {
  nakshatras: {
    'Ashwini': 'Aśvinī',
    'Bharani': 'Bharaṇī',
    'Krittika': 'Kṛttikā',
    // ... 27 mapeos completos
  },
  varas: {
    'Sunday': 'Ravivara',
    'Monday': 'Somavara',
    // ... 7 mapeos completos
  }
}
```

## 🔧 Instalación y Uso

### Prerrequisitos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd jyotish-content-manager

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/frontend/env.sample apps/frontend/.env.local
# Editar .env.local con las variables necesarias

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```

### Variables de Entorno
```env
VITE_API_BASE_URL=https://jyotish-api-ndcfqrjivq-uc.a.run.app
VITE_API_KEY=your-api-key
```

## 📱 Uso del Sistema

### 1. Calendario Mensual
- Selecciona mes y año
- El sistema carga datos progresivamente (3 días por lote)
- Cada día muestra información básica del panchanga

### 2. Detalles del Día
- Haz click en cualquier día
- Se abre panel con información completa
- Datos incluyen: traducciones, deidades, clasificaciones, recomendaciones

### 3. Generación de Reportes
- En el panel de detalles, usa "Generar Reporte Diario con AI"
- Se construye prompt automático con todos los datos
- Copia o descarga el prompt para usar con AI

## 🎯 Funcionalidades Técnicas

### Carga Progresiva
- **Lotes de 3 días** para evitar sobrecarga del API
- **Pausas de 10 segundos** entre lotes
- **Retry automático** con backoff exponencial
- **Indicadores visuales** de progreso

### Sistema de Búsqueda
- **Mapeo directo**: Nombres del API → Nombres en JSON
- **Normalización**: Remoción de diacríticos y espacios
- **Búsqueda parcial**: Coincidencias flexibles
- **Mapeo inverso**: Búsqueda en todos los mapeos disponibles

### Cache y Fallback
- **Cache automático** de datos JSON
- **Fallback local** si falla la carga
- **Limpieza automática** de cache expirado
- **Logs detallados** para debugging

## 🌐 URLs de Despliegue

- **Frontend**: https://jyotish-content-manager.vercel.app
- **Página Panchanga**: https://jyotish-content-manager.vercel.app/panchanga
- **Backend API**: https://jyotish-api-ndcfqrjivq-uc.a.run.app

## 📈 Estado del Proyecto

### ✅ Completado
- [x] Sistema de carga progresiva del calendario
- [x] Panel de detalles del panchanga
- [x] Archivo JSON unificado con datos completos
- [x] Sistema de mapeo inteligente
- [x] Generación de prompts para AI
- [x] Interfaz moderna y responsiva
- [x] Sistema de cache y fallback
- [x] Logs detallados para debugging

### 🔄 En Desarrollo
- [ ] Más yogas especiales
- [ ] Exportación de datos en diferentes formatos
- [ ] Integración directa con APIs de AI
- [ ] Sistema de notificaciones

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Backend API**: Cálculos astronómicos precisos con True Citra Paksha Ayanamsa
- **Datos tradicionales**: Basados en textos clásicos de Jyotish
- **Comunidad Jyotish**: Por la validación y feedback continuo

---

**Versión 2.0** - Sistema completo de panchanga con datos simplificados y mapeo inteligente

