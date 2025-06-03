# Not a Label - Production Deployment Guide

This guide provides comprehensive instructions for deploying Not a Label to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [DNS Configuration](#dns-configuration)
4. [SSL Certificates](#ssl-certificates)
5. [Database Setup](#database-setup)
6. [Email Server Setup](#email-server-setup)
7. [Application Deployment](#application-deployment)
8. [Post-Deployment](#post-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or newer
- Minimum 4GB RAM (8GB recommended)
- 50GB+ storage
- Open ports: 22, 80, 443, 25, 587, 993, 995

### Software Requirements
- Node.js 18.x or newer
- MongoDB 6.0+
- Nginx
- PM2 (process manager)
- Git
- Docker (optional, for containerized deployment)

### Domain & DNS
- Domain registered and pointing to DigitalOcean nameservers
- Access to DNS management panel

## Environment Setup

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y build-essential git curl wget nginx certbot python3-certbot-nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Create Application User

```bash
# Create user for running the application
sudo adduser --system --group notlabel
sudo mkdir -p /var/www/not-a-label
sudo chown notlabel:notlabel /var/www/not-a-label
```

### 3. Clone Repositories

```bash
sudo su - notlabel
cd /var/www/not-a-label

# Clone backend
git clone https://github.com/yourusername/not-a-label-backend.git backend
cd backend
npm install --production

# Clone frontend
cd /var/www/not-a-label
git clone https://github.com/yourusername/not-a-label-frontend.git frontend
cd frontend
npm install
npm run build
```

## DNS Configuration

### Required DNS Records

Add these records in your DNS management panel:

```
# A Records
@        A      159.89.247.208
www      A      159.89.247.208
api      A      159.89.247.208
mail     A      159.89.247.208
webmail  A      159.89.247.208

# MX Record
@        MX     10  mail.not-a-label.art

# TXT Records
@        TXT    "v=spf1 a mx ip4:159.89.247.208 -all"
_dmarc   TXT    "v=DMARC1; p=quarantine; rua=mailto:admin@not-a-label.art"

# CNAME Records
autodiscover  CNAME  mail.not-a-label.art
autoconfig    CNAME  mail.not-a-label.art
```

### Verify DNS Propagation

```bash
# Check A record
dig not-a-label.art +short

# Check MX record
dig MX not-a-label.art +short

# Check TXT records
dig TXT not-a-label.art +short
```

## SSL Certificates

### 1. Generate Certificates

```bash
# For main domain
sudo certbot certonly --nginx -d not-a-label.art -d www.not-a-label.art

# For API
sudo certbot certonly --nginx -d api.not-a-label.art

# For mail server
sudo certbot certonly --nginx -d mail.not-a-label.art

# For webmail
sudo certbot certonly --nginx -d webmail.not-a-label.art
```

### 2. Auto-renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /usr/bin/certbot renew --quiet
```

## Database Setup

### 1. Secure MongoDB

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "SECURE_PASSWORD_HERE",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Create application database and user
use notlabel
db.createUser({
  user: "notlabel",
  pwd: "SECURE_PASSWORD_HERE",
  roles: [ { role: "readWrite", db: "notlabel" } ]
})
```

### 2. Enable Authentication

Edit `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

### 3. Run Migrations

```bash
cd /var/www/not-a-label/backend
npx migrate-mongo up
```

## Email Server Setup

### 1. Run Email Setup Script

```bash
cd /var/www/not-a-label/backend/scripts
sudo bash setup-email-server.sh
```

### 2. Configure DNS for Email

After setup, add the DKIM record provided by the script to your DNS.

### 3. Test Email Configuration

```bash
# Test mail server
sudo bash email-management.sh
# Select option 8 to send test email
```

## Application Deployment

### 1. Backend Configuration

Create `/var/www/not-a-label/backend/.env`:

```env
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb://notlabel:PASSWORD@localhost:27017/notlabel
MONGODB_DB=notlabel

# Security
JWT_SECRET=<generate-secure-64-char-string>
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://not-a-label.art

# Email
EMAIL_DOMAIN=not-a-label.art
SYSTEM_EMAIL=system@not-a-label.art
SYSTEM_EMAIL_PASS=<email-password>

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
ALERT_EMAIL=admin@not-a-label.art

# ... (add all required environment variables)
```

### 2. Frontend Configuration

Create `/var/www/not-a-label/frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.not-a-label.art
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.not-a-label.art
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/not-a-label`:

```nginx
# Frontend
server {
    listen 80;
    server_name not-a-label.art www.not-a-label.art;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name not-a-label.art www.not-a-label.art;

    ssl_certificate /etc/letsencrypt/live/not-a-label.art/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/not-a-label.art/privkey.pem;

    root /var/www/not-a-label/frontend/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Backend
server {
    listen 80;
    server_name api.not-a-label.art;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.not-a-label.art;

    ssl_certificate /etc/letsencrypt/live/api.not-a-label.art/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.not-a-label.art/privkey.pem;

    location / {
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
sudo ln -s /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Start Application with PM2

```bash
# Backend
cd /var/www/not-a-label/backend
pm2 start dist/index.js --name not-a-label-backend --env production

# Save PM2 configuration
pm2 save
pm2 startup systemd -u notlabel --hp /home/notlabel
```

## Post-Deployment

### 1. Run Deployment Checklist

```bash
cd /var/www/not-a-label/backend/scripts
bash deploy-checklist.sh
```

### 2. Configure Backups

```bash
# Edit crontab
crontab -e

# Add backup schedules
0 2 * * 0 /var/www/not-a-label/backend/scripts/backup-full.sh
0 2 * * 1-6 /var/www/not-a-label/backend/scripts/backup-incremental.sh
```

### 3. Set Up Monitoring

1. Access health dashboard: https://not-a-label.art/admin/health
2. Configure uptime monitoring (e.g., UptimeRobot)
3. Set up log aggregation (optional)

### 4. Security Hardening

```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 25/tcp
sudo ufw allow 587/tcp
sudo ufw allow 993/tcp
sudo ufw allow 995/tcp
sudo ufw enable

# Install and configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Monitoring & Maintenance

### Daily Tasks
- Check health dashboard
- Review error logs
- Monitor disk space

### Weekly Tasks
- Review analytics
- Check backup integrity
- Update dependencies (test first)

### Monthly Tasks
- Security updates
- Performance optimization
- Database maintenance

### Useful Commands

```bash
# View application logs
pm2 logs not-a-label-backend

# Monitor resources
pm2 monit

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check mail logs
sudo tail -f /var/log/mail.log

# Database backup
mongodump --uri="mongodb://user:pass@localhost:27017/notlabel" --out=/backup/mongodb/

# Application update
cd /var/www/not-a-label/backend
git pull
npm install --production
npm run build
pm2 restart not-a-label-backend
```

## Troubleshooting

### Common Issues

#### 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs not-a-label-backend`
- Verify nginx configuration: `sudo nginx -t`

#### SSL Certificate Issues
- Renew certificates: `sudo certbot renew`
- Check certificate status: `sudo certbot certificates`

#### Database Connection Issues
- Check MongoDB status: `sudo systemctl status mongod`
- Verify connection string in .env
- Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

#### Email Delivery Issues
- Check mail server status: `sudo systemctl status postfix`
- Review mail logs: `sudo tail -f /var/log/mail.log`
- Verify DNS records
- Test with mail-tester.com

### Emergency Procedures

#### Rollback Deployment
```bash
cd /var/www/not-a-label/backend
git checkout <previous-commit>
npm install --production
npm run build
pm2 restart not-a-label-backend
```

#### Database Recovery
```bash
# Restore from backup
mongorestore --uri="mongodb://user:pass@localhost:27017/notlabel" /backup/mongodb/latest/
```

#### Emergency Maintenance Mode
```bash
# Create maintenance page
echo "Under maintenance. Be right back!" > /var/www/maintenance.html

# Update nginx to show maintenance page
# Add to server block: 
# location / { return 503; }
# error_page 503 /maintenance.html;
# location = /maintenance.html { root /var/www; }
```

## Support

For deployment support:
- Email: admin@not-a-label.art
- Documentation: https://docs.not-a-label.art
- GitHub Issues: https://github.com/yourusername/not-a-label-backend/issues

---

Last updated: [Current Date]
Version: 1.0.0