const { ipcRenderer } = require("electron");
const axios = require("axios");

const APOD_API_URL = "https://api.nasa.gov/planetary/apod";

async function fetchApodImage(apiKey) {
  try {
    const response = await axios.get(APOD_API_URL, {
      params: {
        api_key: apiKey,
      },
    });

    const { hdurl, media_type, url } = response.data;

    if (media_type !== "image") {
      console.log("The APOD for today is not an image. Try again tomorrow.");
      return;
    }

    return { hdurl, url };
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  if (error.code === "ERR_BAD_REQUEST") {
    console.error("Invalid API key. Please check your API key and try again.");
    ipcRenderer.send("reset-api-key");
  } else {
    console.error("Error fetching APOD image:", error);
  }
}

function handleSetWallpaperClick() {
  ipcRenderer.send("get-api-key");
}

function handleApiKeyFormSubmit(event) {
  event.preventDefault();
  const apiKey = document.getElementById("api-key-input").value.trim();
  if (apiKey.length === 0) {
    alert(
      "Please enter your API key. If you don't have an API key, you can get it from https://api.nasa.gov/"
    );
  } else {
    ipcRenderer.send("submit-api-key", apiKey);
  }
}

function showApiKeyForm(show) {
  document.getElementById("api-key-form").style.display = show
    ? "block"
    : "none";
}

ipcRenderer.on("set-wallpaper", async (event, apiKey) => {
  console.log("Setting APOD wallpaper...");
  const { hdurl, url } = await fetchApodImage(apiKey);

  if (hdurl || url) {
    ipcRenderer.send("download-and-set-wallpaper", { hdurl, url });
  }
});

ipcRenderer.on("api-key", (event, apiKey) => {
  if (apiKey) {
    console.log("API key found:", apiKey);
    ipcRenderer.send("set-wallpaper", apiKey);
    showApiKeyForm(false);
  } else {
    console.log("API key not found");
    showApiKeyForm(true);
  }
});

document
  .getElementById("set-wallpaper")
  .addEventListener("click", handleSetWallpaperClick);
document
  .getElementById("api-key-form")
  .addEventListener("submit", handleApiKeyFormSubmit);
