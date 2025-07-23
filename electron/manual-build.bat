@echo off
echo Building Website Analyzer Desktop Application...

REM Create output directory
if not exist "manual-build" mkdir "manual-build"
cd manual-build

REM Download Electron prebuilt binary
echo Downloading Electron...
if not exist "electron.zip" (
    echo This will require manual download of electron-v25.9.8-win32-x64.zip
    echo Please download from: https://github.com/electron/electron/releases/download/v25.9.8/electron-v25.9.8-win32-x64.zip
    echo And place it in the manual-build folder as electron.zip
    pause
)

REM Extract Electron
echo Extracting Electron...
powershell -command "Expand-Archive -Path 'electron.zip' -DestinationPath 'electron-app' -Force"

REM Copy our application files
echo Copying application files...
xcopy /s /e /y ..\build .\electron-app\resources\app\build\
copy ..\main.js .\electron-app\resources\app\
copy ..\preload.js .\electron-app\resources\app\
copy ..\setup_backend.js .\electron-app\resources\app\
copy ..\package.json .\electron-app\resources\app\

REM Copy backend files
echo Copying backend files...
if not exist ".\electron-app\resources\backend" mkdir ".\electron-app\resources\backend"
xcopy /s /e /y ..\..\backend\* .\electron-app\resources\backend\
rmdir /s /q ".\electron-app\resources\backend\scrap" 2>nul
rmdir /s /q ".\electron-app\resources\backend\__pycache__" 2>nul

REM Rename executable
ren ".\electron-app\electron.exe" "Website Analyzer.exe"

echo Build complete! Executable is at: manual-build\electron-app\Website Analyzer.exe
pause
