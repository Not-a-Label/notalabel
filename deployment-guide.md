# Deployment Guide for Not-a-Label

## GitHub Repository Setup ✅

Your repository is now live at: https://github.com/Not-a-Label/notalabel

## Required GitHub Secrets

Go to https://github.com/Not-a-Label/notalabel/settings/secrets/actions and add:

### Required Secrets:
- `JWT_SECRET` - Your JWT secret key
- `ENCRYPTION_KEY` - 32-byte hex string for encryption
- `VAPID_PUBLIC_KEY` - Your VAPID public key
- `VAPID_PRIVATE_KEY` - Your VAPID private key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)

### Optional Production Secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `PRODUCTION_HOST` - Your production server (not-a-label.art)
- `PRODUCTION_USER` - SSH user for deployment

## OAuth Provider Updates

Update redirect URLs at:

1. **Twitter**: https://developer.twitter.com/en/apps
   - Callback URL: `https://api.not-a-label.art/api/auth/twitter/callback`

2. **Discord**: https://discord.com/developers/applications
   - Redirect URI: `https://api.not-a-label.art/api/auth/discord/callback`

3. **LinkedIn**: https://www.linkedin.com/developers/apps
   - Redirect URL: `https://api.not-a-label.art/api/auth/linkedin/callback`

## Local Development

```bash
# Install dependencies
cd not-a-label-backend
npm install

# Generate keys if needed
npx web-push generate-vapid-keys

# Start development
npm run dev
```

## Production Deployment

1. **Server Setup**:
```bash
# On your production server
git clone https://github.com/Not-a-Label/notalabel.git
cd notalabel

# Create production .env file
cp .env.example .env
# Edit .env with production values

# Deploy with Docker
docker-compose -f docker-compose.production.yml up -d
```

2. **SSL Certificates**:
```bash
# Certbot will auto-renew via the Docker container
# Initial setup is handled by the nginx container
```

3. **Database Migrations**:
```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate
```

## Monitoring

- GitHub Actions: https://github.com/Not-a-Label/notalabel/actions
- Dependabot Alerts: https://github.com/Not-a-Label/notalabel/security/dependabot

## Security Notes

1. Never commit `.env` files
2. Rotate tokens regularly
3. Use GitHub Secrets for CI/CD
4. Enable 2FA on all service accounts
5. Monitor Dependabot alerts

## Support

- Issues: https://github.com/Not-a-Label/notalabel/issues
- Documentation: https://github.com/Not-a-Label/notalabel/wiki