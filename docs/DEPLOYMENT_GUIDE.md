# Not a Label - Deployment Guide

This guide covers deploying Not a Label to a production environment.

## Prerequisites

- Ubuntu 20.04+ server (or similar Linux distribution)
- Domain name with DNS access
- Basic knowledge of Linux command line
- SSH access to your server

## Quick Deploy (Automated)

### 1. Clone the Repository
```bash
git clone https://github.com/Not-a-Label/notalabel.git
cd notalabel
```

### 2. Run Deployment Script
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

The script will:
- Install all dependencies (Node.js, PM2, Nginx)
- Set up the database
- Configure Nginx reverse proxy
- Install SSL certificates
- Start all services

## Manual Deployment

### Step 1: Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PM2
```bash
sudo npm install -g pm2
```

#### Install Nginx
```bash
sudo apt install -y nginx
```

### Step 2: Application Setup

#### Clone Repository
```bash
cd /var/www
git clone https://github.com/Not-a-Label/notalabel.git
cd notalabel
```

#### Install Backend Dependencies
```bash
cd not-a-label-backend
npm install
```

#### Install Frontend Dependencies
```bash
cd ../not-a-label-frontend
npm install
npm run build
```

### Step 3: Environment Configuration

#### Backend Environment
Create `/var/www/notalabel/not-a-label-backend/.env`:
```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_PATH=./data/notalabel.db

# Authentication
JWT_SECRET=your-secure-random-string

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 4: Database Setup

```bash
cd /var/www/notalabel/not-a-label-backend
npm run db:init
```

### Step 5: PM2 Configuration

#### Start Backend
```bash
cd /var/www/notalabel/not-a-label-backend
pm2 start server.js --name backend
```

#### Start Frontend
```bash
cd /var/www/notalabel/not-a-label-frontend
pm2 start npm --name frontend -- start
```

#### Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

### Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/not-a-label.art`:
```nginx
server {
    listen 80;
    server_name not-a-label.art www.not-a-label.art;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/not-a-label.art /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate

Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d not-a-label.art -d www.not-a-label.art
```

### Step 8: Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Post-Deployment

### Monitoring Setup

#### Create Monitoring Script
```bash
cat > /root/monitor-platform.sh << 'EOF'
#!/bin/bash
# Platform monitoring script

echo "[$(date)] Health Check"

# Check services
pm2 status

# Check disk space
df -h

# Check memory
free -h

# Check API health
curl -s http://localhost:4000/api/health
EOF

chmod +x /root/monitor-platform.sh
```

#### Add to Crontab
```bash
crontab -e
# Add: */5 * * * * /root/monitor-platform.sh >> /var/log/platform-monitor.log
```

### Backup Setup

#### Create Backup Script
```bash
cat > /root/backup-platform.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files and database
tar -czf $BACKUP_DIR/not-a-label-$DATE.tar.gz \
    /var/www/notalabel/not-a-label-backend/data \
    /var/www/notalabel/not-a-label-backend/.env \
    /etc/nginx/sites-available/not-a-label.art

# Keep only last 7 days
find $BACKUP_DIR -name "not-a-label-*.tar.gz" -mtime +7 -delete

echo "Backup completed: not-a-label-$DATE.tar.gz"
EOF

chmod +x /root/backup-platform.sh
```

#### Schedule Daily Backups
```bash
crontab -e
# Add: 0 2 * * * /root/backup-platform.sh >> /var/log/backup.log
```

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
PORT=4000
DATABASE_PATH=./data/dev.db
```

### Staging
```bash
NODE_ENV=staging
PORT=4000
DATABASE_PATH=./data/staging.db
```

### Production
```bash
NODE_ENV=production
PORT=4000
DATABASE_PATH=./data/production.db
```

## Troubleshooting Deployment

### Service Won't Start
```bash
# Check PM2 logs
pm2 logs backend --lines 50
pm2 logs frontend --lines 50

# Check system logs
journalctl -xe
```

### Nginx Errors
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

### Permission Issues
```bash
# Fix ownership
chown -R www-data:www-data /var/www/notalabel

# Fix permissions
find /var/www/notalabel -type d -exec chmod 755 {} \;
find /var/www/notalabel -type f -exec chmod 644 {} \;
```

### Database Issues
```bash
# Check database file
ls -la /var/www/notalabel/not-a-label-backend/data/

# Test database connection
cd /var/www/notalabel/not-a-label-backend
node -e "const db = require('./db'); console.log('DB OK');"
```

## Security Best Practices

1. **Use Strong Passwords**
   - Generate secure JWT secret: `openssl rand -base64 32`
   - Use strong database passwords
   - Secure SSH with key-based authentication

2. **Regular Updates**
   ```bash
   # System updates
   apt update && apt upgrade -y
   
   # Node.js package updates
   npm audit fix
   ```

3. **Firewall Rules**
   - Only open necessary ports
   - Use fail2ban for brute force protection
   - Consider using Cloudflare for DDoS protection

4. **SSL/TLS**
   - Always use HTTPS in production
   - Enable HSTS headers
   - Use strong cipher suites

5. **Environment Variables**
   - Never commit .env files
   - Use different keys for each environment
   - Rotate secrets regularly

## Scaling Considerations

### Horizontal Scaling
- Use PM2 cluster mode for multiple CPU cores
- Set up load balancer (HAProxy/Nginx)
- Use Redis for session storage

### Database Scaling
- Migrate from SQLite to PostgreSQL for production
- Set up read replicas for heavy traffic
- Implement caching layer (Redis)

### CDN Integration
- Use Cloudflare or similar CDN
- Cache static assets
- Enable image optimization

## Maintenance

### Regular Tasks
- Monitor disk space
- Review logs for errors
- Update dependencies
- Test backups
- Review security alerts

### Update Procedure
```bash
# Backup first
/root/backup-platform.sh

# Pull latest code
cd /var/www/notalabel
git pull origin main

# Update dependencies
cd not-a-label-backend && npm install
cd ../not-a-label-frontend && npm install && npm run build

# Restart services
pm2 restart all
```

---
*Deployment Guide v1.0 | Last Updated: May 2025*