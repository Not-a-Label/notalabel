# Not a Label - Platform Handoff & Management Guide

## 🎯 Platform Overview

**Not a Label** is a production-ready platform for independent musicians featuring AI-powered marketing tools, deployed on DigitalOcean with automated monitoring, backups, and SSL management.

### Key Information
- **Domain**: not-a-label.art
- **Server IP**: 159.89.247.208
- **Provider**: DigitalOcean
- **Technology Stack**: Next.js frontend, Express.js backend, SQLite database
- **AI Integration**: OpenAI GPT-3.5 for marketing content generation

## 🔧 Server Access & Management

### SSH Access
```bash
ssh root@159.89.247.208
```

### Key Directories
- **Frontend**: `/var/www/not-a-label-frontend/`
- **Backend**: `/var/www/clean-backend/`
- **API Docs**: `/var/www/api-docs/`
- **Backups**: `/var/backups/not-a-label/`
- **Logs**: `/var/log/`

### Process Management (PM2)
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Individual service restart
pm2 restart frontend
pm2 restart backend-cluster
```

## 🤖 Automated Systems

### 1. Monitoring (Every 5 minutes)
**Script**: `/usr/local/bin/not-a-label-monitor.sh`
**Cron**: `*/5 * * * * /usr/local/bin/not-a-label-monitor.sh`
**Logs**: `/var/log/not-a-label-monitor.log`

**Monitors**:
- Frontend health (HTTP 200)
- API health (/api/health endpoint)
- PM2 process status
- Disk usage (alerts >80%)
- Memory usage (alerts >80%)
- Database file integrity
- Nginx status

### 2. Backups (Daily at 2 AM)
**Script**: `/usr/local/bin/not-a-label-backup.sh`
**Cron**: `0 2 * * * /usr/local/bin/not-a-label-backup.sh`
**Location**: `/var/backups/not-a-label/`
**Retention**: 7 days

**Includes**:
- SQLite database
- Environment files (.env)
- Nginx configurations
- PM2 configurations

### 3. SSL Management (Every 10 minutes)
**Script**: `/usr/local/bin/auto-ssl-install.sh`
**Cron**: `*/10 * * * * /usr/local/bin/auto-ssl-install.sh`
**Logs**: `/var/log/ssl-install.log`

**Actions**:
- Checks DNS propagation
- Installs Let's Encrypt certificate when ready
- Configures auto-renewal
- Updates nginx for HTTPS

## 📊 Key Endpoints & Health Checks

### Health Check Endpoints
```bash
# API Health
curl https://not-a-label.art/api/health

# Frontend Check
curl https://not-a-label.art

# Expected API Response
{"status":"ok","service":"Not a Label Backend","openai":true}
```

### Critical Services
1. **Frontend** (Port 3000) - Next.js application
2. **Backend** (Port 4000) - Express.js API in cluster mode
3. **Nginx** (Port 80/443) - Reverse proxy
4. **Database** - SQLite at `/var/www/clean-backend/data/notalabel.db`

## 🔒 Security Configuration

### Firewall (UFW)
- Port 22: SSH
- Port 80: HTTP
- Port 443: HTTPS
- All other ports blocked

### Fail2ban
- Monitors SSH login attempts
- Automatically bans suspicious IPs
- Logs: `/var/log/fail2ban.log`

### Environment Variables
**Backend** (`.env`):
```
OPENAI_API_KEY=sk-proj-LTHWmXo7qkR98X1opTA2...
JWT_SECRET=notalabel-secret-key
DATABASE_PATH=./data/notalabel.db
```

**Frontend** (`.env.production`):
```
NEXT_PUBLIC_API_URL=/api
```

## 📝 Common Maintenance Tasks

### Update Frontend Code
```bash
cd /var/www/not-a-label-frontend
git pull origin main
npm run build
pm2 restart frontend
```

### Update Backend Code
```bash
cd /var/www/clean-backend
# Edit files as needed
pm2 restart backend-cluster
```

### Manual Backup
```bash
/usr/local/bin/not-a-label-backup.sh
```

### Check Logs
```bash
# Application logs
pm2 logs

# System logs
tail -f /var/log/not-a-label-monitor.log
tail -f /var/log/ssl-install.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Management
```bash
# Backup database
cp /var/www/clean-backend/data/notalabel.db /backup/location/

# Check database size
du -h /var/www/clean-backend/data/notalabel.db

# SQLite interactive shell
sqlite3 /var/www/clean-backend/data/notalabel.db
```

## 🚨 Troubleshooting Guide

### Frontend Issues
```bash
# Check if process is running
pm2 status frontend

# Restart frontend
pm2 restart frontend

# Check frontend logs
pm2 logs frontend

# Rebuild if needed
cd /var/www/not-a-label-frontend
npm run build
```

### Backend Issues
```bash
# Check API health
curl http://localhost:4000/api/health

# Restart backend
pm2 restart backend-cluster

# Check logs
pm2 logs backend-cluster

# Check database connectivity
ls -la /var/www/clean-backend/data/
```

### DNS/SSL Issues
```bash
# Check DNS propagation
dig not-a-label.art +short

# Force SSL installation attempt
/usr/local/bin/auto-ssl-install.sh

# Check SSL certificate
openssl x509 -noout -dates -in /etc/letsencrypt/live/not-a-label.art/cert.pem
```

### Nginx Issues
```bash
# Test configuration
nginx -t

# Restart nginx
systemctl restart nginx

# Check status
systemctl status nginx
```

## 📈 Monitoring & Alerts

### Key Metrics to Watch
- **Uptime**: Should be 99.9%+
- **Response Time**: API <500ms, Frontend <2s
- **Disk Usage**: Keep below 80%
- **Memory Usage**: Monitor backend cluster
- **SSL Certificate**: 30+ days until expiry

### Alert Conditions
- Frontend returns non-200 status
- API /health endpoint fails
- PM2 processes in error state
- Disk usage >80%
- Memory usage >80%
- Database file missing
- SSL certificate expires in <7 days

### Manual Monitoring Commands
```bash
# System resources
htop
df -h
free -h

# Network
netstat -tulpn
ss -tulpn

# Processes
ps aux | grep node
pm2 monit
```

## 🔄 Update Procedures

### Security Updates
```bash
# System updates (monthly)
apt update && apt upgrade -y

# Node.js updates (quarterly)
# Check current version: node --version
# Update via NodeSource if needed

# Dependencies
cd /var/www/not-a-label-frontend && npm audit fix
cd /var/www/clean-backend && npm audit fix
```

### Feature Updates
1. Test changes in development
2. Create backup before deployment
3. Deploy during low-traffic hours
4. Monitor logs after deployment
5. Roll back if issues occur

## 📞 Emergency Procedures

### Platform Down
1. Check PM2 status: `pm2 status`
2. Restart services: `pm2 restart all`
3. Check nginx: `systemctl status nginx`
4. Check logs: `pm2 logs`
5. If database issues, restore from backup

### SSL Certificate Issues
1. Check certificate status
2. Run manual SSL script
3. Check DNS propagation
4. Verify nginx configuration

### High Resource Usage
1. Check processes: `htop`
2. Restart high-usage services
3. Check for memory leaks
4. Scale backend if needed

## 📋 Regular Maintenance Checklist

### Weekly
- [ ] Review monitoring logs
- [ ] Check backup completion
- [ ] Verify SSL certificate status
- [ ] Review application performance

### Monthly
- [ ] System security updates
- [ ] Review and clean old backups
- [ ] Check disk space trends
- [ ] Review user feedback and analytics

### Quarterly
- [ ] Update Node.js and dependencies
- [ ] Review and update documentation
- [ ] Perform disaster recovery test
- [ ] Scale assessment

## 🎯 Success Metrics

- **Uptime**: >99.9%
- **Response Times**: API <500ms, Frontend <2s
- **User Growth**: Track registrations
- **API Usage**: Monitor endpoint calls
- **Marketing Features**: Track content generation usage

## 📚 Additional Resources

- **DigitalOcean Dashboard**: Manage droplet and DNS
- **Domain Registrar**: Manage not-a-label.art domain
- **OpenAI Dashboard**: Monitor API usage and billing
- **GitHub**: Source code repositories
- **Let's Encrypt**: SSL certificate management

---

**Platform Status**: Production Ready ✅
**Last Updated**: May 27, 2025
**Next Review**: June 27, 2025