const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { spawn } = require('child_process');
const { setupBackend } = require('./setup_backend');
let pythonProcess = null;
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready
    icon: path.join(__dirname, 'assets', 'icon.png') // Add app icon
  });

  // Check if we're in development and servers might already be running
  if (isDev) {
    // Try to connect to existing servers first
    checkExistingServers();
  } else {
    // In production, start the backend
    startBackendServer();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkExistingServers() {
  // Check if React dev server is already running
  fetch('http://localhost:5173')
    .then(() => {
      console.log('React dev server already running, loading app...');
      mainWindow.loadURL('http://localhost:5173');
      // Open the DevTools in development
      mainWindow.webContents.openDevTools();
    })
    .catch(() => {
      console.log('React dev server not running, starting backend and waiting...');
      // Start backend and wait for frontend
      startBackendServer();
      // Load the app after servers start
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.loadURL('http://localhost:5173').catch(err => {
            console.error('Failed to load React dev server:', err);
            mainWindow.loadURL('data:text/html,<html><body><h2>Starting Website Analyzer...</h2><p>React dev server is starting at http://localhost:5173</p><p>Backend is starting at http://localhost:8000</p><p>Please wait...</p></body></html>');
          });
        }
      }, 5000);
      mainWindow.webContents.openDevTools();
    });
}

function startBackendServer() {
  // Check if backend is already running
  fetch('http://localhost:8000')
    .then(() => {
      console.log('Backend already running at http://localhost:8000');
      return;
    })
    .catch(async () => {
      console.log('Starting new backend server...');
      
      const backendDir = isDev 
        ? path.join(__dirname, '..', 'backend')
        : path.join(process.resourcesPath, 'backend');

      console.log('Starting Python backend from:', backendDir);

      // Setup backend dependencies if in production
      if (!isDev) {
        try {
          await setupBackend();
        } catch (err) {
          console.warn('Backend setup failed, continuing anyway:', err);
        }
      }

      // Use spawn to run uvicorn directly
      pythonProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: backendDir,
        stdio: 'pipe'
      });

      pythonProcess.stdout.on('data', (data) => {
        const message = data.toString();
        console.log('Python Backend:', message);
        
        // Check if server is ready
        if (message.includes('Uvicorn running on') || message.includes('Application startup complete')) {
          console.log('Backend server is ready!');
          loadFrontend();
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const message = data.toString();
        console.log('Python Backend Info:', message);
        
        // Uvicorn sends INFO messages to stderr, so check there too
        if (message.includes('Uvicorn running on') || message.includes('Application startup complete')) {
          console.log('Backend server is ready!');
          loadFrontend();
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python backend:', error);
        // Load frontend anyway in case Python is not available
        setTimeout(() => loadFrontend(), 2000);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python backend process exited with code ${code}`);
      });

      // Fallback: Load frontend after 5 seconds if backend doesn't signal ready
      setTimeout(() => {
        if (mainWindow && !mainWindow.webContents.getURL().includes('file://')) {
          console.log('Fallback: Loading frontend after timeout');
          loadFrontend();
        }
      }, 5000);
    });
}

function loadFrontend() {
  if (!mainWindow) return;
  
  if (isDev) {
    // In development, try React dev server first
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load React dev server, loading production build instead...');
      // Fallback to production build
      const indexPath = path.join(__dirname, 'build', 'client', 'index.html');
      mainWindow.loadFile(indexPath);
    });
  } else {
    // In production, load the built frontend
    const indexPath = path.join(__dirname, 'build', 'client', 'index.html');
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle backend communication
ipcMain.handle('analyze-website', async (event, data) => {
  try {
    const response = await fetch(`http://localhost:8000/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw error;
  }
});

ipcMain.handle('analyze-single-page', async (event, data) => {
  try {
    const response = await fetch(`http://localhost:8000/api/v1/analyze-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing single page:', error);
    throw error;
  }
});
