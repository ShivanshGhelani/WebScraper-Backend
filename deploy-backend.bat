@echo off
echo 🚀 GitHub → Vercel Automatic Deployment Setup

echo.
echo ═══════════════════════════════════════════════════════════════
echo   OPTION 1: Web Dashboard Setup (Recommended)
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Go to https://vercel.com
echo 2. Login with GitHub
echo 3. Click "Add New..." → "Project"
echo 4. Import: ShivanshGhelani/WebScraper-Backend
echo 5. Configure:
echo    - Project Name: webscraper-backend
echo    - Root Directory: backend
echo    - Framework: Other
echo.
echo After setup, every git push will auto-deploy! 🎉
echo.
echo ═══════════════════════════════════════════════════════════════
echo   OPTION 2: CLI Setup
echo ═══════════════════════════════════════════════════════════════
echo.
set /p choice="Do you want to try CLI setup? (y/N): "
if /i "%choice%"=="y" (
    cd backend
    vercel
    echo.
    echo ✅ Setup complete! Now deploying...
    vercel --prod
) else (
    echo 💡 Use the web dashboard method above for easier setup
)

echo.
echo 📝 Don't forget to update frontend/.env.electron with your Vercel URL!
