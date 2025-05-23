#!/bin/bash

echo "Starting Not a Label services..."

# Start backend
echo "Starting backend..."
cd "/Users/kentino/Not a Label/not-a-label-backend"
npm run dev:sqlite &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd "/Users/kentino/Not a Label/not-a-label-frontend"
npm run dev &
FRONTEND_PID=$!

echo "Services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait