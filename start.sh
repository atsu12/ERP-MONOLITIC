#!/bin/bash

echo "🚀 Starting Business MGT App..."

# Kill anything on port 5000 (clean start)
echo "🧹 Cleaning old processes..."
fuser -k 5000/tcp 2>/dev/null

# Start backend
echo "📦 Starting backend..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a bit for backend to boot
sleep 5

# Start ngrok
echo "🌐 Starting ngrok..."
ngrok http 5000 &
NGROK_PID=$!

echo ""
echo "✅ Backend PID: $BACKEND_PID"
echo "✅ Ngrok PID: $NGROK_PID"
echo ""
echo "👉 App should be live shortly"

wait
