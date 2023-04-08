const { ipcRenderer } = require("electron");

document.getElementById("set-wallpaper").addEventListener("click", async () => {
  const apiKey = document.getElementById("api-key-input").value.trim();
  ipcRenderer.send("set-wallpaper", apiKey);
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

// Request the current API key from the main process
ipcRenderer.send("get-api-key");

// Handle the API key received from the main process
ipcRenderer.on("api-key", (event, apiKey) => {
  if (apiKey) {
    console.log("API key found:", apiKey);
    // Run the main function with the available API key
    document.getElementById("api-key-form").style.display = "none";
    // Call the main function here
  } else {
    console.log("API key not found");
    // Show the input form to the user
    document.getElementById("api-key-form").style.display = "block";
  }
});
