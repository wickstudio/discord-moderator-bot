const express = require('express');
const { loadConfig, saveConfig, convertTicketGroups } = require('../utils');

const router = express.Router();

router.get('/', (req, res) => {
    const config = loadConfig();
    res.render('index', { config, page: 'ticket' });
});

router.post('/', (req, res) => {
    const config = loadConfig();
    const convertedGroups = convertTicketGroups(req.body.ticketGroups || {});
    config.ticketSettings = { ...req.body, ticketGroups: { ...convertedGroups } };
    saveConfig(config);
    res.render('index', { config, page: 'ticket' });
});

module.exports = router;
