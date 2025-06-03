# Deploy Not a Label to DigitalOcean (159.89.247.208)

## 🚀 Quick Deployment Guide

### Prerequisites
- SSH access to 159.89.247.208
- Domain nameservers updated to DigitalOcean
- Application code ready in Not a Label repositories

### 📋 Deployment Steps

#### 1. SSH into the Server
```bash
ssh root@159.89.247.208
# or
ssh your-user@159.89.247.208
```

#### 2. Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx (if not already installed)
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### 3. Clone and Setup Backend
```bash
# Create app directory
sudo mkdir -p /var/www/not-a-label
cd /var/www/not-a-label

# Clone backend
git clone https://github.com/your-username/not-a-label-backend.git backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=4000
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/notalabel.db
JWT_SECRET=your-production-secret-key-here
OPENAI_API_KEY=your-openai-key-here
# Add other environment variables as needed
EOF

# Create data directory
mkdir -p data

# Build the application
npm run build

# Start with PM2
pm2 start dist/index-sqlite.js --name "nal-backend"
pm2 save
pm2 startup
```

#### 4. Clone and Setup Frontend
```bash
cd /var/www/not-a-label

# Clone frontend
git clone https://github.com/your-username/not-a-label-frontend.git frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://159.89.247.208:4000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# Add other environment variables
EOF

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "nal-frontend" -- start
pm2 save
```

#### 5. Configure Nginx
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/not-a-label

# Add this configuration:
```

```nginx
server {
    listen 80;
    server_name not-a-label.art www.not-a-label.art;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.not-a-label.art;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 6. Setup SSL (After DNS Propagation)
```bash
# Once DNS points to this server, run:
sudo certbot --nginx -d not-a-label.art -d www.not-a-label.art -d api.not-a-label.art
```

#### 7. Setup Firewall
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 8. Verify Deployment
```bash
# Check PM2 processes
pm2 status

# Check logs
pm2 logs nal-backend
pm2 logs nal-frontend

# Test endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:4000/health  # Backend
```

## 🔍 Troubleshooting

### If frontend doesn't start:
```bash
cd /var/www/not-a-label/frontend
pm2 delete nal-frontend
PORT=3000 pm2 start npm --name "nal-frontend" -- start
```

### If backend doesn't start:
```bash
cd /var/www/not-a-label/backend
pm2 delete nal-backend
pm2 start dist/index-sqlite.js --name "nal-backend"
```

### Check nginx errors:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check application logs:
```bash
pm2 logs --lines 100
```

## 📊 Post-Deployment Checklist

- [ ] Frontend accessible at http://159.89.247.208
- [ ] Backend API responds at http://159.89.247.208:4000/health
- [ ] PM2 processes running and saved
- [ ] Nginx configured and tested
- [ ] Environment variables properly set
- [ ] Database initialized
- [ ] SSL certificate installed (after DNS propagation)
- [ ] Firewall configured
- [ ] Monitoring setup (optional)

## 🎉 Success Indicators

Once deployed, you should be able to:
1. Access the frontend at http://not-a-label.art
2. Access the API at http://api.not-a-label.art/health
3. Register a new user account
4. Login and access the dashboard
5. All features working properly

---

**Note**: Update GitHub repository URLs and environment variables with your actual values.