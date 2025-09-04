# 🚀 Despliegue en Vercel - Jyotish Frontend

## 📋 **Requisitos Previos**

1. **Cuenta de Vercel**: [vercel.com](https://vercel.com)
2. **Vercel CLI**: `npm install -g vercel`
3. **API Key**: Tu API key para la API de Jyotish

## 🔧 **Configuración Rápida**

### **Opción 1: Despliegue Automático (Recomendado)**

```bash
# 1. Navegar al directorio del frontend
cd apps/frontend

# 2. Ejecutar script de despliegue
./deploy-vercel.sh tu_api_key_aqui
```

### **Opción 2: Despliegue Manual**

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp env.sample .env.production
# Editar .env.production con tu API key

# 3. Construir proyecto
pnpm build

# 4. Desplegar
vercel --prod
```

## 🌐 **Variables de Entorno**

### **Configuración en Vercel Dashboard:**

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Navega a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```bash
VITE_API_BASE_URL=https://jyotish-api-ndcfqrjivq-uc.a.run.app
VITE_API_KEY=tu_api_key_aqui
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCI239BEMuN0jk49prWfDngFwpe4pYcvAg
```

### **Configuración por Entorno:**

- **Production**: Todas las variables
- **Preview**: Todas las variables
- **Development**: Opcional (usa .env.local)

## 🏗️ **Configuración del Proyecto**

### **Framework**: Vite + React + TypeScript
### **Build Command**: `pnpm build`
### **Output Directory**: `dist`
### **Install Command**: `pnpm install`

## 🔄 **Despliegue Automático**

### **GitHub Integration:**

1. Conecta tu repositorio de GitHub a Vercel
2. Cada push a `main` desplegará automáticamente
3. Los pull requests crearán preview deployments

### **Configuración de Dominio:**

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura DNS según las instrucciones de Vercel

## 📊 **Monitoreo y Analytics**

### **Vercel Analytics:**
- Automáticamente habilitado
- Métricas de rendimiento
- Análisis de usuarios

### **Logs:**
- Ve a **Functions** para ver logs del servidor
- **Deployments** para logs de build

## 🛠️ **Troubleshooting**

### **Error de Build:**
```bash
# Verificar dependencias
pnpm install

# Limpiar cache
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verificar TypeScript
pnpm type-check
```

### **Error de Variables de Entorno:**
```bash
# Verificar que las variables están configuradas
vercel env ls

# Agregar variable
vercel env add VITE_API_KEY
```

### **Error de CORS:**
- Verificar que `VITE_API_BASE_URL` apunta a tu API
- Confirmar que la API tiene CORS configurado para tu dominio de Vercel

## 🔒 **Seguridad**

### **API Key:**
- Nunca commits la API key en el código
- Usa variables de entorno de Vercel
- Rota la API key regularmente

### **CORS:**
- La API debe permitir tu dominio de Vercel
- Configurar `Access-Control-Allow-Origin` apropiadamente

## 📱 **Optimizaciones**

### **Performance:**
- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Optimización de imágenes
- ✅ Minificación automática

### **SEO:**
- ✅ Meta tags dinámicos
- ✅ Open Graph tags
- ✅ Sitemap automático

## 🎯 **URLs Importantes**

### **Tu Aplicación:**
```
https://[tu-proyecto].vercel.app
```

### **API Backend:**
```
https://jyotish-api-ndcfqrjivq-uc.a.run.app
```

### **Documentación API:**
```
https://jyotish-api-ndcfqrjivq-uc.a.run.app/docs
```

## 📞 **Soporte**

### **Vercel Support:**
- [Documentación Vercel](https://vercel.com/docs)
- [Comunidad Vercel](https://github.com/vercel/vercel/discussions)

### **Proyecto:**
- Revisar logs en Vercel Dashboard
- Verificar variables de entorno
- Comprobar conectividad con la API

---

**🎉 ¡Tu aplicación Jyotish estará disponible en Vercel!**





