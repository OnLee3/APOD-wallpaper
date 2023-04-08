const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const { readConfig, writeConfig } = require("./config");
const { fetchAndSetWallpaper } = require("./index");

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

  // Set mainWindow to null when the window is closed
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

app.whenReady().then(() => {
  createWindow();
  createTrayIcon();

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

ipcMain.on("submit-api-key", (event, apiKey) => {
  console.log("Received API key:", apiKey);
  // Save the API key, run the main function, etc.
  const config = readConfig();
  config.apiKey = apiKey;
  writeConfig(config);
});

ipcMain.on("get-api-key", (event) => {
  const config = readConfig();
  const apiKey = config.apiKey;
  event.sender.send("api-key", apiKey);
});

ipcMain.on("set-wallpaper", async (event, apiKey) => {
  console.log("Setting APOD wallpaper...");
  await fetchAndSetWallpaper(apiKey);
  console.log("Done.");
});
