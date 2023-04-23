const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  setWallpaper: () => ipcRenderer.send("set-wallpaper"),
});
