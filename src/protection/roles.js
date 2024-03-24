const { AuditLogEvent, EmbedBuilder } = require('discord.js');

let roleActivityCache = [];

async function handleRoleActivity(role, action, client) {
    const config =  client.getConfig();
    if (!config.protection.roleMonitoring.active || role.guild.id !== config.protection.allowedGuildId) {
        console.log("Role monitoring is inactive or the event is from an unauthorized guild.");
        return;
    }

    try {
        const fetchedLogs = await role.guild.fetchAuditLogs({
            limit: 1,
            type: action === 'create' ? AuditLogEvent.RoleCreate : AuditLogEvent.RoleDelete,
        });

        const auditEntry = fetchedLogs.entries.first();
        if (!auditEntry || Date.now() - auditEntry.createdTimestamp > 5000) {
            console.log(`No recent audit log entry found for role ${action}.`);
            return;
        }

        const executor = auditEntry.executor;
        console.log(`${executor.tag} ${action} the role ${role.name}`);

        let member = await role.guild.members.fetch(executor.id);
        if (!member) return;

        const hasWhitelistedRole = member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
        if (hasWhitelistedRole) {
            console.log(`${executor.tag} has a whitelisted role, skipping action.`);
            return;
        }

        const now = Date.now();
        roleActivityCache.push({ executorId: executor.id, timestamp: now });
        roleActivityCache = roleActivityCache.filter(record => now - record.timestamp < config.protection.roleMonitoring.timeFrame);

        const recentActivities = roleActivityCache.filter(record => record.executorId === executor.id).length;

        if (recentActivities > config.protection.roleMonitoring.maxRoleChanges) {
            const actionTaken = config.protection.roleMonitoring.action;
            try {
                if (actionTaken === 'kick') {
                    await member.kick('Excessive role creation/deletion detected.');
                    console.log(`Kicked ${executor.tag} for excessive role ${action}.`);
                } else if (actionTaken === 'ban') {
                    await member.ban({ reason: 'Excessive role creation/deletion detected.' });
                    console.log(`Banned ${executor.tag} for excessive role ${action}.`);
                } else if (actionTaken === 'timeout') {
                    await member.timeout(config.protection.roleMonitoring.timeoutDuration, 'Excessive role creation/deletion detected.');
                    console.log(`Timed out ${executor.tag} for excessive role ${action}.`);
                }

                const logChannel = client.channels.cache.get(config.protection.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle(`Role ${action} Detected`)
                        .setDescription(`**User:** ${executor.tag}\n**Action:** ${config.protection.roleMonitoring.action}`)
                        .setColor(0xFF0000)
                        .addFields({ name: 'Detected At', value: `<t:${Math.floor(now / 1000)}:F>`, inline: false })
                        .setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }
            } catch (error) {
                console.error(`Failed to ${actionTaken} ${executor.tag}:`, error);
            }

            roleActivityCache = roleActivityCache.filter(record => record.executorId !== executor.id);
        }
    } catch (error) {
        console.error("An error occurred while handling role activity:", error);
    }
}

module.exports = [
    {
        name: 'roleCreate',
        execute(role, client) {
            handleRoleActivity(role, 'create', client);
        },
    },
    {
        name: 'roleDelete',
        execute(role, client) {
            handleRoleActivity(role, 'delete', client);
        },
    },
];
