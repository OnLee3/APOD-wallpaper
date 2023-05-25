const axios = require("axios");
const fs = require("fs");
const { app } = require("electron");
const path = require("path");
const wallpaper = require("wallpaper");

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
      // log.error("Error downloading hdurl wallpaper, trying url.");
      return await downloadImage(url);
    });
    // log.info(imageStream);

    await saveImageToDisk(imageStream);
    await wallpaper.set(path.join(app.getPath("userData"), "wallpaper.jpg"));
    // log.info(path.join(app.getPath("userData"), "wallpaper.jpg"));
    // log.info("Wallpaper set successfully");
  } catch (error) {
    // log.error("Error downloading and setting wallpaper:", error);
  }
}

module.exports = { downloadAndSetWallpaper };
