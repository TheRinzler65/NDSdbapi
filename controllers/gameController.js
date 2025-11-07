const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "nds_games.json");
let database = [];
try {
  database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  console.log(`Base de données chargée : ${database.length} jeux.`);
} catch (err) {
  console.error("Erreur: Impossible de lire le fichier nds_games.json.", err);
}

exports.getAllGames = (req, res) => {
  let results = [...database];
  const { region, publisher } = req.query;

  if (region) {
    results = results.filter(
      (g) => g.region.toLowerCase() === region.toLowerCase()
    );
  }

  if (publisher) {
    results = results.filter((g) =>
      g.publisher.toLowerCase().includes(publisher.toLowerCase())
    );
  }

  res.json(results);
};

exports.getGameById = (req, res) => {
  const id = req.params.id.toUpperCase();
  const game = database.find((g) => g.id === id || g.serial === id);

  if (game) {
    res.json(game);
  } else {
    res.status(404).json({ error: "Jeu non trouvé" });
  }
};

exports.searchGames = (req, res) => {
  const query = (req.query.title || "").toLowerCase();

  if (!query) {
    return res
      .status(400)
      .json({ error: 'Le paramètre de requête "title" est manquant' });
  }

  const results = database.filter((g) => g.title.toLowerCase().includes(query));

  res.json(results);
};
