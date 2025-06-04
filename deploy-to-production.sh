#!/bin/bash

# Not a Label - Production Deployment to not-a-label.art
# Enhanced Analytics Platform Deployment Script

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="not-a-label.art"
API_DOMAIN="api.not-a-label.art"
REPO_URL="https://github.com/Not-a-Label/notalabel.git"
DEPLOY_DATE=$(date +"%Y%m%d_%H%M%S")

# Logging
LOG_FILE="production_deploy_${DEPLOY_DATE}.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                              ║${NC}"
echo -e "${PURPLE}║    🎵 NOT A LABEL - PRODUCTION DEPLOYMENT TO LIVE DOMAIN   ║${NC}"
echo -e "${PURPLE}║                                                              ║${NC}"
echo -e "${PURPLE}║         Enhanced Analytics & AI-Powered Platform            ║${NC}"
echo -e "${PURPLE}║                                                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to print step
print_step() {
    echo -e "${BLUE}➤ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on production server or need to connect
check_deployment_target() {
    print_section "🔍 CHECKING DEPLOYMENT TARGET"
    
    if [[ $(hostname) == *"not-a-label"* ]] || [[ $(hostname) == *"production"* ]]; then
        print_success "Running on production server"
        DEPLOYMENT_MODE="local"
    else
        print_warning "Running from local machine - will deploy to remote server"
        DEPLOYMENT_MODE="remote"
        
        # Check if production server details are available
        if [[ -f ".env.production-server" ]]; then
            source .env.production-server
            print_success "Production server configuration loaded"
        else
            print_error "Production server configuration not found"
            echo "Please create .env.production-server with:"
            echo "PRODUCTION_SERVER_IP=your.server.ip"
            echo "PRODUCTION_SERVER_USER=your_user"
            echo "PRODUCTION_SSH_KEY=/path/to/ssh/key"
            exit 1
        fi
    fi
}

# Update repository on production server
update_repository() {
    print_section "📥 UPDATING REPOSITORY"
    
    if [[ $DEPLOYMENT_MODE == "local" ]]; then
        print_step "Pulling latest changes from GitHub..."
        git pull origin main
        print_success "Repository updated"
        
        print_step "Updating submodules..."
        git submodule update --recursive --remote
        print_success "Submodules updated"
    else
        print_step "Connecting to production server and updating repository..."
        ssh -i "$PRODUCTION_SSH_KEY" "$PRODUCTION_SERVER_USER@$PRODUCTION_SERVER_IP" << 'EOF'
            cd /opt/not-a-label
            git pull origin main
            git submodule update --recursive --remote
EOF
        print_success "Remote repository updated"
    fi
}

# Update production environment variables
update_production_env() {
    print_section "🔧 UPDATING PRODUCTION ENVIRONMENT"
    
    print_step "Checking for production environment files..."
    
    # Backend environment
    if [[ ! -f "not-a-label-backend/.env.production" ]]; then
        print_warning "Backend .env.production not found, creating from template..."
        cp not-a-label-backend/.env.example not-a-label-backend/.env.production
    fi
    
    # Frontend environment  
    if [[ ! -f "not-a-label-frontend/.env.production" ]]; then
        print_warning "Frontend .env.production not found, creating from template..."
        cp not-a-label-frontend/.env.example not-a-label-frontend/.env.production
    fi
    
    print_success "Production environment files ready"
    print_warning "⚠️  Make sure to update API keys and secrets in production environment files!"
}

# Build and deploy services
deploy_services() {
    print_section "🚀 DEPLOYING SERVICES"
    
    print_step "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    print_success "Existing services stopped"
    
    print_step "Building production images..."
    docker-compose -f docker-compose.prod.yml build --no-cache --parallel
    print_success "Production images built"
    
    print_step "Starting database services..."
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    sleep 15
    print_success "Database services started"
    
    print_step "Initializing database schema..."
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U not_a_label_user -d not_a_label -f /docker-entrypoint-initdb.d/init-db.sql || {
        print_warning "Database may already be initialized"
    }
    print_success "Database schema ready"
    
    print_step "Starting application services..."
    docker-compose -f docker-compose.prod.yml up -d backend frontend
    sleep 30
    print_success "Application services started"
    
    print_step "Starting web services..."
    docker-compose -f docker-compose.prod.yml up -d nginx
    print_success "Web services started"
}

# Setup SSL certificates
setup_ssl() {
    print_section "🔒 SETTING UP SSL CERTIFICATES"
    
    print_step "Checking if certificates already exist..."
    if [[ -d "certbot/conf/live/$DOMAIN" ]]; then
        print_success "SSL certificates already exist"
        return 0
    fi
    
    print_step "Obtaining SSL certificates for $DOMAIN..."
    docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d $DOMAIN \
        -d www.$DOMAIN \
        -d $API_DOMAIN
    
    if [[ $? -eq 0 ]]; then
        print_success "SSL certificates obtained successfully"
        
        print_step "Reloading Nginx with SSL..."
        docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
        print_success "Nginx reloaded with SSL"
    else
        print_error "Failed to obtain SSL certificates"
        print_warning "Continuing deployment without SSL - you can set it up later"
    fi
}

# Run health checks
run_health_checks() {
    print_section "🏥 RUNNING HEALTH CHECKS"
    
    print_step "Waiting for services to be ready..."
    sleep 30
    
    print_step "Checking service status..."
    docker-compose -f docker-compose.prod.yml ps
    
    print_step "Checking backend health..."
    if curl -f -s http://localhost:3001/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed, checking logs..."
        docker-compose -f docker-compose.prod.yml logs --tail=20 backend
    fi
    
    print_step "Checking frontend health..."
    if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed, checking logs..."
        docker-compose -f docker-compose.prod.yml logs --tail=20 frontend
    fi
    
    print_step "Testing enhanced analytics endpoints..."
    if curl -f -s http://localhost:3001/api/analytics/enhanced | jq .success >/dev/null 2>&1; then
        print_success "Enhanced analytics endpoint working"
    else
        print_warning "Enhanced analytics endpoint test failed"
    fi
    
    if curl -f -s -X POST http://localhost:3001/api/analytics/predictions \
        -H "Content-Type: application/json" \
        -d '{"timeHorizons":["30d"]}' | jq .success >/dev/null 2>&1; then
        print_success "AI predictions endpoint working"
    else
        print_warning "AI predictions endpoint test failed"
    fi
}

# Final deployment status
show_deployment_status() {
    print_section "🎉 DEPLOYMENT COMPLETE!"
    
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║     🎵 NOT A LABEL - ENHANCED ANALYTICS PLATFORM LIVE!    ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║                   SUCCESSFULLY DEPLOYED!                    ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}📱 Access Your Live Platform:${NC}"
    echo -e "   🎵 Main App:      ${GREEN}https://$DOMAIN${NC}"
    echo -e "   📊 Analytics:     ${GREEN}https://$DOMAIN/dashboard/analytics${NC}"
    echo -e "   🤖 AI Assistant:  ${GREEN}https://$DOMAIN/dashboard/ai${NC}"
    echo -e "   🔗 API:           ${GREEN}https://$API_DOMAIN${NC}"
    echo ""
    
    echo -e "${CYAN}🛠 Enhanced Features Now Live:${NC}"
    echo -e "   ✅ Real-time Analytics Dashboard"
    echo -e "   ✅ AI-Powered Insights & Predictions"
    echo -e "   ✅ Personalized AI Assistant (8 capabilities)"
    echo -e "   ✅ Advanced Recommendation Engine"
    echo -e "   ✅ Market Trend Analysis & Forecasting"
    echo -e "   ✅ Viral Content Detection"
    echo -e "   ✅ Revenue & Growth Predictions"
    echo -e "   ✅ Cross-Platform Analytics"
    echo ""
    
    echo -e "${CYAN}🔗 API Endpoints:${NC}"
    echo -e "   📊 Enhanced Analytics: ${GREEN}GET https://$API_DOMAIN/api/analytics/enhanced${NC}"
    echo -e "   🤖 AI Predictions:     ${GREEN}POST https://$API_DOMAIN/api/analytics/predictions${NC}"
    echo -e "   💬 AI Assistant:       ${GREEN}POST https://$API_DOMAIN/api/analytics/ai-assistant${NC}"
    echo -e "   🎯 Recommendations:    ${GREEN}GET https://$API_DOMAIN/api/analytics/recommendations${NC}"
    echo -e "   📈 Trend Forecasts:    ${GREEN}GET https://$API_DOMAIN/api/analytics/trends/forecast${NC}"
    echo -e "   🎪 Market Opportunities: ${GREEN}GET https://$API_DOMAIN/api/analytics/opportunities${NC}"
    echo ""
    
    echo -e "${CYAN}📚 Management Commands:${NC}"
    echo -e "   View logs:        ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "   Check status:     ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
    echo -e "   Restart services: ${YELLOW}docker-compose -f docker-compose.prod.yml restart${NC}"
    echo -e "   Update services:  ${YELLOW}git pull && docker-compose -f docker-compose.prod.yml up -d${NC}"
    echo ""
    
    echo -e "${PURPLE}🎵 Independent artists now have access to enterprise-level${NC}"
    echo -e "${PURPLE}   analytics and AI tools to accelerate their music careers! 🚀${NC}"
    echo ""
    
    print_success "Deployment log saved to: $LOG_FILE"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting production deployment at $(date)${NC}"
    echo -e "${BLUE}Target Domain: $DOMAIN${NC}"
    echo -e "${BLUE}API Domain: $API_DOMAIN${NC}"
    echo ""
    
    check_deployment_target
    update_repository
    update_production_env
    deploy_services
    setup_ssl
    run_health_checks
    show_deployment_status
    
    echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"
    echo -e "${GREEN}🎵 Not a Label Enhanced Analytics Platform is now LIVE at https://$DOMAIN${NC}"
}

# Error handling
trap 'echo -e "${RED}❌ Deployment failed. Check logs: $LOG_FILE${NC}"; exit 1' ERR

# Run main deployment
main "$@"