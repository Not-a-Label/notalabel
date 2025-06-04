# 🚀 Production Deployment Guide - not-a-label.art

## 📋 Prerequisites for Production Deployment

### Server Requirements
- **VPS/Dedicated Server** with at least 4GB RAM, 50GB storage
- **Ubuntu 20.04 LTS** or newer
- **Docker & Docker Compose** installed
- **Domain ownership** of not-a-label.art
- **SSH access** to the production server

### DNS Configuration Required
Point these DNS records to your production server IP:
```
A    not-a-label.art        → YOUR_SERVER_IP
A    www.not-a-label.art    → YOUR_SERVER_IP  
A    api.not-a-label.art    → YOUR_SERVER_IP
```

### API Keys & Credentials Needed
- OpenAI API key (for AI features)
- Spotify Client ID & Secret
- Google OAuth credentials
- Stripe live API keys
- Email service credentials (SMTP)
- Google Analytics & Mixpanel tokens

## 🔧 Setup Instructions

### 1. Server Preparation

**Connect to your production server:**
```bash
ssh root@your.server.ip
```

**Install Docker and Docker Compose:**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**Clone the repository:**
```bash
# Create application directory
mkdir -p /opt/not-a-label
cd /opt/not-a-label

# Clone repository
git clone https://github.com/Not-a-Label/notalabel.git .
git submodule update --init --recursive
```

### 2. Environment Configuration

**Create production environment files:**

**Backend (.env.production):**
```bash
cd /opt/not-a-label/not-a-label-backend
cp .env.example .env.production
nano .env.production
```

Add your production values:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://not_a_label_user:YOUR_DB_PASSWORD@postgres:5432/not_a_label
REDIS_URL=redis://:YOUR_DB_PASSWORD@redis:6379
JWT_SECRET=your-super-secure-jwt-secret-256-bits-minimum
SESSION_SECRET=your-session-secret-here

# AI Features
OPENAI_API_KEY=sk-your-real-openai-api-key
AI_MODEL=gpt-4
MAX_AI_REQUESTS_PER_USER=100

# Third-party APIs  
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=noreply@not-a-label.art
EMAIL_PASS=your-app-password

# Analytics
GOOGLE_ANALYTICS_ID=G-YOUR-GA-ID
MIXPANEL_TOKEN=your-mixpanel-token
```

**Frontend (.env.production):**
```bash
cd /opt/not-a-label/not-a-label-frontend
cp .env.example .env.production
nano .env.production
```

Add your production values:
```bash
NEXT_PUBLIC_API_URL=https://api.not-a-label.art
NEXTAUTH_URL=https://not-a-label.art
NEXTAUTH_SECRET=your-nextauth-secret

# Enhanced Analytics Features
NEXT_PUBLIC_ENABLE_ENHANCED_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_PREDICTIONS=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key

# OAuth
SPOTIFY_CLIENT_ID=your-spotify-client-id
GOOGLE_CLIENT_ID=your-google-client-id

# Analytics
NEXT_PUBLIC_GA_ID=G-YOUR-GA-ID
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
NEXT_PUBLIC_DOMAIN=https://not-a-label.art
```

**Main environment (.env.secrets):**
```bash
cd /opt/not-a-label
cp .env.secrets.example .env.secrets
nano .env.secrets
```

Update with your secure passwords and keys.

### 3. Deploy the Platform

**Run the deployment script:**
```bash
cd /opt/not-a-label
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

The script will:
- Pull latest code from GitHub
- Build Docker containers
- Initialize PostgreSQL database
- Start all services
- Configure SSL certificates
- Run health checks

### 4. Verify Deployment

**Check service status:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

**Test endpoints:**
```bash
# Health check
curl https://api.not-a-label.art/health

# Enhanced analytics
curl https://api.not-a-label.art/api/analytics/enhanced

# AI predictions
curl -X POST https://api.not-a-label.art/api/analytics/predictions \
  -H "Content-Type: application/json" \
  -d '{"timeHorizons":["30d"]}'
```

**Check logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
```

## 🌐 DNS & SSL Configuration

### DNS Records
Ensure these records point to your server:
```
Type  Name                  Value
A     not-a-label.art       YOUR_SERVER_IP
A     www.not-a-label.art   YOUR_SERVER_IP
A     api.not-a-label.art   YOUR_SERVER_IP
```

### SSL Certificates
SSL certificates are automatically obtained using Let's Encrypt during deployment. If manual setup is needed:

```bash
# Obtain certificates
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email admin@not-a-label.art --agree-tos --no-eff-email \
  -d not-a-label.art -d www.not-a-label.art -d api.not-a-label.art

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 📊 Enhanced Analytics Features

Once deployed, these features will be available:

### Live Endpoints
- **Enhanced Analytics**: `https://api.not-a-label.art/api/analytics/enhanced`
- **AI Predictions**: `https://api.not-a-label.art/api/analytics/predictions`
- **AI Assistant**: `https://api.not-a-label.art/api/analytics/ai-assistant`
- **Recommendations**: `https://api.not-a-label.art/api/analytics/recommendations`
- **Trend Forecasts**: `https://api.not-a-label.art/api/analytics/trends/forecast`
- **Market Opportunities**: `https://api.not-a-label.art/api/analytics/opportunities`

### Dashboard Access
- **Main App**: `https://not-a-label.art`
- **Analytics Dashboard**: `https://not-a-label.art/dashboard/analytics`
- **AI Assistant**: `https://not-a-label.art/dashboard/ai`

## 🔧 Maintenance & Updates

### Update Deployment
```bash
cd /opt/not-a-label
git pull origin main
git submodule update --recursive --remote
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump \
  -U not_a_label_user not_a_label > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql \
  -U not_a_label_user not_a_label < backup_file.sql
```

### Monitor Logs
```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Error logs only
docker-compose -f docker-compose.prod.yml logs | grep ERROR

# Specific timeframe
docker-compose -f docker-compose.prod.yml logs --since="1h" backend
```

### Scale Services
```bash
# Scale backend horizontally
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Resource monitoring
docker stats

# Service health
curl https://api.not-a-label.art/health
```

## 🚨 Troubleshooting

### Common Issues

**SSL Certificate Renewal:**
```bash
# Manual renewal
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

**Database Connection Issues:**
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U not_a_label_user not_a_label
```

**Service Not Starting:**
```bash
# Check specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml ps

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### Performance Optimization

**Database Optimization:**
```sql
-- Connect to database and run
ANALYZE;
REINDEX DATABASE not_a_label;
VACUUM FULL;
```

**Cache Warming:**
```bash
# Warm up Redis cache
curl https://api.not-a-label.art/api/analytics/enhanced
curl https://api.not-a-label.art/api/analytics/recommendations
```

## 🎯 Post-Deployment Checklist

- [ ] All services running (docker-compose ps)
- [ ] SSL certificates active (https works)
- [ ] Database initialized with schema
- [ ] Enhanced analytics endpoints responding
- [ ] AI features working (predictions, assistant)
- [ ] Frontend loading properly
- [ ] Domain routing correct
- [ ] Monitoring alerts configured
- [ ] Backup system active
- [ ] Performance metrics baseline established

## 🎵 Success Metrics

Once deployed, track these KPIs:
- **Response Times**: < 500ms for all endpoints
- **Uptime**: > 99.9% availability
- **AI Accuracy**: > 80% prediction confidence
- **User Engagement**: Dashboard usage analytics
- **Platform Growth**: Artist adoption metrics

---

**🎉 Your Enhanced Analytics Platform is now live at https://not-a-label.art!**

*Ready to revolutionize the independent music industry!* 🚀