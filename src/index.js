const axios = require("axios");
const fileSystem = require("fs");
const cron = require("node-cron");
const path = require("path");
const { app } = require("electron");

let getWallpaper, setWallpaper;

(async () => {
  const wallpaperModule = await import("wallpaper");
  getWallpaper = wallpaperModule.getWallpaper;
  setWallpaper = wallpaperModule.setWallpaper;
})();

async function downloadAndSetWallpaper(url) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const imagePath = path.join(app.getPath("userData"), "wallpaper.jpg");
    const writer = response.data.pipe(fileSystem.createWriteStream(imagePath));

    writer.on("finish", async () => {
      await setWallpaper(imagePath);
      console.log("Wallpaper set successfully");
    });

    writer.on("error", (error) => {
      console.error("Error downloading and setting wallpaper:", error);
    });
  } catch (error) {
    console.error("Error downloading and setting wallpaper:", error);
  }
}

module.exports = { downloadAndSetWallpaper };
