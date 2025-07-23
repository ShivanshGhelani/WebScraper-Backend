const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function setupBackend() {
  return new Promise((resolve, reject) => {
    const backendDir = path.join(process.resourcesPath, 'backend');
    const requirementsPath = path.join(backendDir, 'requirements.txt');
    
    // Check if requirements.txt exists
    if (!fs.existsSync(requirementsPath)) {
      console.log('Requirements file not found, skipping setup');
      resolve();
      return;
    }

    console.log('Installing Python dependencies...');
    
    // Install requirements using pip
    const installProcess = spawn('pip', ['install', '-r', requirementsPath], {
      cwd: backendDir,
      stdio: 'pipe'
    });

    installProcess.stdout.on('data', (data) => {
      console.log('Pip install:', data.toString());
    });

    installProcess.stderr.on('data', (data) => {
      console.error('Pip error:', data.toString());
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Backend dependencies installed successfully');
        resolve();
      } else {
        console.error('Failed to install dependencies');
        reject(new Error(`pip install failed with code ${code}`));
      }
    });

    installProcess.on('error', (err) => {
      console.error('Failed to run pip:', err);
      // Don't reject, continue anyway in case dependencies are already installed
      resolve();
    });
  });
}

module.exports = { setupBackend };
