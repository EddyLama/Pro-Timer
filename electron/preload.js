const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Timer controls
  onToggleTimer: (callback) => ipcRenderer.on('toggle-timer', callback),
  onStopTimer: (callback) => ipcRenderer.on('stop-timer', callback),
  onResetTimer: (callback) => ipcRenderer.on('reset-timer', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});