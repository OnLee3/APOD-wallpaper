const axios = require("axios");

const APOD_API_URL = "https://api.nasa.gov/planetary/apod";

async function fetchApodImageData(apiKey, errorHandler) {
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
    console.log(errorHandler);
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error("Error fetching APOD image:", error);
      throw error;
    }
  }
}

module.exports = {
  fetchApodImageData,
};
