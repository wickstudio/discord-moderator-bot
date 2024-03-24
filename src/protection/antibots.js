const { AuditLogEvent, EmbedBuilder } = require('discord.js');

async function handleBotAddition(member, client) {
    const config =  client.getConfig();
    if (!config.protection.botMonitoring.active || member.guild.id !== config.protection.allowedGuildId || !member.user.bot) {
        return;
    }

    try {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.BotAdd,
        });
        const auditEntry = fetchedLogs.entries.find(entry => entry.target.id === member.id && Date.now() - entry.createdTimestamp < 10000);

        if (!auditEntry) {
            console.log("No recent Bot Add audit log entry found.");
            return;
        }

        const executor = auditEntry.executor;
        console.log(`${executor.tag} added a bot: ${member.user.tag}.`);

        let executorMember = await member.guild.members.fetch(executor.id);
        if (executorMember) {
            const hasWhitelistedRole = executorMember.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
            if (hasWhitelistedRole) {
                console.log(`${executor.tag} has a whitelisted role, skipping action.`);
                return;
            }

            await takeActionAgainstUser(executorMember, client);

            await takeActionAgainstBot(member, client);
        }
    } catch (error) {
        console.error("An error occurred while handling bot addition:", error);
    }
}

async function takeActionAgainstUser(executorMember, client) {
    switch (config.protection.botMonitoring.action) {
        case 'kick':
            await executorMember.kick('Unauthorized bot addition detected.');
            break;
        case 'ban':
            await executorMember.ban({ reason: 'Unauthorized bot addition detected.' });
            break;
        case 'timeout':
            await executorMember.timeout(config.protection.botMonitoring.timeoutDuration, 'Unauthorized bot addition detected.');
            break;
    }
    console.log(`Action ${config.protection.botMonitoring.action} was taken against ${executorMember.user.tag} for adding a bot.`);
}

async function takeActionAgainstBot(botMember, client) {
    switch (config.protection.botMonitoring.botAction) {
        case 'kick':
            await botMember.kick('Unauthorized bot addition.');
            break;
        case 'ban':
            await botMember.ban({ reason: 'Unauthorized bot addition.' });
            break;
    }
    console.log(`Bot ${botMember.user.tag} was ${config.protection.botMonitoring.botAction} after being added.`);
    
    const logChannel = botMember.guild.channels.cache.get(config.protection.logChannelId);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle(`Added Bot Detected`)
            .setDescription(`**User :** ${executorMember.user.tag}\n**Bot :** ${botMember.user.tag}\n**Action :** ${config.protection.botMonitoring.action}`)
            .setColor(0xFF0000)
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        await handleBotAddition(member, client);
    },
};
