const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { findSerialPath } = require("../utils/pathFinder");
const { getBaseUrl } = require("../utils/urlUtils");
const { NotFoundError, ServerError } = require("../utils/errors");

const router = express.Router();

router.get("/:serial/thumb/:num", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }
    res.sendFile(
      path.join(serialPath, "thumbnails", `thumbnail_${req.params.num}.jpg`)
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve thumbnail"));
    }
  }
});

router.get("/:serial/thumbs", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }

    const thumbsPath = path.join(serialPath, "thumbnails");
    const files = await fs.readdir(thumbsPath);
    const thumbnails = files
      .filter((file) => file.startsWith("thumbnail_"))
      .sort()
      .map(
        (file) =>
          `${getBaseUrl(req)}/api/v1/thumbnails/${req.params.serial}/thumb/${
            file.match(/\d+/)[0]
          }`
      );

    res.json({
      count: thumbnails.length,
      thumbnails,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve thumbnails list"));
    }
  }
});

module.exports = router;
