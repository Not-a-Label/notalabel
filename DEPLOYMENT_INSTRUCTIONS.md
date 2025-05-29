# Not a Label - Frontend Deployment Instructions

## Manual Deployment Steps

Since SSH authentication is failing, here are the manual steps to deploy the updated frontend:

### 1. Create the deployment archive locally

```bash
cd "/Users/kentino/Not a Label"
tar -czf frontend-deploy.tar.gz \
  not-a-label-frontend/package*.json \
  not-a-label-frontend/next.config.js \
  not-a-label-frontend/tsconfig.json \
  not-a-label-frontend/.env.production \
  not-a-label-frontend/src \
  not-a-label-frontend/public \
  not-a-label-frontend/.next \
  not-a-label-frontend/postcss.config.js
```

### 2. Upload to server

You'll need to use your preferred method to upload the file. Options:
- Use an FTP client with your server credentials
- Use a different SSH key that works
- Use password authentication if enabled

Upload `frontend-deploy.tar.gz` to your server at `147.182.252.146`

### 3. Connect to your server

```bash
ssh root@147.182.252.146
```

### 4. Deploy on the server

Once connected, run these commands:

```bash
# Extract the files
tar -xzf frontend-deploy.tar.gz

# Stop the existing frontend container
docker-compose stop frontend

# Rebuild and start the frontend
docker-compose up -d --build frontend

# Check the logs
docker-compose logs -f frontend

# Clean up
rm frontend-deploy.tar.gz
```

### 5. Verify deployment

Visit https://www.not-a-label.art to see the updated site with all the new features:

- New navigation with Discover, Collaborate, and Learn pages
- Enhanced dashboard with all feature pages
- Artist onboarding flow
- Music player component
- And much more!

## Alternative: Direct Server Deployment

If you have SSH access working, you can also:

1. SSH into the server
2. Pull the latest changes from your git repository (if you have one)
3. Or manually update the files
4. Run `docker-compose up -d --build frontend` to rebuild

## Troubleshooting

If the site doesn't update:
1. Clear your browser cache
2. Check Docker logs: `docker-compose logs frontend`
3. Ensure the container is running: `docker ps`
4. Check nginx is routing correctly: `nginx -t`

## New Features Deployed

### Public Pages:
- **Discover** (/discover) - Music discovery platform
- **Collaborate** (/collaborate) - Find collaborators and projects  
- **Learn** (/learn) - Educational resources and courses

### Dashboard Pages:
- **Enhanced Dashboard** - Quick actions for all features
- **AI Tools** - 6 AI-powered tools
- **Revenue & Royalties** - Financial management
- **Community** - Fan engagement
- **Events** - Live events and tours
- **Merchandise** - E-commerce management
- **Settings** - Comprehensive settings panel

### Onboarding Flow:
- Welcome
- Profile setup
- Platform connections
- Content upload
- Goals & preferences
- Dashboard tour
- Completion celebration

### Components:
- Music Player with playlist support
- Progress indicators
- Interactive UI elements