# Website Analyzer Desktop App

This is the Electron desktop version of the Website Analyzer application, which combines the FastAPI backend and React frontend into a single desktop application.

## Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies for the backend:**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

3. **Build the frontend (for production):**
   ```bash
   npm run build-frontend
   ```

## Running the App

### Development Mode
```bash
npm run dev
```
This will start both the backend and frontend servers, then launch the Electron app.

### Production Mode
```bash
npm start
```
This runs the app using the built frontend files.

## Building Distributables

To build distributable packages for your platform:
```bash
npm run build
```

This will create packages in the `dist/` directory.

## Project Structure

- `main.js` - Main Electron process
- `preload.js` - Preload script for secure IPC
- `package.json` - Electron app configuration
- `build/` - Built frontend files (created during build)
- `assets/` - App icons and resources

## Features

- ✅ Embedded FastAPI backend server
- ✅ React frontend integration
- ✅ Cross-platform compatibility (Windows, Mac, Linux)
- ✅ Secure IPC communication
- ✅ Auto-update ready (with electron-builder)

## Troubleshooting

1. **Python not found**: Make sure Python is installed and available in your PATH
2. **Backend not starting**: Check that all Python dependencies are installed
3. **Frontend not loading**: Ensure the frontend was built successfully

## Building for Distribution

The app is configured to build for multiple platforms:
- Windows: NSIS installer
- macOS: DMG file
- Linux: AppImage

Run `npm run build` to create distributables for your current platform.
