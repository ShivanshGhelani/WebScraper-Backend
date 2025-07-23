#!/bin/bash

echo "Building Website Analyzer Desktop App..."

# Build the frontend
echo "Building frontend..."
cd ../frontend
npm run build

# Copy frontend build to electron directory
echo "Copying frontend build..."
cp -r dist ../electron/build

# Install electron dependencies
echo "Installing electron dependencies..."
cd ../electron
npm install

echo "Build complete! You can now run:"
echo "  npm start     - Run in development mode"
echo "  npm run build - Build distributable packages"
