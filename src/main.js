const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const { readConfig, writeConfig } = require("./config");
const { downloadAndSetWallpaper } = require("./index");

let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTrayIcon() {
  tray = new Tray(path.join(__dirname, "../public/tray-icon.png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        if (!mainWindow) {
          createWindow();
        } else {
          mainWindow.show();
        }
      },
    },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("APOD Wallpaper");
  tray.setContextMenu(contextMenu);
}

function handleIpcEvents() {
  ipcMain.on("reset-api-key", resetApiKey);
  ipcMain.on("submit-api-key", submitApiKey);
  ipcMain.on("get-api-key", getApiKey);
  ipcMain.on("set-wallpaper", setWallpaper);
  ipcMain.on("download-and-set-wallpaper", downloadAndSetWallpaperHandler);
}

function resetApiKey(event) {
  console.log("Resetting API key...");
  const config = readConfig();
  config.apiKey = null;
  writeConfig(config);
  event.sender.send("api-key", null);
}

function submitApiKey(event, apiKey) {
  console.log("Received API key:", apiKey);
  const config = readConfig();
  config.apiKey = apiKey;
  writeConfig(config);
}

function getApiKey(event) {
  const config = readConfig();
  const apiKey = config.apiKey;
  event.sender.send("api-key", apiKey);
}

function setWallpaper(event, apiKey) {
  console.log("Setting APOD wallpaper...");
  event.sender.send("set-wallpaper", apiKey);
}

async function downloadAndSetWallpaperHandler(event, { hdurl, url }) {
  console.log("Downloading and setting wallpaper...");
  await downloadAndSetWallpaper({ hdurl, url });
  console.log("Done.");
}

app.whenReady().then(() => {
  createWindow();
  createTrayIcon();
  handleIpcEvents();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
