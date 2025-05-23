#!/bin/bash

# Not a Label Deployment Script
# This script deploys the entire platform including backend, frontend, and automation services

set -e  # Exit on error

echo "🚀 Not a Label Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root!${NC}"
   exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p not-a-label-backend/data
mkdir -p not-a-label-backend/logs
mkdir -p not-a-label-backend/uploads

# Backend setup
echo "🔧 Setting up backend..."
cd not-a-label-backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "🔐 Creating .env file..."
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your credentials${NC}"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run db:init 2>/dev/null || true

# Build TypeScript
echo "🏗️  Building backend..."
npm run build

# Start Temporal infrastructure
echo "🎯 Starting Temporal services..."
docker-compose -f docker-compose.temporal.yml up -d temporal temporal-db temporal-web

# Wait for Temporal to be ready
echo "⏳ Waiting for Temporal to start..."
sleep 10

# Check if Temporal is running
if ! docker ps | grep -q temporal; then
    echo -e "${RED}❌ Temporal failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Temporal is running${NC}"

# Build and start the worker
echo "👷 Starting Temporal worker..."
docker-compose -f docker-compose.temporal.yml up -d social-media-worker

# Start the notification test server
echo "🔔 Starting notification server..."
nohup node test-notifications.js > logs/notifications.log 2>&1 &
NOTIFICATION_PID=$!
echo $NOTIFICATION_PID > logs/notification-server.pid

# Start the backend server
echo "🚀 Starting backend server..."
nohup npm start > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend-server.pid

cd ..

# Frontend setup (if needed)
if [ -d "not-a-label-frontend" ]; then
    echo "🎨 Setting up frontend..."
    cd not-a-label-frontend
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Build frontend
    echo "🏗️  Building frontend..."
    npm run build
    
    # Start frontend
    echo "🌐 Starting frontend server..."
    nohup npm start > ../not-a-label-backend/logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../not-a-label-backend/logs/frontend-server.pid
    
    cd ..
fi

# Create systemd service files (optional for production)
echo "📝 Creating systemd service files..."

# Backend service
cat > not-a-label-backend.service << EOF
[Unit]
Description=Not a Label Backend Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD/not-a-label-backend
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Worker service
cat > not-a-label-worker.service << EOF
[Unit]
Description=Not a Label Temporal Worker
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD/not-a-label-backend
ExecStart=/usr/bin/docker-compose -f docker-compose.temporal.yml up social-media-worker
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

echo -e "${YELLOW}💡 To install systemd services, run:${NC}"
echo "sudo cp *.service /etc/systemd/system/"
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable not-a-label-backend not-a-label-worker"

# Status check
echo ""
echo "📊 Deployment Status:"
echo "===================="

# Check backend
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Running (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend: Failed to start${NC}"
fi

# Check notification server
if ps -p $NOTIFICATION_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Notification Server: Running (PID: $NOTIFICATION_PID)${NC}"
else
    echo -e "${RED}❌ Notification Server: Failed to start${NC}"
fi

# Check Temporal
if docker ps | grep -q temporal; then
    echo -e "${GREEN}✅ Temporal: Running${NC}"
else
    echo -e "${RED}❌ Temporal: Not running${NC}"
fi

# Check worker
if docker ps | grep -q social-media-worker; then
    echo -e "${GREEN}✅ Worker: Running${NC}"
else
    echo -e "${YELLOW}⚠️  Worker: May still be starting...${NC}"
fi

echo ""
echo "🌐 Access Points:"
echo "================"
echo "📱 Enhanced Dashboard: file://$PWD/enhanced-dashboard.html"
echo "🔔 Test Client: file://$PWD/not-a-label-backend/test-client.html"
echo "🚀 Backend API: http://localhost:4000"
echo "⚙️  Temporal Web UI: http://localhost:8080"
echo "📊 Notification Test: http://localhost:4001/test"

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Edit not-a-label-backend/.env with your OAuth credentials"
echo "2. Open the Enhanced Dashboard in your browser"
echo "3. Connect your social media accounts"
echo "4. Start automating your music career!"

echo ""
echo "🛑 To stop all services, run: ./stop.sh"