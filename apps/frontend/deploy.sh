#!/bin/bash

# Jyotish Frontend - Vercel Deployment Script
# Usage: ./deploy.sh [API_URL] [API_KEY]

set -e

# Default values
API_URL=${1:-"https://your-api-service-xxxxx-uc.a.run.app"}
API_KEY=${2:-""}

echo "🚀 Deploying Jyotish Frontend to Vercel"
echo "API URL: $API_URL"
echo "API Key: ${API_KEY:+'***set***'}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Create production environment file
echo "📝 Creating production environment file..."
cat > .env.production << EOF
VITE_API_BASE_URL=$API_URL
VITE_API_KEY=$API_KEY
EOF

echo "✅ Environment file created:"
echo "  - VITE_API_BASE_URL=$API_URL"
echo "  - VITE_API_KEY=${API_KEY:+'***set***'}"
echo ""

# Build the project
echo "🏗️ Building the project..."
pnpm build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment successful!"
echo "🌐 Your app should be live at the URL shown above"
echo ""
echo "🔧 To update environment variables:"
echo "vercel env add VITE_API_BASE_URL"
echo "vercel env add VITE_API_KEY"
echo ""
echo "📊 To view deployment:"
echo "vercel ls"
