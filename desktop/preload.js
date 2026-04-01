/* ───────── PianoSpark Desktop – preload.js ───────── */
/* Secure context bridge: exposes only specific desktop APIs to renderer */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sparkDesktop', {
  saveJson: (payload) => ipcRenderer.invoke('save-json', payload),
  openJson: () => ipcRenderer.invoke('open-json'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
});
