const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.nicknameChange) {
      return;
    }

    const loggerChannelId = config.logger.events.nicknameChangelog;
    const guild = newMember.guild;
    const logChannel = guild.channels.cache.get(loggerChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${loggerChannelId} not found.`);
      return;
    }

    if (oldMember.nickname === newMember.nickname) {
      return;
    }

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberUpdate,
    }).catch(console.error);

    let executor = 'Unknown';
    let timestampField = 'Just now';
    if (fetchedLogs) {
      const nicknameChangeLog = fetchedLogs.entries.first();
      if (nicknameChangeLog) {
        const target = nicknameChangeLog.target;
        if (target.id === newMember.id && (oldMember.nickname !== newMember.nickname)) {
          executor = `<@${nicknameChangeLog.executor.id}>`;
          const timestamp = Math.floor(nicknameChangeLog.createdAt / 1000);
          timestampField = `<t:${timestamp}:R>`;
        }
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('Nickname Change')
      .addFields(
        { name: 'User', value: `<@${newMember.id}>`, inline: true },
        { name: 'Old Nickname', value: oldMember.nickname || '`None`', inline: true },
        { name: 'New Nickname', value: newMember.nickname || '`None`', inline: true },
        { name: 'Changed By', value: executor, inline: true },
        { name: 'When', value: timestampField, inline: true },
      )
      .setFooter({ text: 'User ID: ' + newMember.id });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send nickname change log in guild: ${guild.id}`, error);
    }
  },
};
