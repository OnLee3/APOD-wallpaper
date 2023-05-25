const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const cron = require("node-cron");
const { readConfig, writeConfig } = require("./config");
const { downloadAndSetWallpaper } = require("./index");
const { fetchApodImageData } = require("./apod");
// require("electron-debug")({ showDevTools: true });

let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.on("closed", () => (mainWindow = null));
}

function getTimeUntilNextUpdate() {
  const newYorkTimeZone = "America/New_York";
  const now = new Date();
  const newYorkNow = new Date(
    now.toLocaleString("en-US", { timeZone: newYorkTimeZone })
  );

  const nextUpdate = new Date(newYorkNow);
  nextUpdate.setHours(1, 0, 0);

  if (newYorkNow.getHours() >= 1) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }

  const timeDifference = nextUpdate - newYorkNow;
  const hours = Math.floor(timeDifference / 1000 / 60 / 60);
  const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
  const seconds = Math.floor((timeDifference / 1000) % 60);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function createTrayIcon() {
  tray = new Tray(path.join(__dirname, "../public/donut_16x16.png"));
  updateTrayIconContextMenu();
  tray.setToolTip("APOD Wallpaper");
}

function updateTrayIconContextMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Next Update: ${getTimeUntilNextUpdate()}`,
      enabled: false,
    },
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

  tray.setContextMenu(contextMenu);
  setTimeout(updateTrayIconContextMenu, 1000);
}

function handleIpcEvents() {
  ipcMain.on("reset-api-key", resetApiKey);
  ipcMain.on("submit-api-key", submitApiKey);
  ipcMain.on("get-api-key", getApiKey);
  ipcMain.on("set-wallpaper", setWallpaper);
  ipcMain.on("download-and-set-wallpaper", downloadAndSetWallpaperHandler);
}

function resetApiKey(event) {
  const config = readConfig();
  config.apiKey = null;
  writeConfig(config);
  event.sender.send("api-key", null);
}

function submitApiKey(event, apiKey) {
  const config = readConfig();
  config.apiKey = apiKey;
  writeConfig(config);
  event.sender.send("submit-api-key", apiKey);
}

function getApiKey(event) {
  const config = readConfig();
  event.sender.send("api-key", config.apiKey);
}

function setWallpaper(event, apiKey) {
  event.sender.send("set-wallpaper", apiKey);
}

async function downloadAndSetWallpaperHandler(event, { hdurl, url }) {
  await downloadAndSetWallpaper({ hdurl, url });
  event.sender.send("download-and-set-wallpaper-finished");
}

function scheduleWallpaperUpdate() {
  cron.schedule(
    "1 0 * * *",
    async () => {
      const config = readConfig();
      const apiKey = config.apiKey;

      if (!apiKey) {
        console.log("No API key found. Skipping wallpaper update.");
        return;
      }
      const { hdurl, url } = await fetchApodImageData(apiKey);
      await downloadAndSetWallpaper({ hdurl, url });
    },
    {
      scheduled: true,
      timezone: "America/New_York",
    }
  );

  console.log("Scheduled wallpaper update task.");
}

app.whenReady().then(() => {
  createWindow();
  createTrayIcon();
  handleIpcEvents();
  scheduleWallpaperUpdate();

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
