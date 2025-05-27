# Not a Label - Administrator Guide

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Server Access](#server-access)
3. [Service Management](#service-management)
4. [Monitoring & Logs](#monitoring--logs)
5. [Troubleshooting](#troubleshooting)
6. [Backup & Recovery](#backup--recovery)
7. [Security](#security)
8. [API Configuration](#api-configuration)

## Platform Overview

### Architecture
- **Frontend**: Next.js application (Port 3000)
- **Backend**: Express.js API (Port 4000)
- **Database**: SQLite (expandable to PostgreSQL)
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt (auto-renewed)

### Server Details
- **IP Address**: 159.89.247.208
- **Domain**: not-a-label.art
- **Provider**: DigitalOcean
- **Location**: NYC3
- **Specs**: 2 vCPU, 4GB RAM, 80GB SSD

## Server Access

### SSH Access
```bash
ssh root@159.89.247.208
```

### File Locations
- Frontend: `/var/www/not-a-label-frontend/`
- Backend: `/var/www/clean-backend/`
- Nginx Config: `/etc/nginx/sites-available/not-a-label.art`
- Logs: `/var/log/`

## Service Management

### PM2 Process Management

#### View Running Services
```bash
pm2 status
pm2 list
```

#### Restart Services
```bash
# Restart all services
pm2 restart all

# Restart specific service
pm2 restart frontend
pm2 restart backend
```

#### View Logs
```bash
# All logs
pm2 logs

# Specific service logs
pm2 logs frontend
pm2 logs backend

# Clear logs
pm2 flush
```

#### Save PM2 Configuration
```bash
pm2 save
pm2 startup  # Ensures services start on reboot
```

### Nginx Management

#### Test Configuration
```bash
nginx -t
```

#### Reload Nginx
```bash
systemctl reload nginx
```

#### View Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Monitoring & Logs

### Platform Monitoring

#### Status Dashboard
- URL: http://not-a-label.art/status/
- Shows real-time service health
- AI assistant testing interface
- System metrics

#### Automated Monitoring Scripts
1. **DNS/SSL Monitor** (runs every 2 minutes)
   ```bash
   tail -f /var/log/dns-ssl-monitor.log
   ```

2. **Platform Health Monitor** (runs every 5 minutes)
   ```bash
   tail -f /var/log/platform-monitor.log
   ```

3. **Performance Monitor** (runs every 10 minutes)
   ```bash
   tail -f /var/log/performance-monitor.log
   ```

### Manual Health Checks
```bash
# Check API health
curl http://localhost:4000/api/health

# Check frontend
curl -I http://localhost:3000

# Check system resources
htop
df -h
free -h
```

## Troubleshooting

### Common Issues

#### Frontend Not Loading
```bash
# Check frontend status
pm2 status frontend

# Restart frontend
pm2 restart frontend

# Check logs
pm2 logs frontend --lines 50
```

#### Backend API Errors
```bash
# Check backend status
pm2 status backend

# View error logs
pm2 logs backend --err --lines 50

# Test API directly
curl http://localhost:4000/api/health
```

#### High Memory/CPU Usage
```bash
# View resource usage
pm2 monit

# Restart services to free memory
pm2 restart all

# Check for memory leaks
pm2 describe backend
pm2 describe frontend
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Manually renew certificate
certbot renew --nginx

# Test auto-renewal
certbot renew --dry-run
```

## Backup & Recovery

### Automated Backups
Daily backups run automatically at 2 AM:
```bash
# View backup script
cat /root/backup-platform.sh

# Run manual backup
/root/backup-platform.sh

# List backups
ls -la /root/backups/
```

### Restore from Backup
```bash
# Extract backup
cd /
tar -xzf /root/backups/not-a-label-backup-YYYYMMDD_HHMMSS.tar.gz

# Restart services
pm2 restart all
systemctl reload nginx
```

### Database Backup
```bash
# SQLite database location
/var/www/clean-backend/notalabel.db

# Create database backup
cp /var/www/clean-backend/notalabel.db /root/backups/notalabel-$(date +%Y%m%d).db
```

## Security

### Firewall Rules
```bash
# View current rules
ufw status

# Essential ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
```

### Security Updates
```bash
# Update system packages
apt update && apt upgrade -y

# Auto-remove unnecessary packages
apt autoremove -y
```

### SSL/TLS Configuration
- Certificates auto-renew via Let's Encrypt
- Strong cipher suite configured in Nginx
- HSTS headers enabled

## API Configuration

### Environment Variables
Backend configuration file: `/var/www/clean-backend/.env`

```bash
# View current configuration
cat /var/www/clean-backend/.env

# Edit configuration
nano /var/www/clean-backend/.env

# After changes, restart backend
pm2 restart backend
```

### Key Configuration Options
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `JWT_SECRET`: Secret key for authentication
- `PORT`: Backend API port (default: 4000)
- `NODE_ENV`: Environment (production/development)

### Testing API Endpoints

```bash
# Test authentication
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test AI assistant
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How can I promote my music?"}'
```

## Maintenance Tasks

### Weekly Tasks
1. Check disk usage: `df -h`
2. Review logs for errors: `pm2 logs --err`
3. Update system packages: `apt update && apt upgrade`
4. Verify backups: `ls -la /root/backups/`

### Monthly Tasks
1. Review security logs: `grep "Failed password" /var/log/auth.log`
2. Test SSL renewal: `certbot renew --dry-run`
3. Clean old logs: `pm2 flush`
4. Remove old backups: `find /root/backups -mtime +30 -delete`

## Support & Resources

### Quick Commands Reference
```bash
# Service management
pm2 status              # View all services
pm2 restart all         # Restart everything
pm2 logs               # View all logs
pm2 monit              # Real-time monitoring

# System health
htop                   # System resources
df -h                  # Disk usage
free -h                # Memory usage
ss -tulpn              # Network connections

# Logs
tail -f /var/log/nginx/access.log     # Web traffic
tail -f /var/log/dns-ssl-monitor.log  # DNS/SSL status
journalctl -u nginx -f                # Nginx service logs
```

### Emergency Contacts
- Server Provider: DigitalOcean Support
- Domain Registrar: Check domain provider
- SSL Issues: Let's Encrypt Community

---
*Last Updated: May 27, 2025*