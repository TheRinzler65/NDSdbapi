const express = require("express");
const path = require("path");
// MISE À JOUR : Importe findSerialPath
const { findSerialPath } = require("../utils/pathFinder");
const { NotFoundError, ServerError } = require("../utils/errors");

const router = express.Router();

router.get("/:serial/banner", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }
    res.sendFile(path.join(serialPath, "banner.jpg"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve banner"));
    }
  }
});

router.get("/:serial/icon", async (req, res, next) => {
  try {
    const serialPath = await findSerialPath(req.params.serial);
    if (!serialPath) {
      throw new NotFoundError("SERIAL", { serial: req.params.serial });
    }
    res.sendFile(path.join(serialPath, "icon.jpg"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ServerError("Failed to retrieve icon"));
    }
  }
});

module.exports = router;
