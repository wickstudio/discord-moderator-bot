const express = require('express');
const { loadConfig, saveConfig } = require('../utils');

const router = express.Router();

router.get('/', (req, res) => {
    const config = loadConfig();
    res.render('index', { config, page: 'overview' });
});

router.post('/', (req, res) => {
    const config = loadConfig();
    // Merge or overwrite the configuration as needed based on req.body
    Object.assign(config, req.body);
    saveConfig(config);
    res.render('index', { config, page: 'overview' });
});

module.exports = router;
