#!/bin/bash

# Script para desplegar en Vercel
# Uso: ./deploy-vercel.sh [API_KEY]

set -e

echo "🚀 Desplegando Jyotish Frontend en Vercel..."

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ No se encontró package.json. Asegúrate de estar en el directorio del frontend."
    exit 1
fi

# API Key como argumento opcional
API_KEY=${1:-"your_api_key_here"}

echo "📦 Instalando dependencias..."
pnpm install

echo "🔧 Configurando variables de entorno..."
# Crear archivo .env.production temporal
cat > .env.production << EOF
VITE_API_BASE_URL=https://jyotish-api-ndcfqrjivq-uc.a.run.app
VITE_API_KEY=${API_KEY}
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCI239BEMuN0jk49prWfDngFwpe4pYcvAg
EOF

echo "🏗️ Construyendo proyecto..."
pnpm build

echo "🚀 Desplegando en Vercel..."
vercel --prod --yes

echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación estará disponible en: https://[tu-proyecto].vercel.app"

# Limpiar archivo temporal
rm -f .env.production

echo "🎉 ¡Despliegue exitoso!"




