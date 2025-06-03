# Not a Label Deployment Guide

## Overview

This guide documents the complete deployment and configuration of the Not a Label platform on DigitalOcean.

## Server Details

- **Server IP**: 159.89.247.208
- **Domain**: not-a-label.art
- **OS**: Ubuntu 22.04 LTS
- **Architecture**: Multi-app deployment with Nginx reverse proxy

## Deployed Applications

### 1. Backend API
- **Port**: 4000
- **Technology**: Node.js/Express with TypeScript
- **Database**: SQLite (production-ready)
- **Process Manager**: PM2
- **Health Check**: http://159.89.247.208/api/health

### 2. Frontend Application
- **Port**: 3000
- **Technology**: Next.js 15 with React 19
- **Features**: PWA support, server-side rendering
- **Process Manager**: PM2
- **URL**: http://159.89.247.208

### 3. Admin Dashboard
- **URL**: http://159.89.247.208/admin
- **Features**: System monitoring, user management, analytics

## Security Configuration

### Firewall (UFW)
```bash
# Check status
ufw status

# Allowed ports
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 25, 587, 993, 995 (Email)
```

### Fail2ban
- Monitors SSH and Nginx logs
- Automatically bans malicious IPs
- Check banned IPs: `fail2ban-client status`

### SSH Hardening
- Password authentication disabled
- Key-only authentication required
- Max auth tries: 3

## Monitoring & Health Checks

### PM2 Process Management
```bash
# View process status
pm2 status

# View logs
pm2 logs nal-backend
pm2 logs nal-frontend

# Monitor in real-time
pm2 monit
```

### Custom Monitoring Commands
```bash
# System performance overview
performance-check.sh

# Application health status
nal-monitor

# Backup status
backup-status.sh

# Security audit
security-audit.sh
```

### Automated Health Checks
- Runs every 5 minutes via cron
- Checks backend and frontend availability
- Logs to `/var/log/nal-health-check.log`

## Database Backups

### Backup Schedule
- **Daily**: 2:30 AM (kept for 7 days)
- **Weekly**: Sundays (kept for 4 weeks)
- **Monthly**: 1st of month (kept for 12 months)

### Backup Commands
```bash
# Manual backup
/var/www/not-a-label/scripts/backup-database.sh

# Check backup status
backup-status.sh

# Restore from backup
/var/www/not-a-label/scripts/restore-database.sh <backup-file.db.gz>
```

### Backup Location
`/var/backups/not-a-label/`

## Email Configuration

### Status
Email server configuration is prepared but waiting for:
1. DNS propagation (currently pointing to old IP)
2. SSL certificates

### Setup (After DNS Propagates)
```bash
ssh root@159.89.247.208
cd /root/email-setup
./install-email-server.sh
```

### Email Integration
- Code ready at `/var/www/not-a-label/scripts/email-integration.js`
- Supports both local SMTP and external providers
- Templates for welcome emails and password resets

## Performance Optimizations

### Applied Optimizations
1. **Node.js**: Memory limits configured
2. **PM2**: Auto-restart and monitoring enhanced
3. **Nginx**: Worker processes and caching optimized
4. **System**: Kernel parameters tuned for high performance
5. **Network**: Rate limiting configured
6. **Compression**: Gzip enabled for all text content

### Performance Monitoring
```bash
# Quick overview
performance-check.sh

# Detailed system monitoring
htop

# Disk I/O monitoring
iotop

# Network usage by process
nethogs
```

## SSL/HTTPS Setup

### Prerequisites
- Domain must point to server IP (159.89.247.208)
- Check DNS: `nslookup not-a-label.art`

### Installation (After DNS Propagates)
```bash
certbot --nginx -d not-a-label.art -d www.not-a-label.art -d api.not-a-label.art -d mail.not-a-label.art
```

## Maintenance Tasks

### Regular Updates
```bash
# System updates (automated via unattended-upgrades)
apt update && apt upgrade

# Node.js dependencies
cd /var/www/not-a-label/backend && npm update
cd /var/www/not-a-label/frontend-simple && npm update
```

### Log Management
- Logs rotate automatically via logrotate
- PM2 logs managed by pm2-logrotate module
- System logs cleaned weekly

### Disk Space Management
```bash
# Check disk usage
df -h

# Clean Docker images (if using Docker)
docker system prune -af

# Clean old logs
journalctl --vacuum-time=7d
```

## Troubleshooting

### Application Issues
```bash
# Check PM2 processes
pm2 status
pm2 logs <app-name>

# Restart application
pm2 restart nal-backend
pm2 restart nal-frontend

# Check port usage
ss -tulpn | grep LISTEN
```

### Database Issues
```bash
# Check database integrity
sqlite3 /var/www/not-a-label/backend/data/notalabel.db "PRAGMA integrity_check;"

# Restore from backup if needed
/var/www/not-a-label/scripts/restore-database.sh <backup-file>
```

### Nginx Issues
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Reload configuration
systemctl reload nginx
```

## Important File Locations

### Application Code
- Backend: `/var/www/not-a-label/backend/`
- Frontend: `/var/www/not-a-label/frontend-simple/`
- Scripts: `/var/www/not-a-label/scripts/`

### Configuration Files
- PM2: `/var/www/not-a-label/ecosystem.config.js`
- Nginx: `/etc/nginx/sites-available/not-a-label`
- Environment: `/var/www/not-a-label/backend/.env`

### Logs
- Application: `/var/www/not-a-label/logs/`
- Nginx: `/var/log/nginx/`
- System: `/var/log/syslog`
- Health checks: `/var/log/nal-health-check.log`
- Backups: `/var/log/nal-backup.log`

### Backups
- Database: `/var/backups/not-a-label/`
- Config backups: `/root/config-backups/`

## Security Notes

1. **Never commit secrets** to Git repositories
2. **Regularly update** all dependencies
3. **Monitor logs** for suspicious activity
4. **Test backups** regularly
5. **Keep SSL certificates** up to date

## Support Commands Reference

```bash
# Quick health check
curl http://159.89.247.208/api/health

# View all running services
systemctl list-units --state=running

# Check memory usage
free -h

# Monitor real-time connections
ss -s

# View firewall logs
grep "UFW BLOCK" /var/log/syslog | tail -20

# Check fail2ban bans
fail2ban-client status sshd
```

## Next Steps

1. **Wait for DNS propagation** to complete
2. **Install SSL certificates** once DNS is ready
3. **Complete email server setup** after SSL
4. **Deploy full frontend** with all features
5. **Configure monitoring alerts** (Discord/Slack webhooks)
6. **Set up automated deployments** (CI/CD)

---

Generated: $(date)
Server Administrator: root@159.89.247.208