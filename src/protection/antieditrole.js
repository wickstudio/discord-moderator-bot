const { AuditLogEvent, EmbedBuilder } = require('discord.js');

let roleEditActivityCache = [];

async function handleRoleEditActivity(guild, type, role, client) {
    const config =  client.getConfig();
    if (!config.protection.roleEditMonitoring.active || guild.id !== config.protection.allowedGuildId) {
        console.log("Role edit monitoring is inactive or not for this guild.");
        return;
    }

    try {
        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: type === 'update' ? AuditLogEvent.RoleUpdate : AuditLogEvent.GuildMemberUpdate,
        });

        const auditEntry = fetchedLogs.entries.find(entry =>
            (entry.target.id === role.id || entry.target.id === role.user?.id) &&
            Date.now() - entry.createdTimestamp < 10000);

        if (!auditEntry) {
            console.log(`No relevant audit log entry found for role ${type}.`);
            return;
        }

        const executor = auditEntry.executor;
        console.log(`${executor.tag} has edited a role or role assignment.`);

        let member = await guild.members.fetch(executor.id);
        if (!member) return;

        const hasWhitelistedRole = member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
        if (hasWhitelistedRole) {
            console.log(`${executor.tag} has a whitelisted role, skipping action.`);
            return;
        }

        roleEditActivityCache.push({ executorId: executor.id, timestamp: Date.now() });
        roleEditActivityCache = roleEditActivityCache.filter(record => Date.now() - record.timestamp < config.protection.roleEditMonitoring.timeFrame);

        const recentEdits = roleEditActivityCache.filter(record => record.executorId === executor.id).length;

        if (recentEdits > config.protection.roleEditMonitoring.maxEdits) {
            if (config.protection.roleEditMonitoring.action === 'kick') {
                await member.kick('Excessive role editing detected.');
            } else if (config.protection.roleEditMonitoring.action === 'ban') {
                await member.ban({ reason: 'Excessive role editing detected.' });
            } else if (config.protection.roleEditMonitoring.action === 'timeout') {
                await member.timeout(config.protection.roleEditMonitoring.timeoutDuration, 'Excessive role editing detected.');
            }
            console.log(`Action ${config.protection.roleEditMonitoring.action} was taken against ${executor.tag} for excessive role editing.`);

            const logChannel = guild.channels.cache.get(config.protection.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle(`Role Editing Detected`)
                    .setDescription(`**User:** ${executor.tag}\n**Action:** ${config.protection.roleEditMonitoring.action}`)
                    .setColor(0xFF0000)
                    .addFields({ name: 'Detected At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            roleEditActivityCache = roleEditActivityCache.filter(record => record.executorId !== executor.id);
        }
    } catch (error) {
        console.error("Error handling role edit activity:", error);
    }
}

module.exports = [
    {
        name: 'roleUpdate',
        async execute(oldRole, newRole, client) {
            await handleRoleEditActivity(newRole.guild, 'update', newRole, client);
        },
    },
    {
        name: 'guildMemberUpdate',
        async execute(oldMember, newMember, client) {
            // Check for role changes
            const roleChanges = newMember.roles.cache.difference(oldMember.roles.cache);
            if (roleChanges.size > 0) {
                await handleRoleEditActivity(newMember.guild, 'assignment', newMember, client);
            }
        },
    },
];
