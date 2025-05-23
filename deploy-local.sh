#!/bin/bash

# Not a Label Local Deployment Script (No Docker)
# This script deploys the platform locally without Docker

set -e  # Exit on error

echo "🚀 Not a Label Local Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

echo -e "${GREEN}✅ Prerequisites met${NC}"

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

# Additional dependencies for social automation
npm install --save @temporalio/client @temporalio/worker @temporalio/workflow @temporalio/activity
npm install --save twitter-api-v2 discord.js puppeteer @aws-sdk/client-secrets-manager
npm install --save-dev nodemon

# Setup environment file
if [ ! -f .env ]; then
    echo "🔐 Creating .env file..."
    cp env.example .env 2>/dev/null || cat > .env << EOF
# Database
DATABASE_PATH=./data/notalabel.db

# JWT
JWT_SECRET=$(openssl rand -hex 32)

# Temporal (will run locally)
TEMPORAL_ADDRESS=localhost:7233

# OAuth (add your credentials)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=http://localhost:3000/oauth/twitter/callback

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:3000/oauth/discord/callback

# Encryption
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=

# Environment
NODE_ENV=development
PORT=4000
EOF
    echo -e "${YELLOW}⚠️  Please edit .env file with your OAuth credentials${NC}"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run db:init

# Build TypeScript
echo "🏗️  Building backend..."
npm run build

# Kill any existing processes on our ports
echo "🧹 Cleaning up old processes..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:4001 | xargs kill -9 2>/dev/null || true

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

# Wait a moment for servers to start
sleep 3

# Status check
echo ""
echo "📊 Deployment Status:"
echo "===================="

# Check backend
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Running (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend: Failed to start${NC}"
    echo "Check logs: not-a-label-backend/logs/backend.log"
fi

# Check notification server
if ps -p $NOTIFICATION_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Notification Server: Running (PID: $NOTIFICATION_PID)${NC}"
else
    echo -e "${RED}❌ Notification Server: Failed to start${NC}"
    echo "Check logs: not-a-label-backend/logs/notifications.log"
fi

echo ""
echo "🌐 Access Points:"
echo "================"
echo "📱 Enhanced Dashboard: file://$PWD/enhanced-dashboard.html"
echo "🔔 Test Client: file://$PWD/not-a-label-backend/test-client.html"
echo "🚀 Backend API: http://localhost:4000"
echo "📊 Notification Test: http://localhost:4001/test"

# Try to open dashboard in browser
if command_exists open; then
    echo ""
    echo "🌐 Opening dashboard in browser..."
    open "file://$PWD/enhanced-dashboard.html"
    open "file://$PWD/not-a-label-backend/test-client.html"
fi

echo ""
echo -e "${GREEN}✨ Local deployment complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Edit not-a-label-backend/.env with your OAuth credentials"
echo "2. The dashboard should be open in your browser"
echo "3. Test notifications with the test client"
echo "4. For Temporal workflows, install Docker and run ./deploy.sh"

echo ""
echo "🛑 To stop all services, run: ./stop-local.sh"

# Create stop script
cat > stop-local.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Not a Label local services..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop backend server
if [ -f not-a-label-backend/logs/backend-server.pid ]; then
    BACKEND_PID=$(cat not-a-label-backend/logs/backend-server.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
    rm -f not-a-label-backend/logs/backend-server.pid
fi

# Stop notification server
if [ -f not-a-label-backend/logs/notification-server.pid ]; then
    NOTIFICATION_PID=$(cat not-a-label-backend/logs/notification-server.pid)
    if ps -p $NOTIFICATION_PID > /dev/null 2>&1; then
        echo "Stopping notification server (PID: $NOTIFICATION_PID)..."
        kill $NOTIFICATION_PID
        echo -e "${GREEN}✅ Notification server stopped${NC}"
    fi
    rm -f not-a-label-backend/logs/notification-server.pid
fi

echo -e "${GREEN}✅ All services stopped${NC}"
EOF

chmod +x stop-local.sh