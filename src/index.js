const axios = require("axios");
const fs = require("fs");
const { app } = require("electron");
const path = require("path");

let getWallpaper, setWallpaper;

(async () => {
  const wallpaperModule = await import("wallpaper");
  getWallpaper = wallpaperModule.getWallpaper;
  setWallpaper = wallpaperModule.setWallpaper;
})();

async function downloadImage(imageUrl) {
  const response = await axios({
    url: imageUrl,
    method: "GET",
    responseType: "stream",
  });

  return response.data;
}

function saveImageToDisk(imageStream) {
  const imagePath = path.join(app.getPath("userData"), "wallpaper.jpg");
  const writer = imageStream.pipe(fs.createWriteStream(imagePath));

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function downloadAndSetWallpaper({ hdurl, url }) {
  try {
    let imageStream = await downloadImage(hdurl).catch(async () => {
      console.error("Error downloading hdurl wallpaper, trying url.");
      return await downloadImage(url);
    });

    await saveImageToDisk(imageStream);
    await setWallpaper(path.join(app.getPath("userData"), "wallpaper.jpg"));
    console.log("Wallpaper set successfully");
  } catch (error) {
    console.error("Error downloading and setting wallpaper:", error);
  }
}

module.exports = { downloadAndSetWallpaper };
