# Not a Label - Deployment Guide

## Current Status

The Not a Label application is ready with the following components:

### Backend (SQLite)
- **Running on**: http://localhost:4000
- **Database**: SQLite (file: `not-a-label-backend/data/notalabel.db`)
- **Features**: JWT auth, user profiles, analytics, AI integration

### Frontend
- **Location**: `not-a-label-frontend/`
- **Framework**: Next.js 15 with React 19
- **Auth**: JWT-based (no Supabase dependency)

## Test Accounts
- Email: `testartist@example.com`, Password: `password123`
- Email: `janesmith@example.com`, Password: `password123`

## Quick Start

### Option 1: Run Backend Only (Recommended for now)
```bash
cd not-a-label-backend
npm run dev:sqlite
```

The backend API is fully functional at http://localhost:4000

### Option 2: Run with Simple Frontend
```bash
# Terminal 1 - Backend
cd not-a-label-backend
npm run dev:sqlite

# Terminal 2 - Simple Frontend
cd ..
node simple-frontend.js
```

Access at http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Refresh token
- GET `/api/auth/verify` - Verify token

### Profile
- GET `/api/profile` - Get current user profile
- PUT `/api/profile` - Update profile
- POST `/api/profile/avatar` - Upload avatar
- GET `/api/profile/artists/all` - List all artists

### Analytics
- GET `/api/analytics/dashboard` - Dashboard data
- GET `/api/analytics/streams` - Streaming analytics
- POST `/api/analytics/streams` - Add stream data

### AI
- POST `/api/ai/chat` - AI assistant chat

## Deployment Options

### 1. Deploy Backend with SQLite
The backend is ready to deploy to any Node.js hosting:
- Heroku
- Railway
- Render
- VPS with PM2

### 2. Database Considerations
SQLite works well for:
- Small to medium traffic
- Single server deployments
- Quick prototypes

For production scale, consider migrating to:
- PostgreSQL
- MySQL
- MongoDB

### 3. Frontend Deployment
The Next.js frontend can be deployed to:
- Vercel (recommended)
- Netlify
- Any static hosting after build

## Environment Variables

Create `.env` file:
```
# Backend
JWT_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-key
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Next Steps

1. **Fix Next.js Issue**: The frontend has a configuration issue preventing it from serving. This needs debugging.

2. **Add Features**:
   - Music upload system
   - Real streaming platform integrations
   - Payment processing
   - Email notifications

3. **Production Hardening**:
   - Add rate limiting
   - Implement proper logging
   - Set up monitoring
   - Add automated backups

4. **Scale Considerations**:
   - Move to PostgreSQL for production
   - Add Redis for caching
   - Implement CDN for static assets
   - Set up load balancing

The application core is functional and ready for iterative development!