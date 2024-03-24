const express = require('express');
const { loadConfig, saveConfig } = require('../utils');

const router = express.Router();

router.get('/', (req, res) => {
    const config = loadConfig(); // Load the latest configuration
    res.render('index', { config, page: 'logger' });
});

router.post('/', (req, res) => {
    const config = loadConfig(); // Load the current configuration
    // Update the logger configuration
    config.logger.events = req.body.events;

    // Save the updated configuration
    saveConfig(config);

    // Send a response back to the client
    res.render('index', { config, page: 'logger' });
});

module.exports = router;
