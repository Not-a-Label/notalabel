#!/bin/bash

# Not-a-Label Production Server Setup Script
# This script should be run on your production server

set -e  # Exit on error

echo "================================================"
echo "Not-a-Label Production Server Setup"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root!${NC}"
   echo "Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Install other dependencies
echo -e "${YELLOW}Installing additional dependencies...${NC}"
sudo apt-get install -y git nginx certbot python3-certbot-nginx ufw fail2ban

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"

# Clone repository
if [ ! -d "notalabel" ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone https://github.com/Not-a-Label/notalabel.git
    cd notalabel
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${YELLOW}Repository already exists, pulling latest...${NC}"
    cd notalabel
    git pull
    echo -e "${GREEN}✓ Repository updated${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p data/postgres data/redis logs backups
chmod -R 755 data logs backups
echo -e "${GREEN}✓ Directories created${NC}"

# Setup environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    
    # Generate secrets
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    # Update .env with generated values
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    
    echo -e "${GREEN}✓ Environment file created${NC}"
    echo -e "${YELLOW}IMPORTANT: Edit .env file to add:${NC}"
    echo "  - OAuth credentials (Twitter, Discord, LinkedIn)"
    echo "  - AWS credentials"
    echo "  - VAPID keys"
else
    echo -e "${GREEN}✓ Environment file already exists${NC}"
fi

# Create systemd service
echo -e "${YELLOW}Creating systemd service...${NC}"
sudo tee /etc/systemd/system/notalabel.service > /dev/null <<EOF
[Unit]
Description=Not-a-Label Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
ExecReload=/usr/local/bin/docker-compose -f docker-compose.production.yml restart
StandardOutput=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable notalabel.service
echo -e "${GREEN}✓ Systemd service created${NC}"

# Create backup script
echo -e "${YELLOW}Creating backup script...${NC}"
tee backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f docker-compose.production.yml exec -T backend sqlite3 /app/data/notalabel.db ".backup /app/backups/notalabel_${TIMESTAMP}.db"

# Backup environment file
cp .env "${BACKUP_DIR}/env_${TIMESTAMP}"

# Keep only last 7 days of backups
find "${BACKUP_DIR}" -name "notalabel_*.db" -mtime +7 -delete
find "${BACKUP_DIR}" -name "env_*" -mtime +7 -delete

echo "Backup completed: ${TIMESTAMP}"
EOF
chmod +x backup.sh

# Create cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./backup.sh >> logs/backup.log 2>&1") | crontab -
echo -e "${GREEN}✓ Backup automation configured${NC}"

# Setup log rotation
sudo tee /etc/logrotate.d/notalabel > /dev/null <<EOF
$(pwd)/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $USER $USER
}
EOF
echo -e "${GREEN}✓ Log rotation configured${NC}"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Server setup complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your production values"
echo "2. Generate VAPID keys:"
echo "   cd not-a-label-backend && npx web-push generate-vapid-keys"
echo "3. Start the application:"
echo "   sudo systemctl start notalabel"
echo "4. Check status:"
echo "   sudo systemctl status notalabel"
echo "   docker-compose -f docker-compose.production.yml ps"
echo ""
echo "SSL certificates will be automatically obtained when you start the application."
echo ""
echo -e "${YELLOW}Note: You may need to log out and back in for Docker permissions to take effect.${NC}"