#!/bin/bash

# Jyotish Backend - Cloud Run Deployment Script
# Usage: ./deploy.sh [PROJECT_ID] [SERVICE_NAME] [REGION]

set -e

# Default values
PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME=${2:-"jyotish-backend"}
REGION=${3:-"us-central1"}

echo "🚀 Deploying Jyotish Backend to Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "gcloud auth login"
    exit 1
fi

# Set project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build and deploy
echo "🏗️ Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 10 \
    --set-env-vars="EPHE_PATH=/app/ephe,TZ_DEFAULT=UTC,SIDEREAL_AYANAMSHA=TRUE_CHITRA_PAKSHA_LAHIRI" \
    --set-env-vars="REMOTE_API_BASE_URL=${REMOTE_API_BASE_URL:-}" \
    --set-env-vars="REMOTE_API_KEY=${REMOTE_API_KEY:-}" \
    --port 8000

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "✅ Deployment successful!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/healthz"
echo ""
echo "📋 Environment variables set:"
echo "  - EPHE_PATH=/app/ephe"
echo "  - TZ_DEFAULT=UTC"
echo "  - SIDEREAL_AYANAMSHA=TRUE_CHITRA_PAKSHA_LAHIRI"
echo "  - REMOTE_API_BASE_URL=${REMOTE_API_BASE_URL:-'not set'}"
echo "  - REMOTE_API_KEY=${REMOTE_API_KEY:+'***set***'}"
echo ""
echo "🔧 To update environment variables:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars=KEY=VALUE"
echo ""
echo "📊 To view logs:"
echo "gcloud logs tail --service=$SERVICE_NAME --region=$REGION"
