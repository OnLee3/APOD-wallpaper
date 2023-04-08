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

const APOD_API_URL = "https://api.nasa.gov/planetary/apod";

async function fetchApodImage(apiKey) {
  try {
    const response = await axios.get(APOD_API_URL, {
      params: {
        api_key: apiKey,
      },
    });

    const { hdurl, media_type } = response.data;

    if (media_type !== "image") {
      console.log("The APOD for today is not an image. Try again tomorrow.");
      return;
    }

    return hdurl;
  } catch (error) {
    console.error("Error fetching APOD image:", error);
  }
}

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

async function fetchAndSetWallpaper(apiKey) {
  const imageUrl = await fetchApodImage(apiKey);

  if (imageUrl) {
    await downloadAndSetWallpaper(imageUrl);
  }
}

module.exports = { fetchAndSetWallpaper };
