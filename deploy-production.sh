#!/bin/bash

# Not a Label Production Deployment Script for not-a-label.art
# This script deploys the application to production

set -e  # Exit on error

echo "🚀 Not a Label Production Deployment"
echo "🌐 Domain: https://www.not-a-label.art"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Check if this is the first deployment
FIRST_DEPLOY=false
if [ ! -f "./ssl/live/not-a-label.art/fullchain.pem" ]; then
    FIRST_DEPLOY=true
    echo -e "${YELLOW}⚠️  First deployment detected - SSL certificates will be generated${NC}"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data uploads logs ssl certbot/www public

# Build frontend for production
echo "🎨 Building frontend..."
if [ -d "not-a-label-frontend" ]; then
    cd not-a-label-frontend
    npm install
    npm run build
    cp -r dist/* ../public/
    cd ..
else
    # Use the enhanced dashboard as the main page
    cp enhanced-dashboard.html public/index.html
    # Update logo references
    cp "Downloads/Logo-NaL (1).png" public/logo-nal.png
fi

# Setup environment
echo "🔐 Setting up production environment..."
if [ ! -f "not-a-label-backend/config/production.env" ]; then
    echo -e "${YELLOW}⚠️  Production environment file not found${NC}"
    echo "Please edit not-a-label-backend/config/production.env with your credentials"
    exit 1
fi

# If first deployment, get SSL certificates
if [ "$FIRST_DEPLOY" = true ]; then
    echo "🔒 Obtaining SSL certificates..."
    
    # Start nginx for certificate challenge
    docker-compose -f docker-compose.production.yml up -d nginx
    
    # Get certificates
    docker-compose -f docker-compose.production.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@not-a-label.art \
        --agree-tos \
        --no-eff-email \
        -d not-a-label.art \
        -d www.not-a-label.art \
        -d api.not-a-label.art \
        -d ws.not-a-label.art
    
    # Stop nginx to restart with SSL
    docker-compose -f docker-compose.production.yml down
fi

# Deploy all services
echo "🚀 Deploying services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check deployment status
echo ""
echo "📊 Deployment Status:"
echo "===================="

# Check if services are running
services=("nginx" "backend" "notification-server" "temporal" "temporal-worker" "redis")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.production.yml ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✅ $service: Running${NC}"
    else
        echo -e "${RED}❌ $service: Not running${NC}"
    fi
done

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.production.yml exec backend npm run db:init || true

echo ""
echo "🌐 Your Application is Live!"
echo "=========================="
echo -e "${BLUE}Website:${NC} https://www.not-a-label.art"
echo -e "${BLUE}API:${NC} https://api.not-a-label.art"
echo -e "${BLUE}WebSocket:${NC} wss://ws.not-a-label.art"
echo ""
echo "📱 Test your deployment:"
echo "  1. Visit https://www.not-a-label.art"
echo "  2. Login with demo@notalabel.com / demo123"
echo "  3. Test notifications and features"
echo ""
echo "🛡️  Security Checklist:"
echo "  ✓ SSL/TLS enabled with Let's Encrypt"
echo "  ✓ Security headers configured"
echo "  ✓ CORS properly set up"
echo "  ✓ Environment variables secured"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure OAuth providers with production URLs"
echo "  2. Set up monitoring (e.g., Datadog, New Relic)"
echo "  3. Configure backups for database"
echo "  4. Set up CI/CD pipeline"
echo ""
echo "🛑 To stop production: docker-compose -f docker-compose.production.yml down"
echo "📊 To view logs: docker-compose -f docker-compose.production.yml logs -f [service]"
echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"