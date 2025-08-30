# 🌙 Jyotish Panchanga + Yogas - Versión Estable

## 📖 Descripción

Aplicación web estable para el cálculo y visualización de **Pañchāṅga** (los cinco elementos del tiempo) y **Yogas especiales** según la astrología védica. Esta versión incluye:

- 📅 **Calendario Panchanga** mensual con los 5 elementos
- 🧘 **Yogas especiales** con colores según auspiciosidad
- 🌍 **Integración con Google Places API** para ubicaciones
- ⚡ **API optimizada** con cálculos precisos
- 🎨 **Interfaz moderna** con shadcn/ui y Tailwind CSS

## ✨ Características Principales

### 📅 Calendario Panchanga
- **Tithi** (fase lunar) con número y nombre
- **Vara** (día de la semana) 
- **Nakshatra** (mansión lunar) con pada
- **Yoga** (combinación Sol-Luna)
- **Karana** (medio tithi)

### 🧘 Yogas Especiales
- **Detección automática** de yogas auspiciosos e inauspiciosos
- **Visualización en el calendario** con colores distintivos
- **Panel detallado** con descripciones y recomendaciones
- **Carga automática** de yogas del mes completo

### 🌍 Funcionalidades de Ubicación
- **Autocompletado** de ciudades con Google Places API
- **Cálculo automático** de coordenadas y timezone
- **Persistencia** de ubicación favorita
- **Cambio dinámico** de ubicación

## 🚀 Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **shadcn/ui** para componentes
- **Tailwind CSS** para estilos
- **TanStack Query** para manejo de estado
- **React Router** para navegación
- **Framer Motion** para animaciones

### APIs
- **Jyotish API** (Google Cloud Run) para cálculos astrológicos
- **Google Places API** para autocompletado de ubicaciones
- **Google Timezone API** para timezones

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/11jose11/jyotish-panchanga-stable.git
cd jyotish-panchanga-stable
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
VITE_API_BASE_URL=https://jyotish-api-ndcfqrjivq-uc.a.run.app
VITE_API_KEY=tu_api_key_aqui
VITE_GOOGLE_PLACES_API_KEY=tu_google_places_api_key_aqui
```

4. **Ejecutar en desarrollo**
```bash
pnpm dev
```

5. **Build para producción**
```bash
pnpm build
```

## 🌐 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Variables de entorno en Vercel
- `VITE_API_BASE_URL`
- `VITE_API_KEY` 
- `VITE_GOOGLE_PLACES_API_KEY`

## 📱 Uso

### Navegación
- **Página principal**: Información general
- **Panchanga**: Calendario mensual con los 5 elementos
- **Transits**: Posiciones planetarias (en desarrollo)
- **Navatara**: Cálculos de Navatara (en desarrollo)

### Funcionalidades del Calendario
1. **Seleccionar año/mes** en los controles superiores
2. **Cambiar ubicación** usando el selector de ciudad
3. **Ver yogas especiales** haciendo click en el icono ℹ️ de cada día
4. **Panel detallado** se abre mostrando todos los yogas del día

### Colores de Yogas
- 🟢 **Verde**: Yogas auspiciosos (favorables)
- 🔴 **Rojo**: Yogas inauspiciosos (desfavorables)

## 🔧 Configuración de APIs

### Jyotish API
- **URL**: https://jyotish-api-ndcfqrjivq-uc.a.run.app
- **Autenticación**: X-API-Key header
- **Endpoints principales**:
  - `GET /v1/panchanga/precise/daily` - Panchanga diario
  - `GET /v1/panchanga/yogas/detect` - Detección de yogas

### Google Places API
- **Habilitar**: Places API, Geocoding API, Timezone API
- **Configurar**: Restricciones de dominio para seguridad

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes shadcn/ui
│   ├── Layout.tsx      # Layout principal
│   └── LocationAutocomplete.tsx
├── lib/                # Utilidades y configuración
│   ├── api.ts          # Cliente API y hooks
│   └── utils.ts        # Funciones utilitarias
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx        # Página principal
│   ├── Panchanga.tsx   # Calendario Panchanga
│   ├── Transits.tsx    # Tránsitos (en desarrollo)
│   └── Navatara.tsx    # Navatara (en desarrollo)
└── main.tsx            # Punto de entrada
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests E2E (requiere Playwright)
pnpm test:e2e
```

## 📈 Estado del Proyecto

### ✅ Completado
- [x] Calendario Panchanga funcional
- [x] Detección de yogas especiales
- [x] Integración con Google Places API
- [x] Interfaz responsive y moderna
- [x] Despliegue en Vercel
- [x] Manejo de errores y loading states

### 🚧 En Desarrollo
- [ ] Página de Transits
- [ ] Página de Navatara
- [ ] Tests E2E completos
- [ ] PWA (Progressive Web App)

### 📋 Roadmap
- [ ] Exportación de datos (PDF, CSV)
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Múltiples idiomas
- [ ] Temas personalizables

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Swiss Ephemeris** para cálculos astronómicos precisos
- **shadcn/ui** por los componentes de UI
- **Google APIs** por servicios de ubicación
- **Comunidad Jyotish** por el conocimiento védico

## 📞 Contacto

- **Desarrollador**: José
- **GitHub**: [@11jose11](https://github.com/11jose11)
- **Proyecto**: [Jyotish Panchanga Stable](https://github.com/11jose11/jyotish-panchanga-stable)

---

**🌙 Que la sabiduría védica ilumine tu camino** ✨

