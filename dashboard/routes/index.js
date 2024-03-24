const express = require('express');
// Routes
const homeRoutes = require("./home");
const loggerRoutes = require("./logger");
const commandsRoutes = require("./commands");
const autoRespondersRoutes = require("./autoResponders");
const protectionRoutes = require("./protection");
const ticketsRoutes = require("./tickets");
const overviewRoutes = require("./overview");

const router = express.Router();

router.use("/", homeRoutes);
router.use("/logger", loggerRoutes);
router.use("/overview", overviewRoutes);
router.use("/commands", commandsRoutes);
router.use("/autoResponders", autoRespondersRoutes);
router.use("/protection", protectionRoutes);
router.use("/ticket", ticketsRoutes);


module.exports = router;