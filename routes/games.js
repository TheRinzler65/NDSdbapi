const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.get("/games", gameController.getAllGames);

router.get("/search", gameController.searchGames);

router.get("/games/:id", gameController.getGameById);

module.exports = router;
