const express = require("express");
const { loadConfig, saveConfig, structureConfig } = require("../utils");

const router = express.Router();

router.get("/", (req, res) => {
  const config = loadConfig();
  res.render("index", { config, page: "protection" });
});

router.post("/", async (req, res) => {
  const config = loadConfig();
  const newConfig = await structureConfig(req.body);
  config.protection = newConfig;
  saveConfig(config);
  res.render("index", { config, page: "protection" });
});

module.exports = router;
