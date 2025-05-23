#!/bin/bash

echo "Setting up Not a Label development environment..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ git is not installed. Please install git first."
    exit 1
fi

# Set GitHub username
read -p "Enter your GitHub username (leave blank to skip GitHub setup): " GITHUB_USERNAME

# Set root directory
ROOT_DIR=$(pwd)
echo "📁 Using $ROOT_DIR as root directory"

# Setup shared library
echo "🔨 Setting up shared library..."
cd $ROOT_DIR/not-a-label-shared
npm install
npm run build
npm link
echo "✅ Shared library setup complete"

# Setup backend
echo "🔨 Setting up backend..."
cd $ROOT_DIR/not-a-label-backend
npm install
npm link @not-a-label/shared
echo "✅ Backend setup complete"

# Setup frontend
echo "🔨 Setting up frontend..."
cd $ROOT_DIR/not-a-label-frontend
npm install
npm link @not-a-label/shared
echo "✅ Frontend setup complete"

# Setup environment files
echo "🔧 Setting up environment files..."

# Backend .env if not exists
if [ ! -f "$ROOT_DIR/not-a-label-backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > $ROOT_DIR/not-a-label-backend/.env << EOL
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/not_a_label

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=4000
NODE_ENV=development
EOL
    echo "✅ Backend .env created"
else
    echo "Backend .env already exists, skipping"
fi

# Frontend .env.local if not exists
if [ ! -f "$ROOT_DIR/not-a-label-frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    cat > $ROOT_DIR/not-a-label-frontend/.env.local << EOL
# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Features
NEXT_PUBLIC_ENABLE_PWA=true
EOL
    echo "✅ Frontend .env.local created"
else
    echo "Frontend .env.local already exists, skipping"
fi

# Set up GitHub if username is provided
if [ ! -z "$GITHUB_USERNAME" ]; then
    echo "🔧 Setting up GitHub remotes..."
    
    # Shared library
    cd $ROOT_DIR/not-a-label-shared
    git remote set-url origin git@github.com:$GITHUB_USERNAME/not-a-label-shared.git
    
    # Backend
    cd $ROOT_DIR/not-a-label-backend
    git remote set-url origin git@github.com:$GITHUB_USERNAME/not-a-label-backend.git
    
    # Frontend
    cd $ROOT_DIR/not-a-label-frontend
    git remote set-url origin git@github.com:$GITHUB_USERNAME/not-a-label-frontend.git
    
    echo "✅ GitHub remotes configured"
fi

# Create start script
cat > $ROOT_DIR/start-dev.sh << EOL
#!/bin/bash

# Use this script to start all services in development mode

# Start backend
cd $ROOT_DIR/not-a-label-backend
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=\$!

# Start frontend
cd $ROOT_DIR/not-a-label-frontend
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=\$!

# Function to handle termination
function cleanup {
  echo "Stopping servers..."
  kill \$BACKEND_PID \$FRONTEND_PID
  exit 0
}

# Trap ctrl-c
trap cleanup INT

# Wait
echo "✅ Development environment running"
echo "📝 Press Ctrl+C to stop all services"
wait
EOL

chmod +x $ROOT_DIR/start-dev.sh

echo "🎉 Setup complete! You can start the development environment with:"
echo "./start-dev.sh" 