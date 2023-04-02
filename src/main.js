const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fetchAndSetWallpaper } = require('./index.js');

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('set-wallpaper', async () => {
  await fetchAndSetWallpaper();
});
