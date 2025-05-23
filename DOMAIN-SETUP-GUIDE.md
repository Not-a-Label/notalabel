# 🌐 Not a Label - Domain Setup Guide for not-a-label.art

This guide will help you deploy your Not a Label platform to your domain `https://www.not-a-label.art`.

## 📋 Prerequisites

1. **Domain DNS Configuration**
   - Access to your domain registrar's DNS settings
   - Ability to create A and CNAME records

2. **Server Requirements**
   - Linux server (Ubuntu 20.04+ recommended)
   - Docker and Docker Compose installed
   - At least 2GB RAM, 20GB storage
   - Ports 80, 443 open for web traffic
   - Port 7233 for Temporal (optional, can be internal only)

## 🔧 DNS Configuration

Add these DNS records at your domain registrar:

```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      300
A       www     YOUR_SERVER_IP      300
A       api     YOUR_SERVER_IP      300
A       ws      YOUR_SERVER_IP      300
```

## 🚀 Deployment Steps

### 1. Connect to Your Server

```bash
ssh user@YOUR_SERVER_IP
```

### 2. Clone the Repository

```bash
git clone <your-repo-url> not-a-label
cd not-a-label
```

### 3. Configure Production Environment

```bash
# Copy and edit production environment
cp not-a-label-backend/config/production.env.example not-a-label-backend/config/production.env
nano not-a-label-backend/config/production.env
```

Update these critical values:
- `JWT_SECRET` - Generate with: `openssl rand -hex 32`
- `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
- OAuth credentials for each platform
- VAPID keys (already generated)
- OpenAI API key

### 4. Run Production Deployment

```bash
./deploy-production.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Build frontend assets
- ✅ Obtain SSL certificates from Let's Encrypt
- ✅ Deploy all services with Docker
- ✅ Initialize the database
- ✅ Start Temporal workflows

## 🔗 OAuth Provider Configuration

Update your OAuth apps with production URLs:

### Twitter/X
1. Go to https://developer.twitter.com/en/apps
2. Update your app settings:
   - Callback URL: `https://www.not-a-label.art/oauth/twitter/callback`
   - Website URL: `https://www.not-a-label.art`

### Discord
1. Go to https://discord.com/developers/applications
2. Update OAuth2 settings:
   - Redirect URI: `https://www.not-a-label.art/oauth/discord/callback`

### LinkedIn
1. Go to https://www.linkedin.com/developers/apps
2. Update OAuth 2.0 settings:
   - Redirect URL: `https://www.not-a-label.art/oauth/linkedin/callback`

## 📱 Testing Your Deployment

1. **Check SSL Certificate**
   ```
   https://www.ssllabs.com/ssltest/analyze.html?d=not-a-label.art
   ```

2. **Test API Endpoint**
   ```bash
   curl https://api.not-a-label.art/health
   ```

3. **Test WebSocket**
   - Open browser console on https://www.not-a-label.art
   - Check for "Connected to notification service" message

4. **Test OAuth Flows**
   - Try connecting each social media account
   - Verify redirect URLs work correctly

## 🛡️ Security Best Practices

1. **Firewall Configuration**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   sudo ufw enable
   ```

2. **Regular Updates**
   ```bash
   # Update SSL certificates (auto-renews via cron)
   docker-compose -f docker-compose.production.yml run certbot renew
   ```

3. **Backup Strategy**
   ```bash
   # Backup database daily
   docker-compose -f docker-compose.production.yml exec backend \
     sqlite3 /app/data/notalabel.db ".backup /app/data/backup-$(date +%Y%m%d).db"
   ```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
```

### Health Checks
- Main site: https://www.not-a-label.art
- API health: https://api.not-a-label.art/health
- Temporal UI: http://YOUR_SERVER_IP:8080 (consider VPN access only)

## 🔄 Updates and Maintenance

### Deploy Updates
```bash
# Pull latest changes
git pull

# Rebuild and redeploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

### Scale Services
```bash
# Scale workers for more capacity
docker-compose -f docker-compose.production.yml scale temporal-worker=3
```

## 🆘 Troubleshooting

### SSL Certificate Issues
```bash
# Force renewal
docker-compose -f docker-compose.production.yml run certbot renew --force-renewal
```

### Database Issues
```bash
# Access database
docker-compose -f docker-compose.production.yml exec backend \
  sqlite3 /app/data/notalabel.db
```

### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service-name]
```

## 🎉 Success Checklist

- [ ] Domain resolves to server IP
- [ ] SSL certificates obtained and working
- [ ] Can access https://www.not-a-label.art
- [ ] API responds at https://api.not-a-label.art
- [ ] WebSocket connects at wss://ws.not-a-label.art
- [ ] OAuth providers configured with production URLs
- [ ] Demo login works (demo@notalabel.com)
- [ ] Notifications appear in real-time
- [ ] Temporal workflows accessible

## 📞 Support

- **Domain Issues**: Contact your domain registrar
- **Server Issues**: Check your hosting provider's documentation
- **Application Issues**: Check logs and GitHub issues

---

**Congratulations!** Your Not a Label platform is now live at https://www.not-a-label.art 🎵✨