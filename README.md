# APOD Wallpaper

This is a Node.js script that sets your desktop wallpaper to the Astronomy Picture of the Day (APOD) from NASA. The script fetches the APOD image daily at 12:00 PM and sets it as your desktop wallpaper.

## Prerequisites

-   [Node.js](https://nodejs.org/en/download/) installed on your system.
-   A NASA API key. You can get one from [https://api.nasa.gov/](https://api.nasa.gov/).

## Installation

1.  Clone the repository:
    
    bashCopy code
    
    `git clone https://github.com/OnLee3/APOD-wallpaper.git`
    
2.  Change to the `APOD-wallpaper` directory:
    
    bashCopy code
    
    `cd APOD-wallpaper`
    
3.  Install the required dependencies:
    
    Copy code
    
    `npm install`
    

## Usage

1.  Run the script:
    
    Copy code
    
    `node index.js`
    
2.  If it's your first time running the script, it will prompt you to enter your NASA API key. Enter the key, and it will be saved to a `.env` file for future use.
    
3.  The script will fetch the APOD image and set it as your desktop wallpaper. It will also schedule a task to update the wallpaper daily at 12:00 PM.
    

## Troubleshooting

If you encounter any issues or have any questions, please open an issue on the [GitHub repository](https://github.com/OnLee3/APOD-wallpaper/issues).