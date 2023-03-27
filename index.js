import axios from 'axios';
import fs from 'fs/promises';
import { setWallpaper } from 'wallpaper';
import dotenv from 'dotenv';
import cron from 'node-cron';
import inquirer from 'inquirer';

dotenv.config();
const APOD_API_URL = 'https://api.nasa.gov/planetary/apod';

async function fetchApodImage() {
  try {
    const response = await axios.get(APOD_API_URL, {
      params: {
        api_key: process.env.APOD_API_KEY,
      },
    });

    const { url, media_type } = response.data;

    if (media_type !== 'image') {
      console.log('The APOD for today is not an image. Try again tomorrow.');
      return;
    }

    return url;
  } catch (error) {
    console.error('Error fetching APOD image:', error);
  }
}

async function downloadAndSetWallpaper(imageUrl) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      const imagePath = 'apod.jpg';
  
      await fs.writeFile(imagePath, imageBuffer);
      await setWallpaper(imagePath);
      console.log('Wallpaper set successfully');
    } catch (error) {
      console.error('Error downloading and setting wallpaper:', error);
    }
  }  

async function fetchAndSetWallpaper() {
  const imageUrl = await fetchApodImage();

  if (imageUrl) {
    await downloadAndSetWallpaper(imageUrl);
  }
}

async function getApiKey() {
  try {
    const apiKey = await fs.readFile('.env', 'utf-8');
    if (apiKey.trim().length > 0) {
      console.log('API key found in .env file');
      return apiKey.trim();
    }
  } catch (error) {
    // ignore error if file does not exist
  }

  const questions = [
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your APOD API key:',
      validate: function (value) {
        if (value.trim().length === 0) {
          return 'Please enter your API key.';
        }
        return true;
      },
    },
  ];

  const answers = await inquirer.prompt(questions);
  const apiKey = answers.apiKey.trim();

  try {
    await fs.writeFile('.env', `APOD_API_KEY=${apiKey}\n`);
    console.log('API key saved to .env file');
  } catch (error) {
    console.error('Error saving API key to .env file:', error);
  }

  return apiKey;
}

async function main() {
  if (!process.env.APOD_API_KEY) {
    const apiKey = await getApiKey();
    process.env.APOD_API_KEY = apiKey;
  }

  cron.schedule('0 12 * * *', async () => {
    console.log('Fetching and setting APOD wallpaper...');
    await fetchAndSetWallpaper();
    console.log('Done.');
  });

  await fetchAndSetWallpaper();
}

main();
