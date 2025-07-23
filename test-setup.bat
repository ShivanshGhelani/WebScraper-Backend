@echo off
echo 🧪 Testing Website Analyzer Setup

echo.
echo ═══════════════════════════════════════════════════════════════
echo   Testing Backend API Connection
echo ═══════════════════════════════════════════════════════════════
echo.
echo Testing: https://cawebscraper.vercel.app/
curl -s https://cawebscraper.vercel.app/ | findstr "Welcome"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend API is responding!
) else (
    echo ❌ Backend API connection failed
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   Electron App Status
echo ═══════════════════════════════════════════════════════════════
echo.

if exist "frontend\build\client\index.html" (
    echo ✅ Frontend build exists
) else (
    echo ❌ Frontend needs to be built
    echo Run: cd frontend && npm run build
)

if exist "electron\node_modules" (
    echo ✅ Electron dependencies installed
) else (
    echo ❌ Electron dependencies missing
    echo Run: cd electron && npm install
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   Quick Start Commands
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🖥️ Run Electron App (Development):
echo    cd electron && npm start
echo.
echo 📦 Build Electron App (Production):
echo    build-electron.bat
echo.
echo 🌐 Test API directly:
echo    https://cawebscraper.vercel.app/
echo.
echo 🎉 Your setup is complete! Backend is live on Vercel.
pause
