# Not-a-Label Platform Maintenance Guide

## Daily Maintenance Tasks

### 1. Health Checks (5 minutes)
```bash
# Run health check script
./health-check.sh

# Check service logs for errors
docker-compose -f docker-compose.production.yml logs --tail=100 | grep -i error
```

### 2. Monitor Resources
- CPU usage should be < 80%
- Memory usage should be < 85%
- Disk usage should be < 90%

## Weekly Maintenance Tasks

### 1. Update Dependencies
```bash
# Check for security updates
cd not-a-label-backend
npm audit

# Update Docker images
docker-compose -f docker-compose.production.yml pull
```

### 2. Review Logs
```bash
# Check error patterns
grep -i "error\|fail\|crash" logs/*.log | sort | uniq -c | sort -nr | head -20

# Archive old logs
tar -czf logs/archive/logs_$(date +%Y%m%d).tar.gz logs/*.log.1
```

### 3. Database Optimization
```bash
# Vacuum SQLite database
docker-compose -f docker-compose.production.yml exec backend sqlite3 /app/data/notalabel.db "VACUUM;"

# Analyze database
docker-compose -f docker-compose.production.yml exec backend sqlite3 /app/data/notalabel.db "ANALYZE;"
```

## Monthly Maintenance Tasks

### 1. Security Audit
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Review GitHub security alerts
# Visit: https://github.com/Not-a-Label/notalabel/security

# Rotate secrets (if needed)
# Update in .env and GitHub Secrets
```

### 2. Performance Review
```bash
# Generate performance report
docker stats --no-stream > performance_$(date +%Y%m).txt

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.not-a-label.art/health
```

### 3. Backup Verification
```bash
# Test backup restoration
cp backups/notalabel_latest.db /tmp/test_restore.db
sqlite3 /tmp/test_restore.db "SELECT COUNT(*) FROM users;"
rm /tmp/test_restore.db
```

## Emergency Procedures

### Service Down
```bash
# Quick restart
docker-compose -f docker-compose.production.yml restart

# Full restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

### Database Corruption
```bash
# Restore from backup
docker-compose -f docker-compose.production.yml stop backend
cp backups/notalabel_latest.db data/notalabel.db
docker-compose -f docker-compose.production.yml start backend
```

### High Load
```bash
# Identify heavy processes
docker-compose -f docker-compose.production.yml exec backend top

# Check for stuck jobs
docker-compose -f docker-compose.production.yml exec backend ps aux | grep node

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

### SSL Certificate Issues
```bash
# Renew certificates manually
docker-compose -f docker-compose.production.yml exec nginx certbot renew

# Force renewal
docker-compose -f docker-compose.production.yml exec nginx certbot renew --force-renewal
```

## Monitoring Commands

### Real-time Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend

# Error filtering
docker-compose -f docker-compose.production.yml logs -f | grep -i error
```

### Service Status
```bash
# Container status
docker-compose -f docker-compose.production.yml ps

# Resource usage
docker stats

# Network connections
docker-compose -f docker-compose.production.yml exec backend netstat -tuln
```

### Database Queries
```bash
# User count
docker-compose -f docker-compose.production.yml exec backend sqlite3 /app/data/notalabel.db "SELECT COUNT(*) FROM users;"

# Recent activity
docker-compose -f docker-compose.production.yml exec backend sqlite3 /app/data/notalabel.db "SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;"

# Platform connections
docker-compose -f docker-compose.production.yml exec backend sqlite3 /app/data/notalabel.db "SELECT platform, COUNT(*) FROM platform_connections GROUP BY platform;"
```

## Update Procedures

### Application Update
```bash
# Pull latest code
git pull origin main

# Check for migration files
ls not-a-label-backend/migrations/

# Rebuild and deploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run migrations if needed
docker-compose -f docker-compose.production.yml exec backend npm run migrate
```

### Rollback Procedure
```bash
# Stop services
docker-compose -f docker-compose.production.yml down

# Revert to previous commit
git log --oneline -10  # Find previous stable commit
git checkout <commit-hash>

# Restart services
docker-compose -f docker-compose.production.yml up -d
```

## Performance Optimization

### 1. Database Indexing
```sql
-- Add indexes for common queries
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
```

### 2. Redis Optimization
```bash
# Check memory usage
docker-compose -f docker-compose.production.yml exec redis redis-cli INFO memory

# Set memory limit
docker-compose -f docker-compose.production.yml exec redis redis-cli CONFIG SET maxmemory 512mb
docker-compose -f docker-compose.production.yml exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Nginx Caching
Already configured in nginx.conf for static assets and API responses.

## Backup Procedures

### Manual Backup
```bash
./backup.sh
```

### Restore from Backup
```bash
# List available backups
ls -la backups/

# Restore specific backup
docker-compose -f docker-compose.production.yml stop backend
cp backups/notalabel_20240123_020000.db data/notalabel.db
docker-compose -f docker-compose.production.yml start backend
```

### Off-site Backup (Recommended)
```bash
# Setup rsync to backup server
rsync -avz backups/ backup-server:/backups/notalabel/

# Or use AWS S3
aws s3 sync backups/ s3://your-backup-bucket/notalabel/
```

## Troubleshooting Checklist

1. **Check logs first**: `docker-compose -f docker-compose.production.yml logs --tail=200`
2. **Verify DNS**: `nslookup not-a-label.art`
3. **Test connectivity**: `curl -I https://api.not-a-label.art/health`
4. **Check disk space**: `df -h`
5. **Review memory**: `free -m`
6. **Inspect containers**: `docker-compose -f docker-compose.production.yml ps`
7. **Database integrity**: `docker-compose -f docker-compose.production.yml exec backend sqlite3 /app/data/notalabel.db "PRAGMA integrity_check;"`

## Support Contacts

- GitHub Issues: https://github.com/Not-a-Label/notalabel/issues
- System Status: Check monitoring-dashboard.html
- Logs Location: `./logs/` and Docker logs

---

Remember: Always backup before making changes!