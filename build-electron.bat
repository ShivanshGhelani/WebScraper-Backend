@echo off
echo 📦 Building Electron App...

rem Install dependencies if needed
if not exist "electron\node_modules" (
    echo Installing Electron dependencies...
    cd electron
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing Frontend dependencies...
    cd frontend
    npm install
    cd ..
)

rem Build frontend for production
echo Building frontend...
cd frontend
copy .env.electron .env.local
npm run build
cd ..

rem Build Electron app
echo Building Electron app...
cd electron
npm run dist

echo ✅ Electron app built successfully!
echo 📁 Find your app in electron/dist/
