const express = require("express");
const path = require("path");

const gameRoutes = require("./routes/games");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use("/api", gameRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur NDS API démarré sur http://localhost:${PORT}`);
});
