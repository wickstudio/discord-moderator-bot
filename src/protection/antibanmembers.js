const { AuditLogEvent, EmbedBuilder } = require('discord.js');

let banActivityCache = [];

async function handleBanActivity(guild, client) {
    const config =  client.getConfig();
    // Check if ban monitoring is enabled and if the guild is the allowed guild.
    if (!config.protection.banMonitoring.active || guild.id !== config.protection.allowedGuildId) {
        console.log("Ban monitoring is inactive or not for this guild.");
        return;
    }

    try {
        // Fetch the latest 5 ban audit logs.
        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: AuditLogEvent.MemberBanAdd,
        });

        // Find a ban entry within the last 20 seconds.
        const recentBanEntry = fetchedLogs.entries.find(entry => Date.now() - entry.createdTimestamp < 20000);

        if (!recentBanEntry) {
            console.log("No relevant ban audit log entry found within the last 20 seconds.");
            return;
        }

        // Log the executor of the ban.
        const executor = recentBanEntry.executor;
        console.log(`${executor.tag} has banned a member.`);

        // Fetch the member who executed the ban.
        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (!member) return;

        // Check if the executor has a whitelisted role.
        const hasWhitelistedRole = member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
        if (hasWhitelistedRole) {
            console.log(`${executor.tag} has a whitelisted role, skipping action.`);
            return;
        }

        // Update the ban activity cache.
        banActivityCache.push({ executorId: executor.id, timestamp: Date.now() });
        banActivityCache = banActivityCache.filter(record => Date.now() - record.timestamp < config.protection.banMonitoring.timeFrame);

        // Count the recent bans by the executor.
        const recentBans = banActivityCache.filter(record => record.executorId === executor.id).length;

        // Take action if the number of recent bans exceeds the maximum allowed.
        if (recentBans > config.protection.banMonitoring.maxBans) {
            if (config.protection.banMonitoring.action === 'kick' && member.kickable) {
                await member.kick('Excessive banning detected.');
            } else if (config.protection.banMonitoring.action === 'ban' && member.bannable) {
                await member.ban({ reason: 'Excessive banning detected.' });
            } else if (config.protection.banMonitoring.action === 'timeout' && member.moderatable) {
                await member.timeout(config.protection.banMonitoring.timeoutDuration, 'Excessive banning detected.');
            }
            console.log(`Action ${config.protection.banMonitoring.action} was taken against ${executor.tag} for excessive banning.`);

            // Send a log message to the specified channel.
            const logChannel = guild.channels.cache.get(config.protection.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle(`Excessive Member Banning Detected`)
                    .setDescription(`**Executor:** ${executor.tag}\n**Action Taken:** ${config.protection.banMonitoring.action}`)
                    .setColor(0xFF0000)
                    .setTimestamp();
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    } catch (error) {
        console.error("Error handling ban activity:", error);
    }
}

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client) {
        await handleBanActivity(ban.guild, client);
    },
};
