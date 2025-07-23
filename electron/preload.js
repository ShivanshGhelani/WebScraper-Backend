const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu events
  onMenuNewAnalysis: (callback) => ipcRenderer.on('menu-new-analysis', callback),
  
  // System info
  platform: process.platform,
  
  // Versions
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  
  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Show native dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options)
});

// Optional: Expose a simple API for checking if we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);
