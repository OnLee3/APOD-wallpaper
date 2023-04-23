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

function setWallpaper() {
  ipcRenderer.once("download-and-set-wallpaper-finished", () => {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "none";
  });
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
  document.getElementById("api-key-form-container").style.display = show
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
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "flex";
    setWallpaper();
    showApiKeyForm(false);
  } else {
    console.log("API key not found");
    showApiKeyForm(true);
  }
});

ipcRenderer.on("submit-api-key", (event, apiKey) => {
  console.log("Received API key:", apiKey);
  if (apiKey) {
    showApiKeyForm(false);
  } else {
    showApiKeyForm(true);
  }
});

function createStars(numStars) {
  const starsContainer = document.createElement("div");
  starsContainer.className = "stars-container";

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    const randomValue = Math.random();
    let starType;

    if (randomValue < 0.48) {
      starType = 0;
    } else if (randomValue < 0.96) {
      starType = 1;
    } else {
      starType = 2;
    }

    switch (starType) {
      case 0:
        star.className = "star";
        break;
      case 1:
        star.className = "star-back";
        break;
      case 2:
        star.className = "supernova";
        break;
    }

    star.style.top = `${Math.random() * 100}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    const animationDuration = 50 + Math.random() * (starType === 1 ? 50 : 100);
    star.style.animationDuration = `${animationDuration}s`;
    star.style.animationDelay = `${-Math.random() * animationDuration}s`;
    starsContainer.appendChild(star);
  }

  document.body.appendChild(starsContainer);
}

createStars(100);

document
  .getElementById("set-wallpaper")
  .addEventListener("click", handleSetWallpaperClick);
document
  .getElementById("api-key-form")
  .addEventListener("submit", handleApiKeyFormSubmit);
