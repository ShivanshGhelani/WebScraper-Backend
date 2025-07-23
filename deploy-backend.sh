#!/bin/bash

echo "🚀 Deploying Website Analyzer Backend to Vercel..."

# Change to backend directory
cd backend

# Deploy to Vercel
vercel --prod

echo "✅ Backend deployed to Vercel!"
echo "📝 Don't forget to update VITE_API_URL in frontend/.env.electron with your Vercel URL"
