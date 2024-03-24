const express = require('express');
const { loadConfig, saveConfig } = require('../utils');

const router = express.Router();

router.get('/', (req, res) => {
    const config = loadConfig();
    res.render('index', { config, page: 'AutoResponders' });
})

router.post('/', (req, res) => {
    const config = loadConfig();
    config.autoResponders = req.body.autoResponders;
    saveConfig(config);
    res.render('index', { config, page: 'AutoResponders' });
});

module.exports = router;
