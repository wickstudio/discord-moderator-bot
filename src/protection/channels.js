const { AuditLogEvent, EmbedBuilder } = require('discord.js');

let channelActivityCache = [];

async function handleChannelActivity(channel, action, client) {
    const config =  client.getConfig();
    if (!config.protection.channelMonitoring.active || channel.guild.id !== config.protection.allowedGuildId) {
        console.log("Channel monitoring is inactive or the event is from an unauthorized guild.");
        return;
    }

    try {
        const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: action === 'create' ? AuditLogEvent.ChannelCreate : AuditLogEvent.ChannelDelete,
        }).catch(error => console.error("Failed to fetch audit logs for channel activity:", error));

        const auditEntry = fetchedLogs.entries.first();
        if (!auditEntry || Date.now() - auditEntry.createdTimestamp > 5000) {
            console.log(`No recent audit log entry found for channel ${action}.`);
            return;
        }

        const executor = auditEntry.executor;
        console.log(`${executor.tag} ${action} the channel ${channel.name}`);

        let member = await channel.guild.members.fetch(executor.id).catch(() => {
            console.log(`Failed to fetch member: ${executor.tag}`);
            return null;
        });
        if (!member) return;

        const hasWhitelistedRole = member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
        if (hasWhitelistedRole) {
            console.log(`${executor.tag} has a whitelisted role, skipping action.`);
            return;
        }

        const now = Date.now();
        channelActivityCache.push({ executorId: executor.id, timestamp: now });
        channelActivityCache = channelActivityCache.filter(record => now - record.timestamp < config.protection.channelMonitoring.timeFrame);

        const recentActivities = channelActivityCache.filter(record => record.executorId === executor.id).length;
        if (recentActivities > config.protection.channelMonitoring.maxChannelChanges) {
            await performActionBasedOnConfig(member, action, client);
        }
    } catch (error) {
        console.error("An error occurred while handling channel activity:", error);
    }
}

async function performActionBasedOnConfig(member, action, client) {
    const { action: monitoringAction, timeoutDuration } = config.protection.channelMonitoring;
    const executorTag = member.user.tag;
    const reason = 'Excessive channel creation/deletion detected.';
    try {
        if (monitoringAction === 'kick') {
            await member.kick(reason);
        } else if (monitoringAction === 'ban') {
            await member.ban({ reason });
        } else if (monitoringAction === 'timeout') {
            await member.timeout(timeoutDuration, reason);
        }
        console.log(`${executorTag} has been ${monitoringAction} due to excessive channel ${action}.`);
        await sendLogMessage(member.guild, executorTag, monitoringAction, action, client);
    } catch (error) {
        console.error(`Failed to ${monitoringAction} member:`, error);
    }
}

async function sendLogMessage(guild, executorTag, monitoringAction, action, client) {
    const now = Date.now();
    const logChannel = client.channels.cache.get(config.protection.logChannelId);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle(`Channel ${action} Detected`)
            .setDescription(`**User:** ${executorTag}\n**Action:** ${monitoringAction}`)
            .setColor(0xFF0000)
            .addFields({ name: 'Detected At', value: `<t:${Math.floor(now / 1000)}:F>`, inline: false })
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] }).catch(error => console.error("Failed to send log message:", error));
    }
}

module.exports = [
    {
        name: 'channelCreate',
        execute(channel, client, config) {
            handleChannelActivity(channel, 'create', client, config);
        },
    },
    {
        name: 'channelDelete',
        execute(channel, client, config) {
            handleChannelActivity(channel, 'delete', client, config);
        },
    },
];
