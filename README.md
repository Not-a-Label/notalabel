# 🎵 Not a Label - AI-Powered Music Platform

<p align="center">
  <img src="public/logo-nal.png" alt="Not a Label Logo" width="200">
</p>

<p align="center">
  <strong>Empowering Independent Musicians with AI & Automation</strong>
</p>

<p align="center">
  <a href="https://www.not-a-label.art">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-docs">API Docs</a>
</p>

---

## 🚀 Overview

Not a Label is a comprehensive platform for independent musicians that combines music management, revenue tracking, AI-powered tools, and social media automation. Built with modern web technologies and designed to scale.

### 🏗️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite/PostgreSQL
- **Frontend**: React/Vue (or vanilla JS), TailwindCSS
- **Real-time**: Socket.io for notifications
- **AI**: OpenAI GPT-4 integration
- **Automation**: Temporal.io workflows
- **Authentication**: JWT with secure token management
- **Infrastructure**: Docker, Nginx, Let's Encrypt SSL

## ✨ Features

### 🎼 Music Management
- Upload and organize tracks, albums, and playlists
- Metadata management and cover art
- Stream tracking across platforms

### 💰 Revenue & Analytics
- Real-time revenue tracking from multiple sources
- Royalty split management
- Detailed analytics and insights
- Financial reporting and invoicing

### 🤖 AI-Powered Tools
- **Lyrics Generator**: Create original lyrics with AI
- **Marketing Content**: Generate social media posts and press releases
- **Trend Analysis**: Get insights on music trends
- **Collaboration Matching**: Find compatible artists

### 📱 Social Media Automation
- **Multi-platform posting**: Twitter, Discord, Instagram, LinkedIn
- **Release campaigns**: Automated promotion workflows
- **Fan engagement**: Monitor and respond to mentions
- **Distribution**: Automated DistroKid uploads

### 🔔 Real-time Notifications
- WebSocket-powered instant updates
- Push notifications support
- Activity feed and milestones
- Customizable preferences

### 👥 Community Features
- Fan clubs and exclusive content
- Direct messaging with fans
- Event and tour management
- Merchandise integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/not-a-label.git
   cd not-a-label
   ```

2. **Install dependencies**
   ```bash
   cd not-a-label-backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

4. **Initialize database**
   ```bash
   npm run db:init
   ```

5. **Start the development server**
   ```bash
   cd ..
   ./deploy-local.sh
   ```

6. **Access the application**
   - Dashboard: http://localhost:4000
   - API: http://localhost:4000/api
   - Notifications: http://localhost:4001

### Demo Credentials
- Email: `demo@notalabel.com`
- Password: `demo123`

## 🌐 Production Deployment

### Using Docker (Recommended)

1. **Configure your domain DNS**
   ```
   A record: @ → YOUR_SERVER_IP
   A record: www → YOUR_SERVER_IP
   A record: api → YOUR_SERVER_IP
   A record: ws → YOUR_SERVER_IP
   ```

2. **Deploy with Docker Compose**
   ```bash
   ./deploy-production.sh
   ```

3. **Access your live site**
   - https://www.not-a-label.art

### Manual Deployment
See [DOMAIN-SETUP-GUIDE.md](DOMAIN-SETUP-GUIDE.md) for detailed instructions.

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Music Management
```bash
GET    /api/music/tracks
POST   /api/music/tracks
GET    /api/music/tracks/:id
PUT    /api/music/tracks/:id
DELETE /api/music/tracks/:id
```

### Social Media Automation
```bash
# OAuth
GET  /api/social-automation/oauth/twitter/start
POST /api/social-automation/oauth/twitter/callback

# Actions
POST /api/social-automation/actions/tweet
POST /api/social-automation/actions/discord
POST /api/social-automation/actions/instagram

# Workflows
POST /api/social-automation/workflows/release-promotion
GET  /api/social-automation/workflows/:id/status
```

### Notifications
```bash
GET   /api/notifications
PATCH /api/notifications/:id/read
POST  /api/notifications/push/subscribe
GET   /api/notifications/preferences
```

## 🔧 Configuration

### OAuth Setup

1. **Twitter/X**
   - Create app at https://developer.twitter.com
   - Add callback URL: `https://your-domain.com/oauth/twitter/callback`

2. **Discord**
   - Create app at https://discord.com/developers
   - Add redirect URI: `https://your-domain.com/oauth/discord/callback`

3. **LinkedIn**
   - Create app at https://linkedin.com/developers
   - Add redirect URL: `https://your-domain.com/oauth/linkedin/callback`

### Environment Variables

```env
# Database
DATABASE_PATH=./data/notalabel.db

# Authentication
JWT_SECRET=your-secret-key

# OAuth (Production URLs)
TWITTER_CLIENT_ID=xxx
TWITTER_CLIENT_SECRET=xxx
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx

# AI
OPENAI_API_KEY=sk-xxx

# Notifications
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │ Temporal Worker │
│   Dashboard     │──→ │   (Express)     │──→ │   (Workflows)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ AWS Secrets     │    │   SQLite DB     │    │ Social Media    │
│ Manager         │    │   (Local Data)  │    │ APIs            │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for independent musicians
- Powered by OpenAI for AI features
- Temporal.io for reliable workflow orchestration
- All contributors and supporters

## 📞 Support

- **Documentation**: [docs.not-a-label.art](https://docs.not-a-label.art)
- **Discord**: [Join our community](https://discord.gg/notalabel)
- **Email**: support@not-a-label.art

---

<p align="center">
  Made with 🎵 by musicians, for musicians
</p>