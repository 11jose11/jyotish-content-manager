#!/bin/bash

# Jyotish Content Manager - Setup Script
# Usage: ./setup.sh [API_URL] [API_KEY] [PROJECT_ID]

set -e

# Default values
API_URL=${1:-"https://your-api-service-xxxxx-uc.a.run.app"}
API_KEY=${2:-""}
PROJECT_ID=${3:-"your-project-id"}

echo "🚀 Jyotish Content Manager - Setup"
echo "API URL: $API_URL"
echo "API Key: ${API_KEY:+'***set***'}"
echo "Project ID: $PROJECT_ID"
echo ""

# Check if required tools are installed
echo "🔧 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup backend
echo "🔧 Setting up backend..."
cd apps/backend

# Create environment file
cat > .env << EOF
REMOTE_API_BASE_URL=$API_URL
REMOTE_API_KEY=$API_KEY
EPHE_PATH=/app/ephe
TZ_DEFAULT=UTC
SIDEREAL_AYANAMSHA=TRUE_CHITRA_PAKSHA_LAHIRI
EOF

# Install Python dependencies
pip install -e .

cd ..

# Setup frontend
echo "🔧 Setting up frontend..."
cd apps/frontend

# Create environment file
cat > .env.local << EOF
VITE_API_BASE_URL=$API_URL
VITE_API_KEY=$API_KEY
EOF

cd ../..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Deploy backend to Cloud Run:"
echo "   cd apps/backend"
echo "   ./deploy.sh $PROJECT_ID jyotish-backend us-central1"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   cd apps/frontend"
echo "   ./deploy.sh \"$API_URL\" \"$API_KEY\""
echo ""
echo "3. Or run locally:"
echo "   # Terminal 1 - Backend:"
echo "   cd apps/backend"
echo "   uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "   # Terminal 2 - Frontend:"
echo "   cd apps/frontend"
echo "   pnpm dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:8000"
