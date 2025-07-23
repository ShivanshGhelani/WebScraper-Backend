# Website Analyzer - Vercel + Electron Deployment

This guide explains how to deploy the backend to Vercel and run the frontend in Electron.

## Architecture Overview

- **Backend**: FastAPI application deployed to Vercel as serverless functions
- **Frontend**: React Router application bundled into an Electron desktop app
- **Communication**: Electron app communicates with Vercel-hosted API

## Prerequisites

1. **Vercel CLI**: Install globally with `npm install -g vercel`
2. **Node.js**: Version 18 or higher
3. **Python**: Version 3.9 or higher (for local backend development)

## Deployment Steps

### 1. Deploy Backend to Vercel

```bash
# Navigate to backend directory
cd backend

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

Or use the deployment script:
```bash
# Linux/macOS
./deploy-backend.sh

# Windows
deploy-backend.bat
```

### 2. Update Frontend Configuration

1. Copy your Vercel deployment URL
2. Update `frontend/.env.electron` with your Vercel URL:
   ```
   VITE_API_URL=https://your-app-name.vercel.app
   ```

### 3. Build Electron Application

```bash
# Install dependencies
cd electron
npm install

cd ../frontend
npm install

# Build and package Electron app
cd ../
./build-electron.sh  # Linux/macOS
build-electron.bat   # Windows
```

## Development Workflow

### Local Development
```bash
# Terminal 1: Start frontend dev server
cd frontend
npm run dev

# Terminal 2: Start Electron in dev mode
cd electron
npm run dev
```

### Testing with Vercel Backend
1. Deploy backend to Vercel
2. Update `frontend/.env.development` with Vercel URL
3. Run frontend dev server
4. Test Electron app with production backend

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app (modified for Vercel)
│   ├── vercel.json          # Vercel configuration
│   ├── .vercelignore        # Files to exclude from deployment
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── .env.electron        # Environment for Electron builds
│   ├── .env.development     # Environment for local development
│   └── app/services/config.ts # API configuration (auto-detects Electron)
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Electron preload script
│   ├── package.json         # Electron dependencies and build config
│   └── assets/              # App icons and resources
└── deployment scripts       # Automated deployment helpers
```

## Environment Variables

### Backend (Vercel)
- Automatically inherits Python runtime
- CORS configured for all origins
- Serverless function timeout: 300 seconds

### Frontend (Electron)
- `VITE_API_URL`: Points to Vercel deployment in production
- `VITE_APP_MODE`: Indicates app mode (electron/development)

## Key Features

### Backend Modifications
- ✅ FastAPI app instance created at module level for Vercel
- ✅ CORS middleware configured for cross-origin requests
- ✅ Serverless-friendly architecture
- ✅ Command-line interface preserved for local testing

### Electron Integration
- ✅ Secure context isolation and preload scripts
- ✅ Automatic external link handling
- ✅ Native menu integration
- ✅ Development/production URL switching
- ✅ Auto-detection of Electron environment

### Frontend Configuration
- ✅ Environment-based API URL configuration
- ✅ Electron detection for API routing
- ✅ Build optimization for both web and desktop

## Troubleshooting

### Backend Issues
- **Import errors**: Check Python version and dependencies
- **Timeout errors**: Increase timeout in `vercel.json` (max 300s for hobby plan)
- **CORS errors**: Verify CORS middleware configuration

### Electron Issues
- **White screen**: Check if frontend build exists in `frontend/build/`
- **API connection**: Verify VITE_API_URL in environment files
- **Build failures**: Ensure all dependencies are installed

### Frontend Issues
- **Environment detection**: Check browser console for Electron detection
- **API calls**: Monitor network tab for correct API URL usage

## Production Checklist

- [ ] Backend deployed to Vercel successfully
- [ ] Frontend .env.electron updated with Vercel URL
- [ ] Electron app builds without errors
- [ ] API calls work from Electron app
- [ ] App icon and metadata configured
- [ ] Code signing certificates configured (for distribution)

## Distribution

After building, your Electron app will be in `electron/dist/`:
- Windows: `.exe` installer
- macOS: `.dmg` disk image
- Linux: `.AppImage` file

For code signing and auto-updates, consider:
- [electron-builder](https://www.electron.build/) for advanced builds
- [electron-updater](https://www.electron.build/auto-update) for automatic updates
- Platform-specific code signing certificates
