const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { findSerialPath, getMediaUrls } = require("../utils/pathFinder"); // Changé
const { NotFoundError } = require("../utils/errors");
const { getBaseUrl } = require("../utils/urlUtils");

const router = express.Router();

router.get("/:serial", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }

    const metaPath = path.join(serialPath, "meta.json");
    const metaData = JSON.parse(await fs.readFile(metaPath, "utf-8"));

    const mediaUrls = await getMediaUrls(
      serialPath,
      req.params.serial,
      getBaseUrl(req)
    );
    const response = {
      ...metaData,
      media: mediaUrls,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:serial/meta/:meta", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }

    const metaPath = path.join(serialPath, "meta.json");
    const metaData = JSON.parse(await fs.readFile(metaPath, "utf-8"));

    const metaValue = metaData[req.params.meta];
    if (metaValue === undefined) {
      throw new NotFoundError("METADATA", {
        serial: req.params.serial,
        field: req.params.meta,
        availableFields: Object.keys(metaData),
      });
    }

    res.json(metaValue);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
