const { ipcRenderer } = require("electron");

document.getElementById("set-wallpaper").addEventListener("click", async () => {
  ipcRenderer.send("get-api-key");
});

document.getElementById("api-key-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const apiKey = document.getElementById("api-key-input").value.trim();
  if (apiKey.length === 0) {
    alert(
      "Please enter your API key. If you don't have an API key, you can get it from https://api.nasa.gov/"
    );
  } else {
    ipcRenderer.send("submit-api-key", apiKey);
  }
});

ipcRenderer.on("api-key", (event, apiKey) => {
  if (apiKey) {
    console.log("API key found:", apiKey);
    ipcRenderer.send("set-wallpaper", apiKey);
    document.getElementById("api-key-form").style.display = "none";
  } else {
    console.log("API key not found");
    document.getElementById("api-key-form").style.display = "block";
  }
});
