const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const CONFIG_FILE_NAME = "config.json";
const CONFIG_PATH = path.join(app.getPath("userData"), CONFIG_FILE_NAME);
console.log(CONFIG_PATH);

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const rawConfig = fs.readFileSync(CONFIG_PATH, "utf-8");
      const config = JSON.parse(rawConfig);
      return config;
    }
  } catch (error) {
    console.error("Error reading config file:", error);
  }

  return {};
}

function writeConfig(config) {
  try {
    const configJSON = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_PATH, configJSON);
  } catch (error) {
    console.error("Error writing config file:", error);
  }
}

module.exports = { readConfig, writeConfig };
