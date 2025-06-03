# 🌐 DNS & Launch Configuration Guide

## Current Status
- **Production Server**: `159.89.247.208` ✅ Running
- **Domain**: `not-a-label.art` ❌ Points to `147.182.252.146` (wrong IP)
- **Backend**: ✅ Complete Stripe integration working
- **Frontend**: ✅ Ready for production

## Step 1: Update DNS Records

### A. Update Primary Domain
**In your DNS provider (likely Namecheap, GoDaddy, or CloudFlare):**

```
Type: A
Name: @
Value: 159.89.247.208
TTL: 3600 (1 hour)
```

```
Type: A  
Name: www
Value: 159.89.247.208
TTL: 3600 (1 hour)
```

### B. Add SSL-Ready Subdomains (Optional)
```
Type: A
Name: api
Value: 159.89.247.208
TTL: 3600
```

```
Type: A
Name: admin
Value: 159.89.247.208  
TTL: 3600
```

## Step 2: Verify DNS Propagation

**Commands to run (wait 5-10 minutes after DNS update):**
```bash
# Check if DNS has updated
dig not-a-label.art +short
# Should return: 159.89.247.208

# Check www subdomain
dig www.not-a-label.art +short
# Should return: 159.89.247.208

# Test HTTP response
curl -I http://not-a-label.art
# Should get response from nginx
```

## Step 3: Deploy SSL & Nginx Configuration

**Run on production server (159.89.247.208):**
```bash
# Copy and run SSL setup script
scp ssl-nginx-setup.sh root@159.89.247.208:/tmp/
ssh root@159.89.247.208 "bash /tmp/ssl-nginx-setup.sh"
```

## Step 4: Update Frontend Environment

**Update production frontend to use HTTPS:**
```bash
# On production server
cd /var/www/not-a-label-frontend
cp .env.production .env.production.backup

# Update API URL to use HTTPS
echo "NEXT_PUBLIC_API_URL=https://not-a-label.art/api" > .env.production.new
cat .env.production | grep -v NEXT_PUBLIC_API_URL >> .env.production.new
mv .env.production.new .env.production

# Rebuild and restart frontend
npm run build
pm2 restart frontend
```

## Step 5: Configure Live Stripe Keys

### A. Get Live Keys from Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Switch to "Live" mode (toggle in left sidebar)
3. Go to "Developers" → "API keys"
4. Copy:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### B. Update Production Environment
```bash
# On production server
cd /var/www/not-a-label-backend

# Backup current .env
cp .env .env.test.backup

# Update with live keys
sed -i 's/sk_test_/sk_live_/g' .env
sed -i 's/pk_test_/pk_live_/g' .env

# Update webhook endpoint in Stripe dashboard to:
# https://not-a-label.art/api/payments/webhook

# Restart backend with live keys
pm2 restart backend --update-env
```

## Step 6: Final Production Testing

### A. Test Complete Flow
```bash
# 1. Test HTTPS access
curl -I https://not-a-label.art

# 2. Test API endpoints
curl https://not-a-label.art/api/health

# 3. Test founder dashboard access
curl "https://not-a-label.art/api/founder/balance?founder_id=jason_ino_founder"
```

### B. Test Stripe Integration
1. Visit https://not-a-label.art
2. Access founder dashboard
3. Verify revenue data displays correctly
4. Test small live payment ($1) to verify webhook

## Step 7: Launch Checklist

### Pre-Launch Verification ✅
- [ ] DNS pointing to correct server (159.89.247.208)
- [ ] SSL certificate installed and working
- [ ] Frontend accessible via HTTPS
- [ ] Backend API responding via HTTPS
- [ ] Live Stripe keys configured
- [ ] Webhook endpoint updated in Stripe
- [ ] Monitoring systems active
- [ ] Database backups configured

### Launch Day Tasks
- [ ] Monitor error logs: `pm2 logs`
- [ ] Watch monitoring alerts
- [ ] Test first real transaction
- [ ] Verify founder dashboard shows live data
- [ ] Send launch announcement

## Step 8: Post-Launch Monitoring

### Real-Time Monitoring
```bash
# Monitor all services
pm2 status

# Watch logs
pm2 logs --lines 20

# Check system health
tail -f /var/log/notalabel/monitor.log

# Monitor revenue
tail -f /var/log/notalabel/revenue.log
```

### Success Metrics
- [ ] First live payment processed successfully
- [ ] Revenue appears in founder dashboard
- [ ] No SSL certificate warnings
- [ ] Page load times under 3 seconds
- [ ] No 500 errors in logs

## Emergency Contacts & Rollback

**If issues occur:**
1. **Revert DNS**: Point back to old server temporarily
2. **Switch to test keys**: Revert to Stripe test mode
3. **Check logs**: `pm2 logs backend --lines 50`

**Jason's Access:**
- **Founder Dashboard**: https://not-a-label.art/dashboard?founder_id=jason_ino_founder
- **Direct API**: https://not-a-label.art/api/founder/balance?founder_id=jason_ino_founder
- **Server SSH**: `ssh root@159.89.247.208`

---

🚀 **Ready to launch Not a Label with complete Stripe revenue collection!**

Next: Execute the DNS update and wait for propagation before proceeding with SSL setup.