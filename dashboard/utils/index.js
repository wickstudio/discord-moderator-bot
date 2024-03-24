const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', '..', 'config.json');

/**
 * Saves the updated configuration to the config.json file.
 * @param {Object} updatedConfig The updated configuration object.
 */
function saveConfig(updatedConfig) {
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error saving the configuration:', err);
            throw err; // Optionally, handle this error more gracefully
        }
        console.log('Configuration saved successfully.');
    });
}
/**
 * Loads the application configuration from the config.json file.
 * @returns {Object} The loaded configuration object.
 */
function loadConfig() {
    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (err) {
        console.error('Error loading the configuration:', err);
        throw err; // Optionally, handle this error more gracefully.
    }
}

function convertTicketGroups(originalTicketGroups) {
    const convertedGroups = {};
    Object.values(originalTicketGroups).forEach((group) => {
        const { key, ...groupWithoutKey } = group;
        convertedGroups[key] = groupWithoutKey;
    });
    return convertedGroups;
}

function structureConfig(requestBody) {
    const structuredConfig = {};

    for (const key in requestBody) {
        const value = requestBody[key];
        // Split the key by the period to find nested levels
        const keyParts = key.split(".");

        let currentLevel = structuredConfig;
        // Iterate through the parts to build the nested structure
        keyParts.forEach((part, index) => {
            // If it's the last part, assign the value
            if (index === keyParts.length - 1) {
                // Convert numeric strings to numbers where appropriate
                currentLevel[part] = isNaN(value) ? value : Number(value);
            } else {
                // If the next level doesn't exist, create it
                if (!currentLevel[part]) currentLevel[part] = {};
                // Move down the structure
                currentLevel = currentLevel[part];
            }
        });
    }
    return structuredConfig
}

module.exports = { loadConfig, saveConfig, convertTicketGroups, structureConfig }