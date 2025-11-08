const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const { getErrorHtml } = require("./views/templates");
const { APIError, ServerError } = require("./utils/errors");

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

app.use("/api/v1/metadata", require("./routes/metadata"));
app.use("/api/v1/images", require("./routes/images"));
app.use("/api/v1/screenshots", require("./routes/screenshots"));
app.use("/api/v1/thumbnails", require("./routes/thumbnails"));
app.use("/api/v1/stats", require("./routes/stats"));
app.use("/api/v1/uptimes", require("./routes/uptimes"));
app.use("/api/v1/docs", require("./routes/docs"));

app.get("/", (req, res) => {
  res.redirect("/api/v1/docs");
});

app.use("/api", (req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err);

  let error = err;
  if (!(err instanceof APIError)) {
    error = new ServerError("Internal Server Error", { original: err.message });
  }

  if (req.originalUrl.startsWith("/api")) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  } else {
    res
      .status(error.status)
      .send(getErrorHtml(error.status, error.message, error.details));
  }
});

app.listen(PORT, () => {
  console.log(`Serveur NDSdbapi démarré sur http://localhost:${PORT}`);
});

module.exports = app;
