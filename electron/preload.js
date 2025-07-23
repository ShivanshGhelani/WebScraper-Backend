const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    analyzeWebsite: (data) => ipcRenderer.invoke('analyze-website', data),
    analyzeSinglePage: (data) => ipcRenderer.invoke('analyze-single-page', data)
  }
);
