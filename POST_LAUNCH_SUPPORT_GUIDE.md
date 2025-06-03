# 📞 Not a Label - Post-Launch Support Guide

## 🛠️ Day 1-7: Critical Support Period

### Immediate Response Checklist

#### Revenue Issues
**"Payments not showing in founder dashboard"**
```bash
# Check payment processing
curl "https://not-a-label.art/api/payments/business/revenue" | jq
grep "payment_intent.succeeded" /var/log/notalabel/monitor.log

# Verify webhook delivery
grep "webhook" /root/.pm2/logs/backend-out.log | tail -10

# Check database entries
sqlite3 /var/www/not-a-label-backend/data/notalabel.db \
  "SELECT * FROM business_revenue ORDER BY recorded_at DESC LIMIT 5;"
```

**"Stripe webhooks failing"**
```bash
# Check webhook endpoint
curl -I https://not-a-label.art/api/payments/webhook

# Verify webhook secret
grep "STRIPE_WEBHOOK_SECRET" /var/www/not-a-label-backend/.env

# Test webhook signature validation
pm2 logs backend | grep "webhook signature"
```

#### Performance Issues
**"Website loading slowly"**
```bash
# Check server resources
top -n 1
free -h
df -h

# Monitor response times
curl -w "Total time: %{time_total}s\n" -o /dev/null -s https://not-a-label.art

# Check nginx logs
tail -f /var/log/nginx/access.log
```

**"API timeouts"**
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart backend

# Monitor memory usage
pm2 monit
```

### SSL Certificate Issues
**"Certificate warnings in browser"**
```bash
# Check certificate status
certbot certificates

# Test SSL configuration
openssl s_client -connect not-a-label.art:443 -servername not-a-label.art

# Renew if needed
certbot renew --nginx
```

## 📊 Weekly Maintenance Tasks

### Every Monday (Revenue Review)
```bash
# Generate weekly revenue report
curl "https://not-a-label.art/api/payments/business/revenue?period=week" > weekly-report.json

# Check founder withdrawal history
curl "https://not-a-label.art/api/founder/withdrawals?founder_id=jason_ino_founder&limit=10"

# Review system health trends
grep "All systems operational" /var/log/notalabel/monitor.log | wc -l
```

### Every Wednesday (Security Check)
```bash
# Update system packages
apt update && apt list --upgradable

# Check SSL certificate expiry
certbot certificates | grep "VALID"

# Review access logs for anomalies
tail -100 /var/log/nginx/access.log | grep -v "200\|304"
```

### Every Friday (Performance Review)
```bash
# Database optimization
sqlite3 /var/www/not-a-label-backend/data/notalabel.db "VACUUM;"

# Clear old logs
find /var/log -name "*.log" -mtime +30 -delete

# Check disk space trends
df -h | grep -E "/$|/var"
```

## 🚨 Emergency Response Procedures

### Revenue Collection Stopped
**Priority: CRITICAL - Immediate Action Required**

1. **Check Stripe status**
   ```bash
   # Verify Stripe keys
   curl -s "https://not-a-label.art/api/payments/config" | jq
   
   # Test payment creation
   curl -X POST "https://not-a-label.art/api/payments/simulate-payment" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "payment_type": "test"}'
   ```

2. **Check webhook delivery**
   ```bash
   # Check Stripe webhook dashboard
   # Log into https://dashboard.stripe.com → Developers → Webhooks
   # Verify endpoint URL and recent deliveries
   ```

3. **Database integrity check**
   ```bash
   sqlite3 /var/www/not-a-label-backend/data/notalabel.db \
     "SELECT COUNT(*) FROM business_revenue WHERE DATE(recorded_at) = DATE('now');"
   ```

### Website Down
**Priority: HIGH - Response within 15 minutes**

1. **Check services**
   ```bash
   pm2 status
   systemctl status nginx
   ```

2. **Restart if needed**
   ```bash
   pm2 restart all
   systemctl restart nginx
   ```

3. **Check logs**
   ```bash
   pm2 logs --lines 50
   tail -f /var/log/nginx/error.log
   ```

### SSL Certificate Expired
**Priority: HIGH - Response within 30 minutes**

1. **Immediate renewal**
   ```bash
   certbot renew --force-renewal
   systemctl reload nginx
   ```

2. **Verify renewal**
   ```bash
   curl -I https://not-a-label.art
   openssl s_client -connect not-a-label.art:443 | grep "Verify return code"
   ```

## 📈 Growth & Scaling Preparation

### Revenue Milestone Alerts

#### $1,000 Monthly Revenue
```bash
# Upgrade server resources if needed
# Consider database backup automation
# Review founder withdrawal recommendations (now 15% safe)
```

#### $5,000 Monthly Revenue  
```bash
# Implement live Stripe keys if still on test
# Set up automated daily revenue reports
# Consider load balancing setup
# Founder withdrawal: Conservative to Moderate tier (15% safe)
```

#### $10,000 Monthly Revenue
```bash
# Scale to dedicated database server
# Implement Redis caching
# Set up monitoring dashboards (Grafana/DataDog)
# Founder withdrawal: Moderate to Aggressive tier (20% safe)
```

#### $50,000+ Monthly Revenue
```bash
# Enterprise-level infrastructure  
# Multi-server setup with load balancer
# Professional monitoring and alerting
# Founder withdrawal: Optimal tier (25% safe)
```

### Database Scaling
```sql
-- When business_revenue table exceeds 100k records
CREATE INDEX idx_business_revenue_date ON business_revenue(recorded_at);
CREATE INDEX idx_business_revenue_user_type ON business_revenue(transaction_type, recorded_at);

-- Archive old data (keep last 2 years)
DELETE FROM business_revenue WHERE recorded_at < date('now', '-2 years');
```

## 🔐 Security Monitoring

### Daily Security Checks
```bash
# Check for failed login attempts
grep "Failed password" /var/log/auth.log | tail -10

# Monitor unusual API access
tail -100 /var/log/nginx/access.log | grep -E "4[0-9][0-9]|5[0-9][0-9]"

# Check for suspicious payment attempts
grep "payment.*failed" /root/.pm2/logs/backend-out.log
```

### Monthly Security Review
```bash
# Update all packages
apt update && apt upgrade -y

# Review SSL certificate chain
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt /etc/letsencrypt/live/not-a-label.art/fullchain.pem

# Backup critical data
cp /var/www/not-a-label-backend/data/notalabel.db /backup/notalabel-$(date +%Y%m%d).db
```

## 💡 Feature Enhancement Roadmap

### Phase 1 (Month 1-3): Optimization
- [ ] Implement automated daily revenue emails to Jason
- [ ] Add CSV export automation for accounting
- [ ] Create founder mobile dashboard
- [ ] Implement real-time notification system

### Phase 2 (Month 4-6): Advanced Features  
- [ ] Multi-currency support
- [ ] Advanced analytics and forecasting
- [ ] Automated tax reporting
- [ ] Integration with accounting software

### Phase 3 (Month 7-12): Enterprise Features
- [ ] Multi-founder support (if adding partners)
- [ ] Advanced fraud detection
- [ ] AI-powered revenue optimization
- [ ] White-label platform licensing

## 📞 Support Contacts & Escalation

### Level 1: Self-Service (0-4 hours)
- Check this support guide
- Review monitoring dashboards
- Run automated diagnostic scripts

### Level 2: Technical Issues (4-24 hours)
- Contact development team
- Review system logs and performance metrics
- Implement temporary workarounds

### Level 3: Critical Revenue Impact (0-1 hour)
- Immediate Stripe support contact
- Emergency server restart procedures
- Rollback to previous working configuration

### Emergency Contacts
- **Stripe Support**: https://support.stripe.com (for payment issues)
- **DigitalOcean Support**: (for server infrastructure)
- **CloudFlare Support**: (for DNS/CDN issues if implemented)

## 📋 Success Metrics & KPIs

### Daily Metrics
- [ ] Revenue collected (target: increasing trend)
- [ ] System uptime (target: 99.9%+)
- [ ] API response times (target: <2 seconds)
- [ ] Payment success rate (target: 98%+)

### Weekly Metrics
- [ ] Founder withdrawal efficiency
- [ ] Customer support tickets
- [ ] Security incidents (target: 0)
- [ ] Performance optimizations implemented

### Monthly Metrics
- [ ] Revenue growth rate
- [ ] System scaling requirements
- [ ] Feature enhancement progress
- [ ] User satisfaction scores

---

## 🎯 **Support Mission Statement**

**Ensure Jason Ino's Not a Label platform maintains 99.9% uptime while maximizing revenue collection efficiency and providing exceptional user experience for independent musicians.**

The system is designed for reliability, scalability, and sustainable growth. This support guide ensures continuous operation and optimal performance! 🚀💰