# Reporte de Depuración - Webapp Frontend

## 📊 Análisis de Archivos

### 🗑️ Archivos Obsoletos/De Debug Identificados

#### Scripts de Debug/Prueba (OBSOLETOS)
- `debug-api-call.js` - Script de debug para llamadas API
- `debug-panchanga-api.js` - Script de debug para API de panchanga
- `test-eclipse-api.js` - Script de prueba para API de eclipses
- `test-frontend-api.js` - Script de prueba para API del frontend
- `test-json-local.js` - Script de prueba para archivos JSON locales
- `test-real-api-data.js` - Script de prueba para datos reales de API

#### Archivos de Documentación Temporal
- `CORS_FIX_GUIDE.md` - Guía temporal para arreglar CORS
- `ECLIPSE_API_SPEC.md` - Especificación temporal de API de eclipses

#### Archivos en dist/ (OBSOLETOS)
- `dist/test-json-access.html` - Archivo de prueba en el build

### ✅ Archivos Funcionales (MANTENER)

#### Configuración del Proyecto
- `package.json` - Dependencias del proyecto
- `package-lock.json` - Lock file de dependencias
- `tsconfig.json` - Configuración de TypeScript
- `tsconfig.node.json` - Configuración de TypeScript para Node
- `vite.config.ts` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind CSS
- `postcss.config.js` - Configuración de PostCSS
- `components.json` - Configuración de shadcn/ui
- `playwright.config.ts` - Configuración de Playwright

#### Scripts de Despliegue
- `deploy-vercel.sh` - Script de despliegue a Vercel
- `deploy.sh` - Script de despliegue general

#### Archivos de Entorno
- `env.sample` - Ejemplo de variables de entorno
- `env.production.sample` - Ejemplo de variables de producción

#### Documentación
- `README-VERCEL.md` - Documentación de despliegue en Vercel

#### Archivos de Configuración de Vercel
- `vercel.json` - Configuración de Vercel

#### Directorios Funcionales
- `src/` - Código fuente de la aplicación
- `public/` - Archivos públicos (incluyendo JSON database)
- `tests/` - Tests de Playwright
- `dist/` - Build de producción (excepto archivos de debug)

### 🔄 Archivos Duplicados

#### JSON Database
Los archivos JSON están duplicados en:
- `public/json-database/` (CORRECTO - para servir archivos estáticos)
- `public/` (OBSOLETO - archivos sueltos)
- `dist/` (OBSOLETO - archivos copiados al build)

## 🧹 Plan de Limpieza

### 1. Eliminar Scripts de Debug
```bash
rm debug-api-call.js
rm debug-panchanga-api.js
rm test-eclipse-api.js
rm test-frontend-api.js
rm test-json-local.js
rm test-real-api-data.js
```

### 2. Eliminar Archivos de Documentación Temporal
```bash
rm CORS_FIX_GUIDE.md
rm ECLIPSE_API_SPEC.md
```

### 3. Limpiar Directorio dist/
```bash
rm dist/test-json-access.html
```

### 4. Limpiar Archivos JSON Duplicados
```bash
# Mantener solo los de public/json-database/
rm public/karanas.json
rm public/Nakashatras.json
rm public/navatara.es.json
rm public/nitya-yogas.json
rm public/panchanga_rules.json
rm public/panchanga-simplified.json
rm public/TIthi.json
rm public/Vara.json
rm public/yogas-special.json
```

### 5. Verificar Estructura Final
```
apps/frontend/
├── src/                    # Código fuente
├── public/
│   └── json-database/      # Base de datos JSON
├── tests/                  # Tests de Playwright
├── dist/                   # Build de producción
├── node_modules/           # Dependencias
├── package.json            # Configuración del proyecto
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
├── tailwind.config.js      # Configuración Tailwind
├── postcss.config.js       # Configuración PostCSS
├── components.json         # Configuración shadcn/ui
├── playwright.config.ts    # Configuración Playwright
├── vercel.json             # Configuración Vercel
├── deploy-vercel.sh        # Script de despliegue
├── deploy.sh               # Script de despliegue
├── env.sample              # Variables de entorno
├── env.production.sample   # Variables de producción
└── README-VERCEL.md        # Documentación
```

## 📈 Beneficios de la Limpieza

1. **Reducción de tamaño**: Eliminación de archivos innecesarios
2. **Claridad**: Estructura más limpia y organizada
3. **Mantenimiento**: Menos archivos que mantener
4. **Performance**: Build más rápido sin archivos obsoletos
5. **Seguridad**: Eliminación de scripts de debug que podrían exponer información

## ⚠️ Consideraciones

- Los archivos JSON en `public/json-database/` son necesarios para el funcionamiento de la aplicación
- Los scripts de despliegue son funcionales y deben mantenerse
- La documentación de Vercel es útil para el despliegue
- Los tests de Playwright son parte del pipeline de CI/CD


