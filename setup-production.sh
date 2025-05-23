#!/bin/bash

echo "Not-a-Label Production Setup Script"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Step 2: Generate necessary keys
echo ""
echo -e "${YELLOW}Generating necessary keys...${NC}"

# Generate encryption key
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file from example...${NC}"
    cp .env.example .env
fi

# Generate random encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
echo -e "${GREEN}✓ Generated encryption key${NC}"

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo -e "${GREEN}✓ Generated JWT secret${NC}"

# Step 3: VAPID keys
echo ""
echo -e "${YELLOW}Checking VAPID keys...${NC}"
cd not-a-label-backend
if ! grep -q "VAPID_PUBLIC_KEY" ../.env || [ "$(grep VAPID_PUBLIC_KEY ../.env | cut -d'=' -f2)" = "" ]; then
    echo "Generating VAPID keys..."
    npx web-push generate-vapid-keys > vapid-keys.txt
    VAPID_PUBLIC=$(grep "Public Key:" vapid-keys.txt | cut -d' ' -f3)
    VAPID_PRIVATE=$(grep "Private Key:" vapid-keys.txt | cut -d' ' -f3)
    echo "VAPID_PUBLIC_KEY=$VAPID_PUBLIC" >> ../.env
    echo "VAPID_PRIVATE_KEY=$VAPID_PRIVATE" >> ../.env
    rm vapid-keys.txt
    echo -e "${GREEN}✓ Generated VAPID keys${NC}"
else
    echo -e "${GREEN}✓ VAPID keys already exist${NC}"
fi
cd ..

# Step 4: Create necessary directories
echo ""
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p logs
echo -e "${GREEN}✓ Created data directories${NC}"

# Step 5: Build Docker images
echo ""
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f docker-compose.production.yml build

# Step 6: Display next steps
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Production setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file and add:"
echo "   - OAuth credentials (Twitter, Discord, LinkedIn)"
echo "   - AWS credentials for Secrets Manager"
echo "   - Domain configuration"
echo ""
echo "2. Start the production stack:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "3. Run database migrations:"
echo "   docker-compose -f docker-compose.production.yml exec backend npm run migrate"
echo ""
echo "4. Set up SSL certificates:"
echo "   - Ensure your domain points to this server"
echo "   - Certbot will automatically obtain certificates"
echo ""
echo "5. Configure GitHub Secrets at:"
echo "   https://github.com/Not-a-Label/notalabel/settings/secrets/actions"
echo ""
echo -e "${YELLOW}Important files created:${NC}"
echo "- .env (edit this with your production values)"
echo "- data/ (persistent storage for databases)"
echo "- logs/ (application logs)"