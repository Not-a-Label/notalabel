# Production Deployment Checklist for not-a-label.art

## Pre-Deployment Checklist

### 1. Domain Configuration ✓
- [ ] Domain: not-a-label.art is registered and active
- [ ] DNS A records point to production server IP
  - [ ] @ → Server IP
  - [ ] www → Server IP
  - [ ] api → Server IP
  - [ ] ws → Server IP

### 2. Server Requirements
- [ ] Ubuntu 20.04+ or similar Linux distribution
- [ ] Docker installed (v20.10+)
- [ ] Docker Compose installed (v2.0+)
- [ ] Git installed
- [ ] Minimum 2GB RAM, 20GB storage
- [ ] Ports 80, 443 open in firewall

### 3. GitHub Secrets Configuration
Visit: https://github.com/Not-a-Label/notalabel/settings/secrets/actions

Required secrets:
- [ ] JWT_SECRET
- [ ] ENCRYPTION_KEY
- [ ] VAPID_PUBLIC_KEY
- [ ] VAPID_PRIVATE_KEY
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION
- [ ] TWITTER_CLIENT_ID
- [ ] TWITTER_CLIENT_SECRET
- [ ] DISCORD_CLIENT_ID
- [ ] DISCORD_CLIENT_SECRET
- [ ] LINKEDIN_CLIENT_ID
- [ ] LINKEDIN_CLIENT_SECRET

### 4. OAuth Provider Configuration
Update redirect URLs:

**Twitter** (https://developer.twitter.com/en/apps):
- [ ] Callback URL: `https://api.not-a-label.art/api/auth/twitter/callback`

**Discord** (https://discord.com/developers/applications):
- [ ] Redirect URI: `https://api.not-a-label.art/api/auth/discord/callback`

**LinkedIn** (https://www.linkedin.com/developers/apps):
- [ ] Redirect URL: `https://api.not-a-label.art/api/auth/linkedin/callback`

## Deployment Steps

### Step 1: Server Setup
```bash
# SSH into your server
ssh user@not-a-label.art

# Clone the repository
git clone https://github.com/Not-a-Label/notalabel.git
cd notalabel

# Create production environment file
cp .env.example .env
nano .env  # Edit with production values
```

### Step 2: Configure Environment
Add to .env:
```env
NODE_ENV=production
DOMAIN=not-a-label.art
API_URL=https://api.not-a-label.art
WS_URL=wss://ws.not-a-label.art

# Add your OAuth credentials
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
# ... etc for Discord and LinkedIn

# Add your AWS credentials
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1

# Add generated keys
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
VAPID_PUBLIC_KEY=your_vapid_public
VAPID_PRIVATE_KEY=your_vapid_private
```

### Step 3: Deploy with Docker
```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Run database migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate
```

### Step 4: SSL Certificate Setup
Certbot will automatically obtain certificates. Verify:
```bash
# Check certificate status
docker-compose -f docker-compose.production.yml exec nginx certbot certificates
```

### Step 5: Verify Deployment
- [ ] Visit https://www.not-a-label.art - Main dashboard loads
- [ ] Visit https://api.not-a-label.art/health - API health check passes
- [ ] Test OAuth login for each provider
- [ ] Test real-time notifications
- [ ] Check SSL certificates are valid

## Post-Deployment

### Monitoring
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure log aggregation
- [ ] Set up backup automation
- [ ] Enable GitHub Dependabot alerts

### Security
- [ ] Enable Ubuntu automatic security updates
- [ ] Configure fail2ban
- [ ] Set up regular database backups
- [ ] Rotate secrets quarterly

### Performance
- [ ] Configure CloudFlare CDN (optional)
- [ ] Set up Redis memory limits
- [ ] Configure nginx caching

## Troubleshooting

### Common Issues

1. **Port 80/443 already in use**
   ```bash
   sudo lsof -i :80
   sudo lsof -i :443
   ```

2. **Database connection errors**
   ```bash
   docker-compose -f docker-compose.production.yml logs postgres
   ```

3. **SSL certificate issues**
   ```bash
   docker-compose -f docker-compose.production.yml exec nginx certbot renew --dry-run
   ```

## Maintenance Commands

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f [service_name]

# Restart services
docker-compose -f docker-compose.production.yml restart

# Update application
git pull
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Backup database
docker-compose -f docker-compose.production.yml exec backend npm run backup

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate
```

## Support

- GitHub Issues: https://github.com/Not-a-Label/notalabel/issues
- Logs: Check `/var/log/notalabel/` on production server