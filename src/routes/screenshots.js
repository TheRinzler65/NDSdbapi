const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { findSerialPath } = require("../utils/pathFinder");
const { getBaseUrl } = require("../utils/urlUtils");
const { NotFoundError, ServerError } = require("../utils/errors");

const router = express.Router();

router.get("/:serial/screen/:num", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }
    res.sendFile(
      path.join(serialPath, "screenshots", `screenshot_${req.params.num}.jpg`)
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve screenshot"));
    }
  }
});

router.get("/:serial/screen_u/:num/:screen", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }
    const screen = req.params.screen === "u" ? "upper" : "lower";
    res.sendFile(
      path.join(
        serialPath,
        "screenshots_uncompiled",
        `screenshot_${req.params.num}_${screen}.jpg`
      )
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve uncompiled screenshot"));
    }
  }
});

router.get("/:serial/screens", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }

    const screensPath = path.join(serialPath, "screenshots");
    const files = await fs.readdir(screensPath);
    const screenshots = files
      .filter((file) => file.startsWith("screenshot_"))
      .sort()
      .map(
        (file) =>
          `${getBaseUrl(req)}/api/v1/screenshots/${req.params.serial}/screen/${
            file.match(/\d+/)[0]
          }`
      );

    res.json({
      count: screenshots.length,
      screenshots,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve screenshots list"));
    }
  }
});

router.get("/:serial/screen_u", async (req, res) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      return res.status(404).json({ error: "Serial not found" });
    }

    const uncompiledPath = path.join(serialPath, "screenshots_uncompiled");
    const files = await fs.readdir(uncompiledPath);

    const screenshots = {
      upper: [],
      lower: [],
    };

    files.forEach((file) => {
      const match = file.match(/screenshot_(\d+)_(upper|lower)\.jpg/);
      if (match) {
        const [, num, screen] = match;
        const type = screen === "upper" ? "upper" : "lower";
        const baseUrl = getBaseUrl(req);
        screenshots[type].push({
          number: parseInt(num),
          url: `${baseUrl}/api/v1/screenshots/${req.params.serial}/screen_u/${num}/${type[0]}`,
        });
      }
    });

    screenshots.upper.sort((a, b) => a.number - b.number);
    screenshots.lower.sort((a, b) => a.number - b.number);

    res.json({
      count: {
        upper: screenshots.upper.length,
        lower: screenshots.lower.length,
        total: screenshots.upper.length + screenshots.lower.length,
      },
      screenshots,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
