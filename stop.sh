#!/bin/bash

# Not a Label Stop Script
# This script stops all running services

echo "🛑 Stopping Not a Label services..."

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
    else
        echo -e "${YELLOW}⚠️  Backend server not running${NC}"
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
    else
        echo -e "${YELLOW}⚠️  Notification server not running${NC}"
    fi
    rm -f not-a-label-backend/logs/notification-server.pid
fi

# Stop frontend server
if [ -f not-a-label-backend/logs/frontend-server.pid ]; then
    FRONTEND_PID=$(cat not-a-label-backend/logs/frontend-server.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend server stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend server not running${NC}"
    fi
    rm -f not-a-label-backend/logs/frontend-server.pid
fi

# Stop Docker services
echo "Stopping Docker services..."
cd not-a-label-backend
docker-compose -f docker-compose.temporal.yml down
cd ..

echo -e "${GREEN}✅ All services stopped${NC}"