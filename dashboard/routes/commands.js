const express = require('express');
const { loadConfig, saveConfig } = require('../utils');

const router = express.Router();

router.get('/', (req, res) => {
    const config = loadConfig();
    res.render('index', { config, page: 'commands' });
});

router.post('/', (req, res) => {
    const config = loadConfig();
    config.commands = req.body.commands;
    saveConfig(config);
    res.render('index', { config, page: 'commands' });
});

module.exports = router;
