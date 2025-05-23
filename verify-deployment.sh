#!/bin/bash

# Not-a-Label Deployment Verification Script
# Run this after deployment to ensure everything is working correctly

echo "🚀 Not-a-Label Deployment Verification"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Function to perform check
check() {
    local test_name=$1
    local command=$2
    local expected=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking $test_name... "
    
    result=$(eval "$command" 2>&1)
    
    if [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo -e "  Expected: $expected"
        echo -e "  Got: $result"
        return 1
    fi
}

# Function to check HTTP status
check_http() {
    local test_name=$1
    local url=$2
    local expected_status=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking $test_name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [[ "$status" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $status)"
        return 1
    fi
}

# 1. Environment Checks
echo -e "${BLUE}1. Environment Checks${NC}"
echo "---------------------"
check "Docker installed" "docker --version" "Docker version"
check "Docker Compose installed" "docker-compose --version" "docker-compose version"
check "Git repository" "git remote get-url origin" "github.com/Not-a-Label/notalabel"
echo ""

# 2. Container Checks
echo -e "${BLUE}2. Container Checks${NC}"
echo "-------------------"
if [[ -f docker-compose.production.yml ]]; then
    check "Nginx container" "docker ps" "nginx"
    check "Backend container" "docker ps" "backend"
    check "Temporal container" "docker ps" "temporal"
    check "PostgreSQL container" "docker ps" "postgres"
    check "Redis container" "docker ps" "redis"
else
    check "Backend container" "docker ps" "not-a-label-backend"
fi
echo ""

# 3. Service Health Checks
echo -e "${BLUE}3. Service Health Checks${NC}"
echo "------------------------"
if [[ -f docker-compose.production.yml ]]; then
    # Production checks
    check_http "Main website" "https://www.not-a-label.art" "200"
    check_http "API health endpoint" "https://api.not-a-label.art/health" "200"
    check_http "WebSocket endpoint" "https://ws.not-a-label.art" "200"
else
    # Development checks
    check_http "Backend API" "http://localhost:3001/health" "200"
    check_http "WebSocket server" "http://localhost:4001" "200"
fi
echo ""

# 4. Database Checks
echo -e "${BLUE}4. Database Checks${NC}"
echo "------------------"
if [[ -f docker-compose.production.yml ]]; then
    check "Database accessible" "docker-compose -f docker-compose.production.yml exec -T backend sqlite3 /app/data/notalabel.db 'SELECT 1;'" "1"
    check "Users table exists" "docker-compose -f docker-compose.production.yml exec -T backend sqlite3 /app/data/notalabel.db '.tables'" "users"
else
    check "Database file exists" "ls not-a-label-backend/data/notalabel.db" "notalabel.db"
fi
echo ""

# 5. SSL Certificate Checks (Production only)
if [[ -f docker-compose.production.yml ]]; then
    echo -e "${BLUE}5. SSL Certificate Checks${NC}"
    echo "-------------------------"
    check "SSL certificate valid" "curl -I https://www.not-a-label.art 2>&1" "SSL certificate verify ok"
    echo ""
fi

# 6. Configuration Checks
echo -e "${BLUE}6. Configuration Checks${NC}"
echo "-----------------------"
check "Environment file exists" "ls .env" ".env"
check "JWT_SECRET configured" "grep -c JWT_SECRET .env" "1"
check "VAPID keys configured" "grep -c VAPID_PUBLIC_KEY .env" "1"
echo ""

# 7. File Permission Checks
echo -e "${BLUE}7. File Permission Checks${NC}"
echo "-------------------------"
check "Data directory writable" "test -w data && echo writable" "writable"
check "Logs directory writable" "test -w logs && echo writable" "writable"
if [[ -f backup.sh ]]; then
    check "Backup script executable" "test -x backup.sh && echo executable" "executable"
fi
echo ""

# 8. Integration Checks
echo -e "${BLUE}8. Integration Checks${NC}"
echo "---------------------"
if [[ -f docker-compose.production.yml ]]; then
    # Test API endpoints
    check "Auth endpoint responsive" "curl -s https://api.not-a-label.art/api/auth/status | grep -o 'authenticated'" "authenticated"
fi
echo ""

# Summary
echo "====================================="
echo -e "${BLUE}Verification Summary${NC}"
echo "====================================="
echo -e "Total checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$((TOTAL_CHECKS - PASSED_CHECKS))${NC}"
echo ""

if [[ $PASSED_CHECKS -eq $TOTAL_CHECKS ]]; then
    echo -e "${GREEN}🎉 All checks passed! Deployment verified successfully.${NC}"
    echo ""
    echo "Your Not-a-Label platform is ready at:"
    if [[ -f docker-compose.production.yml ]]; then
        echo "  🌐 https://www.not-a-label.art"
        echo "  📡 https://api.not-a-label.art"
        echo "  🔌 wss://ws.not-a-label.art"
    else
        echo "  🌐 http://localhost:3001"
        echo "  📡 http://localhost:3001/api"
        echo "  🔌 ws://localhost:4001"
    fi
else
    echo -e "${YELLOW}⚠️  Some checks failed. Please review the errors above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Ensure all containers are running: docker-compose ps"
    echo "  - Check logs: docker-compose logs"
    echo "  - Verify environment variables: cat .env"
    echo "  - Ensure DNS is properly configured for production"
fi
echo ""
echo "For detailed monitoring, open monitoring-dashboard.html in your browser."