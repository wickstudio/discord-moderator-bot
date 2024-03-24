const { AuditLogEvent, EmbedBuilder } = require('discord.js');

let serverEditActivityCache = [];

async function handleServerEditActivity(oldGuild, newGuild, client) {
    const config =  client.getConfig();
    if (!config.protection.serverEditMonitoring.active || newGuild.id !== config.protection.allowedGuildId) {
        console.log("Server edit monitoring is inactive or not for this guild.");
        return;
    }

    try {
        const fetchedLogs = await newGuild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.GuildUpdate,
        });
        const auditEntry = fetchedLogs.entries.first();

        if (!auditEntry || Date.now() - auditEntry.createdTimestamp > 5000) {
            console.log("No recent server edit audit log entry found.");
            return;
        }

        const executor = auditEntry.executor;
        console.log(`${executor.tag} has edited the server.`);

        let member = await newGuild.members.fetch(executor.id);
        if (!member) return;

        const hasWhitelistedRole = member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
        if (hasWhitelistedRole) {
            console.log(`${executor.tag} has a whitelisted role, skipping action.`);
            return;
        }

        serverEditActivityCache.push({ executorId: executor.id, timestamp: Date.now() });
        serverEditActivityCache = serverEditActivityCache.filter(record => Date.now() - record.timestamp < config.protection.serverEditMonitoring.timeFrame);

        const recentEdits = serverEditActivityCache.filter(record => record.executorId === executor.id).length;

        if (recentEdits > config.protection.serverEditMonitoring.maxEdits) {
            await takeAction(member, config.protection.serverEditMonitoring);

            logAction(executor.tag, newGuild, config);
        }
    } catch (error) {
        console.error("Error handling server edit activity:", error);
    }
}

async function takeAction(member, monitoringConfig) {
    if (monitoringConfig.protection.action === 'kick' && member.kickable) {
        await member.kick('Excessive server editing detected.');
    } else if (monitoringConfig.protection.action === 'ban' && member.bannable) {
        await member.ban({ reason: 'Excessive server editing detected.' });
    } else if (monitoringConfig.protection.action === 'timeout' && member.moderatable) {
        await member.timeout(monitoringConfig.protection.timeoutDuration, 'Excessive server editing detected.');
    }
    console.log(`Action ${monitoringConfig.protection.action} was taken against ${member.user.tag} for excessive server editing.`);
}

function logAction(executorTag, guild, config) {
    const logChannel = guild.channels.cache.get(config.protection.logChannelId);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle(`Server Editing Detected`)
            .setDescription(`**Executor:** ${executorTag}\n**Action Taken:** ${config.protection.serverEditMonitoring.action}`)
            .setColor(0xFF0000)
            .setTimestamp();
        logChannel.send({ embeds: [logEmbed] });
    }
}

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild, client, config) {
        await handleServerEditActivity(oldGuild, newGuild, client);
    },
};
