#!/bin/bash

# Not-a-Label Health Check Script

echo "🏥 Not-a-Label Health Check"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓${NC} $name: ${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} $name: ${RED}FAILED${NC}"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local container=$1
    local name=$2
    
    if docker ps | grep -q "$container"; then
        echo -e "${GREEN}✓${NC} $name container: ${GREEN}Running${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} $name container: ${RED}Not running${NC}"
        return 1
    fi
}

# Check if running locally or in production
if [[ -f /.dockerenv ]]; then
    echo "Running inside Docker container"
    DOMAIN="not-a-label.art"
else
    echo "Checking local/production environment..."
    if [[ $(hostname) == *"not-a-label"* ]] || [[ -f docker-compose.production.yml ]]; then
        DOMAIN="not-a-label.art"
    else
        DOMAIN="localhost"
    fi
fi

echo "Domain: $DOMAIN"
echo ""

# Check Docker services
echo "🐳 Docker Services:"
if [[ $DOMAIN == "localhost" ]]; then
    check_container "not-a-label-backend" "Backend"
else
    check_container "notalabel-nginx-1" "Nginx"
    check_container "notalabel-backend-1" "Backend"
    check_container "notalabel-temporal-1" "Temporal"
    check_container "notalabel-postgres-1" "PostgreSQL"
    check_container "notalabel-redis-1" "Redis"
fi
echo ""

# Check URLs
echo "🌐 Web Services:"
if [[ $DOMAIN == "localhost" ]]; then
    check_url "http://localhost:3001/health" "Backend API"
    check_url "http://localhost:4001" "WebSocket Server"
else
    check_url "https://www.not-a-label.art" "Main Site"
    check_url "https://api.not-a-label.art/health" "API Health"
    check_url "https://ws.not-a-label.art" "WebSocket"
fi
echo ""

# Check disk space
echo "💾 Disk Space:"
df -h | grep -E "/$|/var|/home" | awk '{print $6 " - " $5 " used (" $4 " free)"}'
echo ""

# Check memory
echo "🧠 Memory Usage:"
free -h | grep Mem | awk '{print "Total: " $2 ", Used: " $3 ", Free: " $4}'
echo ""

# Check recent logs for errors
echo "📋 Recent Errors (last 10 minutes):"
if [[ $DOMAIN == "localhost" ]]; then
    if [[ -f logs/error.log ]]; then
        errors=$(grep -i error logs/error.log 2>/dev/null | tail -5)
        if [[ -z "$errors" ]]; then
            echo -e "${GREEN}No recent errors${NC}"
        else
            echo -e "${YELLOW}$errors${NC}"
        fi
    else
        echo "No error log file found"
    fi
else
    errors=$(docker-compose -f docker-compose.production.yml logs --tail=100 --since=10m 2>&1 | grep -i error | tail -5)
    if [[ -z "$errors" ]]; then
        echo -e "${GREEN}No recent errors${NC}"
    else
        echo -e "${YELLOW}$errors${NC}"
    fi
fi
echo ""

# Summary
echo "=========================="
echo "🎯 Summary:"
if [[ $DOMAIN == "not-a-label.art" ]]; then
    echo "Production environment health check complete"
else
    echo "Development environment health check complete"
fi
echo "Run 'docker-compose logs -f' to see live logs"
echo "Run './backup.sh' to create a manual backup"