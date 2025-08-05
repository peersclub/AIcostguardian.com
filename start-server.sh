#!/bin/bash

echo "🚀 Starting AssetWorks Website Development Server..."

# Kill any existing processes
pkill -f "vite" 2>/dev/null || true

# Try different ports in sequence
for port in 8080 3000 3001 5173 4000; do
    echo "Trying port $port..."
    if ! lsof -i :$port > /dev/null 2>&1; then
        echo "✅ Port $port is available"
        npm run dev -- --port $port --host 0.0.0.0
        break
    else
        echo "❌ Port $port is in use"
    fi
done