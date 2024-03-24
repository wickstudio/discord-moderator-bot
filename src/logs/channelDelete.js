const { EmbedBuilder, Events, AuditLogEvent, ChannelType } = require('discord.js');

function getChannelTypeString(type) {
    switch (type) {
        case ChannelType.GuildText: return 'Text';
        case ChannelType.GuildVoice: return 'Voice';
        case ChannelType.GuildCategory: return 'Category';
        case ChannelType.GuildNews: return 'News';
        case ChannelType.GuildStageVoice: return 'Stage';
        case ChannelType.GuildForum: return 'Forum';
        default: return 'Unknown';
    }
}

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.channelDelete) {
      return;
    }

    const guild = channel.guild;
    const logChannelId = config.logger.events.channelDeletelog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
    }).catch(console.error);

    let executor = 'Unknown';
    if (fetchedLogs && fetchedLogs.entries.size > 0) {
      const channelDeleteLog = fetchedLogs.entries.first();
      if (channelDeleteLog && channelDeleteLog.target.id === channel.id) {
        executor = channelDeleteLog.executor ? channelDeleteLog.executor.toString() : 'Unknown';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('Channel Deleted')
      .addFields(
        { name: 'Channel Name', value: channel.name, inline: true },
        { name: 'Type', value: getChannelTypeString(channel.type), inline: true },
        { name: 'Deleted By', value: executor, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Channel ID: ${channel.id}` });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send channel deletion log in guild: ${guild.id}`, error);
    }
  },
};
