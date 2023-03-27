import axios from 'axios';
import fs from 'fs/promises';
import { setWallpaper } from 'wallpaper';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();
const APOD_API_KEY = process.env.APOD_API_KEY;
const APOD_API_URL = 'https://api.nasa.gov/planetary/apod';

async function fetchApodImage() {
  try {
    const response = await axios.get(APOD_API_URL, {
      params: {
        api_key: APOD_API_KEY,
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

cron.schedule('0 12 * * *', async () => {
    console.log('Fetching and setting APOD wallpaper...');
    await fetchAndSetWallpaper();
    console.log('Done.');
});

fetchAndSetWallpaper();
