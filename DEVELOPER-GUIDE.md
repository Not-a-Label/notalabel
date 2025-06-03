# Not a Label Developer Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- SQLite (for development)
- Redis (optional, for caching)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/not-a-label.git
   cd not-a-label
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed # Optional: add demo data
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api

## Project Structure

```
not-a-label/
├── backend/
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   └── utils/        # Utility functions
│   ├── data/            # SQLite database
│   ├── tests/           # Backend tests
│   └── package.json
│
├── frontend/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── lib/            # Utility functions
│   ├── public/         # Static assets
│   ├── styles/         # CSS/Tailwind styles
│   └── package.json
│
├── scripts/            # Deployment & maintenance scripts
├── docs/              # Documentation
└── README.md
```

## Development Workflow

### 1. Creating a New Feature

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes
# ... code ...

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: add my new feature"

# Push to GitHub
git push origin feature/my-new-feature
```

### 2. Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### 3. Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 4. Database Migrations

```bash
# Create a new migration
npm run db:migration:create -- --name add_user_preferences

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

## API Development

### Creating a New Endpoint

1. **Define the route** in `backend/src/routes/`
   ```javascript
   // backend/src/routes/myFeature.js
   const express = require('express');
   const router = express.Router();
   
   router.get('/my-endpoint', authenticate, async (req, res) => {
     // Implementation
   });
   
   module.exports = router;
   ```

2. **Add business logic** in `backend/src/services/`
   ```javascript
   // backend/src/services/myFeatureService.js
   class MyFeatureService {
     async getData(userId) {
       // Business logic here
     }
   }
   
   module.exports = new MyFeatureService();
   ```

3. **Register the route** in `backend/src/app.js`
   ```javascript
   app.use('/api/my-feature', require('./routes/myFeature'));
   ```

### Middleware

Common middleware available:
- `authenticate` - Verify JWT token
- `validate` - Input validation
- `rateLimiter` - Rate limiting
- `cache` - Redis caching

## Frontend Development

### Creating Components

```jsx
// components/MyComponent.jsx
import { useState } from 'react';

export default function MyComponent({ title }) {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <button 
        onClick={() => setCount(count + 1)}
        className="btn btn-primary"
      >
        Count: {count}
      </button>
    </div>
  );
}
```

### Using API Hooks

```jsx
// lib/hooks/useTrack.js
import useSWR from 'swr';

export function useTracks() {
  const { data, error, isLoading } = useSWR('/api/tracks');
  
  return {
    tracks: data?.tracks || [],
    isLoading,
    isError: error
  };
}
```

### State Management

We use React Context for global state:

```jsx
// contexts/AuthContext.jsx
import { createContext, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}
```

## Deployment

### Automatic Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions.

### Manual Deployment

```bash
# Deploy to production
./scripts/deploy-production.sh

# Deploy to staging
./scripts/deploy-staging.sh
```

## Debugging

### Backend Debugging

1. **Enable debug mode**
   ```bash
   DEBUG=app:* npm run dev
   ```

2. **Use VS Code debugger**
   - Press F5 with the backend folder open
   - Set breakpoints in your code

3. **Check logs**
   ```bash
   # Development
   npm run dev
   
   # Production
   pm2 logs backend-fixed
   ```

### Frontend Debugging

1. **React Developer Tools**
   - Install browser extension
   - Inspect component state and props

2. **Network debugging**
   - Check browser DevTools Network tab
   - Look for API call issues

3. **Console logging**
   ```javascript
   console.log('Debug info:', { data });
   ```

## Common Issues

### Database Connection Failed
```bash
# Check if database exists
ls backend/data/notalabel.db

# Reset database
rm backend/data/notalabel.db
npm run db:migrate
```

### Port Already in Use
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Module Not Found
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **Use database indexes**
   ```sql
   CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
   ```

2. **Implement caching**
   ```javascript
   const cached = await redis.get(key);
   if (cached) return JSON.parse(cached);
   ```

3. **Optimize queries**
   ```javascript
   // Bad
   const tracks = await Track.findAll();
   const filtered = tracks.filter(t => t.genre === 'rock');
   
   // Good
   const tracks = await Track.findAll({ where: { genre: 'rock' } });
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
```

## Resources

- [API Documentation](./API-DOCUMENTATION.md)
- [Deployment Guide](./NOT-A-LABEL-DEPLOYMENT-GUIDE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

- Discord: https://discord.gg/notalabel
- Email: dev@not-a-label.art
- Issues: https://github.com/your-org/not-a-label/issues