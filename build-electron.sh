#!/bin/bash

echo "📦 Building Electron App..."

# Install dependencies if needed
if [ ! -d "electron/node_modules" ]; then
    echo "Installing Electron dependencies..."
    cd electron
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Build frontend for production
echo "Building frontend..."
cd frontend
cp .env.electron .env.local
npm run build
cd ..

# Build Electron app
echo "Building Electron app..."
cd electron
npm run dist

echo "✅ Electron app built successfully!"
echo "📁 Find your app in electron/dist/"
