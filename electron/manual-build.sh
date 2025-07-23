#!/bin/bash
# Simple manual Electron build script

echo "Building Website Analyzer Desktop Application..."

# Create output directory
mkdir -p "manual-build"
cd "manual-build"

# Download Electron prebuilt binary
echo "Downloading Electron..."
if [ ! -f "electron.zip" ]; then
    curl -L -o electron.zip https://github.com/electron/electron/releases/download/v25.9.8/electron-v25.9.8-win32-x64.zip
fi

# Extract Electron
echo "Extracting Electron..."
unzip -q electron.zip -d electron-app
rm electron.zip

# Copy our application files
echo "Copying application files..."
cp -r ../build ./electron-app/resources/app/build
cp ../main.js ./electron-app/resources/app/
cp ../preload.js ./electron-app/resources/app/
cp ../setup_backend.js ./electron-app/resources/app/
cp ../package.json ./electron-app/resources/app/

# Copy backend files
echo "Copying backend files..."
mkdir -p ./electron-app/resources/backend
cp -r ../../backend/* ./electron-app/resources/backend/
rm -rf ./electron-app/resources/backend/scrap
rm -rf ./electron-app/resources/backend/__pycache__

# Rename executable
mv ./electron-app/electron.exe "./electron-app/Website Analyzer.exe"

echo "Build complete! Executable is at: manual-build/electron-app/Website Analyzer.exe"
