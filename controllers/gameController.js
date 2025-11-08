const fs = require("fs");
const path = require("path");

// --- Base de données PRINCIPALE (pour la recherche) ---
// MISE À JOUR : Chemin vers le nouveau fichier game.json
const dbPath = path.join(__dirname, "..", "data", "initial_data", "games.json");
let database = [];
try {
  database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  console.log(`Base de données principale chargée : ${database.length} jeux.`);
} catch (err) {
  console.error("Erreur: Impossible de lire le fichier game.json.", err);
}

// --- Contrôleurs pour les routes RAPIDES ---

// GET /api/games (rapide)
exports.getAllGames = (req, res) => {
  let results = [...database];
  const { region } = req.query; // Le filtre 'publisher' est retiré car il n'est pas dans game.json

  if (region) {
    results = results.filter(
      (g) => g.region.toLowerCase() === region.toLowerCase()
    );
  }

  res.json(results);
};

// GET /api/search (rapide)
exports.searchGames = (req, res) => {
  // MISE À JOUR : Utilise req.query.name au lieu de req.query.title
  const query = (req.query.name || "").toLowerCase();

  if (!query) {
    // MISE À JOUR : Le message d'erreur reflète le nouveau paramètre
    return res
      .status(400)
      .json({ error: 'Le paramètre de requête "name" est manquant' });
  }

  // MISE À JOUR : Filtre sur le champ 'name'
  const results = database.filter((g) => g.name.toLowerCase().includes(query));

  res.json(results);
};

// --- Contrôleur pour la route RICHE ---

// GET /api/games/:id (riche, avec méta et URLs)
exports.getGameById = (req, res) => {
  const id = req.params.id.toUpperCase();

  // 1. Trouver le jeu dans la base de données principale (game.json)
  const baseGame = database.find((g) => g.id === id || g.serial === id);

  if (!baseGame) {
    return res.status(404).json({ error: "Jeu non trouvé" });
  }

  // 2. Définir les chemins (logique inchangée)
  const serial = baseGame.serial;
  const assetUrlPath = `/db/nds/base/${serial}`;
  const metaFilePath = path.join(
    __dirname,
    "..",
    "public",
    "db",
    "nds",
    "base",
    serial,
    "meta.json"
  );

  let metadata = {};

  // 3. Essayer de lire le meta.json (logique inchangée)
  try {
    if (fs.existsSync(metaFilePath)) {
      metadata = JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
    } else {
      console.warn(`Avertissement : meta.json manquant pour ${serial}`);
      // On continue même si le meta.json n'existe pas
    }
  } catch (err) {
    console.error(`Erreur lecture meta.json pour ${serial}:`, err);
    // Ne pas bloquer la requête, renvoyer au moins les infos de base
  }

  // 4. Construire les URLs des assets (logique inchangée)
  const assets = {
    icon_url: `${assetUrlPath}/icon.jpg`,
    banner_url: `${assetUrlPath}/banner.jpg`,
    top_image_url: `${assetUrlPath}/top_image.jpg`,
    screenshots_urls: [],
    screenshots_uncompiled_urls: [],
    thumbnails_urls: [],
  };

  if (metadata.filenames) {
    if (metadata.filenames.screenshots) {
      assets.screenshots_urls = metadata.filenames.screenshots.map(
        (file) => `${assetUrlPath}/screenshots/${file}`
      );
    }
    if (metadata.filenames.screenshots_uncompiled) {
      assets.screenshots_uncompiled_urls =
        metadata.filenames.screenshots_uncompiled.map(
          (file) => `${assetUrlPath}/screenshots_uncompiled/${file}`
        );
    }
    if (metadata.filenames.thumbnails) {
      assets.thumbnails_urls = metadata.filenames.thumbnails.map(
        (file) => `${assetUrlPath}/thumbnails/${file}`
      );
    }
  }

  // 5. Fusionner le tout et nettoyer (logique inchangée)
  if (metadata.filenames) {
    delete metadata.filenames;
  }

  const finalResponse = {
    ...baseGame, // Contient id, serial, name, version, region (de game.json)
    ...metadata, // Contient tout le reste (description, genres, etc. de meta.json)
    assets: assets, // Contient toutes les URLs construites
  };

  res.json(finalResponse);
};
