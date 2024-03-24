const { AuditLogEvent, EmbedBuilder } = require('discord.js');

let kickActivityCache = [];

async function handleKickActivity(guild, client) {
    const config =  client.getConfig();
    if (!config.protection.kickMonitoring.active || guild.id !== config.protection.allowedGuildId) {
        console.log("Kick monitoring is inactive.");
        return;
    }

    try {
        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick,
        });
        const auditEntry = fetchedLogs.entries.first();

        if (!auditEntry || Date.now() - auditEntry.createdTimestamp > 5000) {
            console.log("No recent kick audit log entry found.");
            return;
        }

        const executor = auditEntry.executor;
        console.log(`${executor.tag} kicked a member.`);

        let executorMember = await guild.members.fetch(executor.id);
        if (!executorMember) return;

        const hasWhitelistedRole = executorMember.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
        if (hasWhitelistedRole) {
            console.log(`${executor.tag} has a whitelisted role, skipping action.`);
            return;
        }

        kickActivityCache.push({ executorId: executor.id, timestamp: Date.now() });
        kickActivityCache = kickActivityCache.filter(record => Date.now() - record.timestamp < config.protection.kickMonitoring.timeFrame);

        const recentKicks = kickActivityCache.filter(record => record.executorId === executor.id).length;

        if (recentKicks > config.protection.kickMonitoring.maxKicks) {
            if (config.protection.kickMonitoring.action === 'kick' && executorMember.kickable) {
                await executorMember.kick('Excessive kicking of members detected.');
            } else if (config.protection.kickMonitoring.action === 'ban' && executorMember.bannable) {
                await executorMember.ban({ reason: 'Excessive kicking of members detected.' });
            } else if (config.protection.kickMonitoring.action === 'timeout' && executorMember.moderatable) {
                await executorMember.timeout(config.protection.kickMonitoring.timeoutDuration, 'Excessive kicking of members detected.');
            }
            console.log(`Action ${config.protection.kickMonitoring.action} was taken against ${executor.tag} for excessive kicking.`);

            const logChannel = guild.channels.cache.get(config.protection.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle(`Excessive Member Kicking Detected`)
                    .setDescription(`**Executor:** ${executor.tag}\n**Action Taken:** ${config.protection.kickMonitoring.action}`)
                    .setColor(0xFF0000)
                    .setTimestamp();
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    } catch (error) {
        console.error("An error occurred while handling kick activity:", error);
    }
}

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        await handleKickActivity(member.guild, client);
    },
};
