#!/bin/bash

# Deploy the vercel.json fix to Vercel

echo "Deploying vercel.json fix to Vercel..."

# The fix has already been committed locally
# We just need to get Vercel to use the updated configuration

# Remove old Vercel link
rm -rf .vercel

# Link to Vercel project again and deploy
vercel --yes --prod

echo "Deployment initiated. Check Vercel dashboard for status."