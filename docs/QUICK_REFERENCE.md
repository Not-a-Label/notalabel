# Not a Label - Quick Reference

## 🚀 Access Points
- **Live Platform**: http://159.89.247.208
- **Domain**: https://not-a-label.art (when DNS propagates)
- **Status Dashboard**: http://159.89.247.208/status/
- **API Base URL**: https://not-a-label.art/api

## 🔑 Server Access
```bash
ssh root@159.89.247.208
```

## 📂 Key Locations
```bash
/var/www/not-a-label-frontend/    # Frontend application
/var/www/clean-backend/           # Backend API
/var/log/                         # All logs
/root/backups/                    # Backup files
/etc/nginx/sites-available/       # Nginx config
```

## 🛠️ Essential Commands

### Service Management
```bash
pm2 status                  # View all services
pm2 restart all            # Restart everything
pm2 logs                   # View all logs
pm2 logs backend --lines 50 # View specific logs
pm2 monit                  # Real-time monitoring
```

### System Health
```bash
htop                       # CPU/Memory usage
df -h                      # Disk space
free -h                    # Memory details
ss -tulpn                  # Network connections
```

### Quick Fixes
```bash
# Restart crashed service
pm2 restart backend
pm2 restart frontend

# Reload Nginx
nginx -t && systemctl reload nginx

# Clear PM2 logs
pm2 flush

# Manual backup
/root/backup-platform.sh
```

## 🔍 Monitoring Logs
```bash
# DNS/SSL status
tail -f /var/log/dns-ssl-monitor.log

# Platform health
tail -f /var/log/platform-monitor.log

# Performance metrics
tail -f /var/log/performance-monitor.log

# Nginx access
tail -f /var/log/nginx/access.log

# Nginx errors
tail -f /var/log/nginx/error.log
```

## 🌐 API Testing
```bash
# Health check
curl http://localhost:4000/api/health

# Test AI assistant
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Test from outside
curl https://not-a-label.art/api/health
```

## 🔐 Security Commands
```bash
# Update system
apt update && apt upgrade -y

# Check failed logins
grep "Failed password" /var/log/auth.log

# Firewall status
ufw status

# SSL certificate status
certbot certificates
```

## 📊 Database
```bash
# Database location
/var/www/clean-backend/notalabel.db

# Backup database
cp /var/www/clean-backend/notalabel.db /root/backups/db-$(date +%Y%m%d).db
```

## 🆘 Emergency Procedures

### Service Down
1. Check status: `pm2 status`
2. View logs: `pm2 logs [service-name]`
3. Restart: `pm2 restart [service-name]`
4. If persists: `pm2 delete [service-name] && pm2 start [command]`

### High CPU/Memory
1. Check top processes: `htop`
2. Restart services: `pm2 restart all`
3. Clear logs: `pm2 flush`
4. Check for attacks: `fail2ban-client status`

### Disk Full
1. Check space: `df -h`
2. Find large files: `du -sh /* | sort -h`
3. Clear old logs: `find /var/log -name "*.log" -mtime +30 -delete`
4. Remove old backups: `find /root/backups -mtime +30 -delete`

## 📞 Support Contacts
- **Server**: DigitalOcean Support
- **Domain**: Domain registrar support
- **SSL**: Let's Encrypt community
- **Code**: https://github.com/Not-a-Label/notalabel

## 🔄 Regular Maintenance
- **Daily**: Check status dashboard
- **Weekly**: Review error logs, check disk space
- **Monthly**: Update system packages, test backups
- **Quarterly**: Review security, update dependencies

---
*Keep this reference handy for quick troubleshooting!*