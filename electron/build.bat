@echo off
echo Building Website Analyzer Desktop App...

REM Build the frontend
echo Building frontend...
cd ..\frontend
call npm run build

REM Copy frontend build to electron directory
echo Copying frontend build...
xcopy /s /e /y dist ..\electron\build\

REM Install electron dependencies
echo Installing electron dependencies...
cd ..\electron
call npm install

echo.
echo Build complete! You can now run:
echo   npm start     - Run in development mode
echo   npm run build - Build distributable packages
pause
