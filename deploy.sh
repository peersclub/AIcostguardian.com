#!/bin/bash

echo "🚀 Deploying AI Cost Guardian to production..."

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your application is now live at: https://aicostguardian.vercel.app"