# 🚀 Not-a-Label Quick Start Guide

Welcome to Not-a-Label! This guide will get you up and running in minutes.

## 🎯 What is Not-a-Label?

Not-a-Label is an automated social media management platform for independent artists, featuring:
- Multi-platform posting (Twitter, Discord, LinkedIn, Instagram)
- Music distribution integration (DistroKid)
- Real-time notifications
- OAuth authentication
- Automated workflows

## 🏃 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- Git
- npm or yarn

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/Not-a-Label/notalabel.git
cd notalabel

# Install dependencies
cd not-a-label-backend
npm install

# Copy environment file
cp .env.example .env
```

### 2. Generate Required Keys
```bash
# Generate VAPID keys for notifications
npx web-push generate-vapid-keys

# Add to .env file:
# VAPID_PUBLIC_KEY=your_public_key
# VAPID_PRIVATE_KEY=your_private_key
```

### 3. Start Development Server
```bash
# Start the backend
npm run dev

# The API will be available at http://localhost:3001
```

### 4. Access the Dashboard
Open `enhanced-dashboard.html` in your browser or visit http://localhost:3001

## 🚀 Production Deployment

### 1. Server Requirements
- Ubuntu 20.04+ or similar Linux
- Docker & Docker Compose
- Domain with DNS configured

### 2. Quick Deploy
```bash
# On your server
wget https://raw.githubusercontent.com/Not-a-Label/notalabel/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 3. Configure & Launch
```bash
# Edit environment variables
nano .env

# Start services
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
./verify-deployment.sh
```

## 🔧 Configuration

### Required Environment Variables
```env
# Authentication
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-byte-hex-key

# Web Push
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# OAuth (Get from provider dashboards)
TWITTER_CLIENT_ID=xxx
TWITTER_CLIENT_SECRET=xxx
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# AWS (for secrets management)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
```

## 📁 Project Structure
```
notalabel/
├── not-a-label-backend/     # Express.js backend
│   ├── src/                 # Source code
│   ├── migrations/          # Database migrations
│   └── data/               # SQLite database
├── enhanced-dashboard.html  # Web interface
├── docker-compose.*.yml    # Docker configurations
├── nginx.conf              # Production web server
└── scripts/                # Utility scripts
```

## 🛠️ Common Tasks

### Add a New Platform
1. Create OAuth app on platform
2. Add credentials to `.env`
3. Implement platform service in `src/services/`
4. Add routes in `src/routes/`

### Run Tests
```bash
npm test
```

### Check Logs
```bash
# Development
tail -f logs/app.log

# Production
docker-compose -f docker-compose.production.yml logs -f
```

### Backup Database
```bash
# Development
cp data/notalabel.db backups/notalabel_$(date +%Y%m%d).db

# Production
./backup.sh
```

## 🔍 Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (should be 18+)
- Verify all dependencies: `npm install`
- Check environment variables: `cat .env`

### OAuth not working
- Verify redirect URLs match your domain
- Check client ID/secret are correct
- Ensure HTTPS in production

### Database errors
- Run migrations: `npm run migrate`
- Check file permissions on `data/` directory

## 📚 Resources

- [Full Documentation](https://github.com/Not-a-Label/notalabel/wiki)
- [API Reference](https://api.not-a-label.art/docs)
- [Issue Tracker](https://github.com/Not-a-Label/notalabel/issues)
- [Deployment Guide](./deployment-guide.md)
- [Maintenance Guide](./maintenance-guide.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

Need help? Open an issue at https://github.com/Not-a-Label/notalabel/issues