const path = require("path");
const fs = require("fs").promises;

const DB_BASE_DIR = path.join(__dirname, "../../public/db/nds");

async function getMediaUrls(serialPath, serial, baseUrl) {
  const media = {
    banner: `${baseUrl}/api/v1/images/${serial}/banner`,
    icon: `${baseUrl}/api/v1/images/${serial}/icon`,
    screenshots: {
      compiled: [],
      uncompiled: {
        upper: [],
        lower: [],
      },
    },
    thumbnails: [],
  };

  try {
    const screensPath = path.join(serialPath, "screenshots");
    const screenFiles = await fs.readdir(screensPath);
    media.screenshots.compiled = screenFiles
      .filter((file) => file.startsWith("screenshot_"))
      .sort()
      .map(
        (file) =>
          `${baseUrl}/api/v1/screenshots/${serial}/screen/${
            file.match(/\d+/)[0]
          }`
      );
  } catch (error) {
  }

  try {
    const uncompiledPath = path.join(serialPath, "screenshots_uncompiled");
    const uncompiledFiles = await fs.readdir(uncompiledPath);

    uncompiledFiles.forEach((file) => {
      const match = file.match(/screenshot_(\d+)_(upper|lower)\.jpg/);
      if (match) {
        const [, num, screen] = match;
        const type = screen === "upper" ? "upper" : "lower";
        media.screenshots.uncompiled[type].push(
          `${baseUrl}/api/v1/screenshots/${serial}/screen_u/${num}/${type[0]}`
        );
      }
    });

    media.screenshots.uncompiled.upper.sort();
    media.screenshots.uncompiled.lower.sort();
  } catch (error) {
  }

  try {
    const thumbsPath = path.join(serialPath, "thumbnails");
    const thumbFiles = await fs.readdir(thumbsPath);
    media.thumbnails = thumbFiles
      .filter((file) => file.startsWith("thumbnail_"))
      .sort()
      .map(
        (file) =>
          `${baseUrl}/api/v1/thumbnails/${serial}/thumb/${file.match(/\d+/)[0]}`
      );
  } catch (error) {
  }

  return media;
}

async function getCategories() {
  return Promise.resolve(["base"]);
}

async function findSerialPath(serial) {
  const serialUpper = serial.toUpperCase();
  const category = "base";
  const serialPath = path.join(DB_BASE_DIR, category, serialUpper);
  try {
    await fs.access(serialPath);
    return serialPath;
  } catch (error) {
    return null;
  }
}

module.exports = {
  findSerialPath,
  DB_BASE_DIR,
  getCategories,
  getMediaUrls,
};
