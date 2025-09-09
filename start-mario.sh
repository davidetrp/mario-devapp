#!/bin/bash

# Mario Development Startup Script
echo "🚀 Starting Mario Application..."

# Function to kill processes on exit
cleanup() {
  echo "🛑 Stopping all services..."
  kill $(jobs -p) 2>/dev/null
  exit
}

trap cleanup SIGINT SIGTERM

# Start PostgreSQL (if not already running)
if ! pgrep -x "postgres" > /dev/null; then
  echo "🗄️ Starting PostgreSQL..."
  brew services start postgresql 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || echo "⚠️ Please start PostgreSQL manually"
fi

# Start backend
echo "⚙️ Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Mario is running!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend:  http://localhost:3001"
echo "🗄️ Database: mario_db on localhost:5432"
echo ""
echo "👤 Test login: designpro@example.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
