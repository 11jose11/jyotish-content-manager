# 🚀 Guía de Despliegue - Versión 2.0

## 📋 **Pasos para Desplegar en GitHub:**

### **1. Crear Repositorio en GitHub:**

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. **Nombre sugerido**: `jyotish-content-manager-v2`
3. **Descripción**: "Sistema completo de gestión de contenido Jyotish con frontend y backend conectados"
4. **Visibilidad**: Público (recomendado) o Privado
5. **NO inicialices** con README, .gitignore o licencia

### **2. Conectar Repositorio Local con GitHub:**

```bash
# Agregar el repositorio remoto (reemplaza USERNAME y REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Subir la rama principal
git push -u origin main

# Subir la rama de versión 2.0
git push origin version-2.0

# Subir el tag de versión
git push origin v2.0.0
```

### **3. Configurar GitHub Secrets (Opcional):**

Si quieres usar GitHub Actions para despliegue automático:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Agrega los siguientes secrets:

```
VERCEL_TOKEN=tu_vercel_token
VERCEL_ORG_ID=tu_org_id
VERCEL_PROJECT_ID=tu_project_id
VITE_API_BASE_URL=https://jyotish-api-273065401301.us-central1.run.app
VITE_API_KEY=tu_api_key
```

### **4. Configurar Vercel (Opcional):**

Si quieres despliegue automático:

1. Ve a [Vercel](https://vercel.com)
2. **New Project** → **Import Git Repository**
3. Selecciona tu repositorio
4. **Framework Preset**: Vite
5. **Root Directory**: `apps/frontend`
6. **Build Command**: `pnpm build`
7. **Output Directory**: `dist`
8. **Install Command**: `pnpm install`

### **5. Variables de Entorno en Vercel:**

```
VITE_API_BASE_URL=https://jyotish-api-273065401301.us-central1.run.app
VITE_API_KEY=tu_api_key_aqui
```

## 🔧 **Configuración del Backend:**

### **Google Cloud Run:**

El backend ya está desplegado en:
- **URL**: https://jyotish-api-273065401301.us-central1.run.app
- **CORS**: Configurado para múltiples dominios Vercel

### **Si necesitas desplegar tu propio backend:**

1. **Google Cloud Console** → **Cloud Run**
2. **Create Service**
3. **Source**: Upload from your local machine
4. **Container**: `gcr.io/PROJECT_ID/jyotish-api`
5. **Port**: 8080
6. **Memory**: 512 MiB
7. **CPU**: 1

## 📊 **Estructura del Repositorio:**

```
jyotish-content-manager-v2/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions
├── apps/
│   ├── frontend/               # React frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── vercel.json
│   └── backend/                # FastAPI backend
│       ├── main.py
│       └── Dockerfile
├── json-database/              # Datos JSON
├── README.md                   # Documentación principal
├── DEPLOYMENT.md              # Esta guía
└── LICENSE
```

## 🌐 **URLs de Despliegue:**

### **Frontend:**
- **Vercel**: https://jyotish-content-manager.vercel.app
- **GitHub Pages**: https://USERNAME.github.io/REPO_NAME

### **Backend:**
- **Google Cloud Run**: https://jyotish-api-273065401301.us-central1.run.app

## 🔍 **Verificación del Despliegue:**

### **1. Frontend:**
```bash
# Verificar que el sitio está funcionando
curl -I https://jyotish-content-manager.vercel.app
```

### **2. Backend:**
```bash
# Verificar que la API está funcionando
curl https://jyotish-api-273065401301.us-central1.run.app/health
```

### **3. Páginas Principales:**
- ✅ **Home**: https://jyotish-content-manager.vercel.app/
- ✅ **Panchanga**: https://jyotish-content-manager.vercel.app/panchanga
- ✅ **Transits**: https://jyotish-content-manager.vercel.app/transits
- ✅ **Positions**: https://jyotish-content-manager.vercel.app/positions
- ✅ **Navatara**: https://jyotish-content-manager.vercel.app/navatara
- ✅ **Diagnostics**: https://jyotish-content-manager.vercel.app/diagnostics

## 🚨 **Solución de Problemas:**

### **Error de CORS:**
- Verificar que el backend tiene configurado CORS para el dominio del frontend
- Revisar `apps/backend/main.py` - sección `allow_origins`

### **Error de Build:**
- Verificar que todas las dependencias están instaladas
- Revisar `apps/frontend/package.json`
- Ejecutar `pnpm install` en el directorio frontend

### **Error de API:**
- Verificar que la URL del backend es correcta
- Revisar variables de entorno en Vercel
- Verificar que el backend está funcionando

## 📝 **Notas Importantes:**

1. **Versión 2.0** incluye todas las funcionalidades principales
2. **Frontend y backend** están completamente conectados
3. **CORS** está configurado para múltiples dominios
4. **True Citra Paksha** ayanamsa para cálculos precisos
5. **9 planetas** con nakshatras y padas en la página de tránsitos

## 🎯 **Próximos Pasos:**

1. **Crear el repositorio** en GitHub
2. **Subir el código** usando los comandos de arriba
3. **Configurar Vercel** para despliegue automático
4. **Verificar** que todas las páginas funcionan
5. **Compartir** el enlace del proyecto

---

**🌙 Jyotish Content Manager v2.0 - Listo para producción** ✨
