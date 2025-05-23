#!/bin/bash

# Use this script to start all services in development mode

# Define root directory
ROOT_DIR=$(pwd)

# Start backend
cd $ROOT_DIR/not-a-label-backend
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Start frontend
cd $ROOT_DIR/not-a-label-frontend
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Function to handle termination
function cleanup {
  echo "Stopping servers..."
  kill $BACKEND_PID $FRONTEND_PID
  exit 0
}

# Trap ctrl-c
trap cleanup INT

# Wait
echo "✅ Development environment running"
echo "📝 Press Ctrl+C to stop all services"
wait 