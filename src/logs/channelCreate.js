const { EmbedBuilder, Events, AuditLogEvent, ChannelType } = require('discord.js');

function getChannelTypeString(type) {
    switch (type) {
        case ChannelType.GuildText:
            return 'Text';
        case ChannelType.GuildVoice:
            return 'Voice';
        case ChannelType.GuildCategory:
            return 'Category';
        case ChannelType.GuildNews:
            return 'News';
        case ChannelType.GuildStageVoice:
            return 'Stage';
        case ChannelType.GuildForum:
            return 'Forum';
        default:
            return 'Unknown';
    }
}

module.exports = {
  name: Events.ChannelCreate,
  async execute(channel,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.channelCreate) {
      return;
    }

    const logChannelId = config.logger.events.channelCreatelog;
    const guild = channel.guild;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelCreate,
    }).catch(console.error);

    let executor = 'Unknown';
    let creationTime = `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`;
    if (fetchedLogs && fetchedLogs.entries.size > 0) {
      const channelCreateLog = fetchedLogs.entries.first();
      if (channelCreateLog && channelCreateLog.target.id === channel.id) {
        executor = channelCreateLog.executor ? channelCreateLog.executor.toString() : 'Unknown';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('Channel Created')
      .addFields(
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Type', value: getChannelTypeString(channel.type), inline: true },
        { name: 'Created By', value: executor, inline: true },
        { name: 'Creation Time', value: creationTime, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Channel ID: ${channel.id}` });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send channel creation log in guild: ${guild.id}`, error);
    }
  },
};
