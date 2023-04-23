const { ipcRenderer } = require("electron");
const { fetchApodImageData } = require("./apod");

function handleErrorWhileFetchingApodImage(error) {
  hideLoadingSpinner();
  if (error.code === "ERR_BAD_REQUEST") {
    showErrorMessage(
      "Invalid API key. Please check your API key and try again."
    );
    ipcRenderer.send("reset-api-key");
  } else {
    showErrorMessage("Error fetching APOD image: " + error.message);
  }
}

function requestApiKeyAndSetWallpaper() {
  ipcRenderer.send("get-api-key");
}

function showLoadingSpinner() {
  const loadingSpinner = document.getElementById("loading-spinner");
  loadingSpinner.style.display = "flex";
  ipcRenderer.once("download-and-set-wallpaper-finished", (event) => {
    hideLoadingSpinner();
    showSuccessIcon();
  });
}

function hideLoadingSpinner() {
  const loadingSpinner = document.getElementById("loading-spinner");
  loadingSpinner.style.display = "none";
}

function onSubmitApiKeyForm(event) {
  event.preventDefault();
  const apiKey = document.getElementById("api-key-input").value.trim();
  if (apiKey.length === 0) {
    showErrorMessage(
      "Please enter your API key. If you don't have an API key, you can get it from https://api.nasa.gov/"
    );
  } else {
    ipcRenderer.send("submit-api-key", apiKey);
  }
}

function toggleApiKeyFormVisibility(show) {
  document.getElementById("set-wallpaper-container").style.display = show
    ? "none"
    : "flex";
  document.getElementById("api-key-form-container").style.display = show
    ? "block"
    : "none";
  !show && hideMessage();
}

function hideMessage() {
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  successMessage.style.display = "none";
  errorMessage.style.display = "none";
}

function showSuccessIcon() {
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  successMessage.style.display = "block";
  errorMessage.style.display = "none";
}

function showErrorMessage(errorText) {
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  const errorTextElement = document.getElementById("error-text");
  successMessage.style.display = "none";
  errorMessage.style.display = "block";
  errorTextElement.innerText = errorText;
}

function createStarsBackground(numStars) {
  const starsContainer = document.createElement("div");
  starsContainer.className = "stars-container";

  for (let i = 0; i < numStars; i++) {
    const star = createStarElement();
    starsContainer.appendChild(star);
  }

  document.body.appendChild(starsContainer);
}

function createStarElement() {
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

  star.className = getStarClassNameBasedOnType(starType);
  star.style.top = `${Math.random() * 100}vh`;
  star.style.left = `${Math.random() * 100}vw`;
  const animationDuration = 50 + Math.random() * (starType === 1 ? 50 : 100);
  star.style.animationDuration = `${animationDuration}s`;
  star.style.animationDelay = `${-Math.random() * animationDuration}s`;

  return star;
}

function getStarClassNameBasedOnType(starType) {
  switch (starType) {
    case 0:
      return "star";
    case 1:
      return "star-back";
    case 2:
      return "supernova";
  }
}

createStarsBackground(100);

document
  .getElementById("set-wallpaper")
  .addEventListener("click", requestApiKeyAndSetWallpaper);
document
  .getElementById("api-key-form")
  .addEventListener("submit", onSubmitApiKeyForm);

ipcRenderer.on("set-wallpaper", async (event, apiKey) => {
  console.log("Setting APOD wallpaper...");
  const { hdurl, url } = await fetchApodImageData(
    apiKey,
    handleErrorWhileFetchingApodImage
  );

  if (hdurl || url) {
    ipcRenderer.send("download-and-set-wallpaper", { hdurl, url });
  }
});

ipcRenderer.on("api-key", (event, apiKey) => {
  if (apiKey) {
    console.log("API key found:", apiKey);
    ipcRenderer.send("set-wallpaper", apiKey);
    showLoadingSpinner();
    toggleApiKeyFormVisibility(false);
  } else {
    console.log("API key not found");
    toggleApiKeyFormVisibility(true);
  }
});

ipcRenderer.on("submit-api-key", (event, apiKey) => {
  console.log("Received API key:", apiKey);
  if (apiKey) {
    toggleApiKeyFormVisibility(false);
  } else {
    toggleApiKeyFormVisibility(true);
  }
});
