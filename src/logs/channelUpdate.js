const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.ChannelUpdate,
  async execute(oldChannel, newChannel,client) {
      const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.channelUpdate) {
      return;
    }

    const guild = newChannel.guild;
    const logChannelId = config.logger.events.channelUpdatelog;
    const logChannel = guild.channels.cache.get(logChannelId);
    

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    let changes = [];

    const addChange = (name, oldValue, newValue) => {
      changes.push({ name: `**${name}**`, value: `**From:** ${oldValue}\n**To:** ${newValue}`, inline: false });
    };

    if (oldChannel.name !== newChannel.name) {
      addChange('Name', oldChannel.name, newChannel.name);
    }
    if (oldChannel.topic !== newChannel.topic) {
      addChange('Topic', oldChannel.topic || '`None`', newChannel.topic || '`None`');
    }
    if (oldChannel.nsfw !== newChannel.nsfw) {
      addChange('NSFW', oldChannel.nsfw ? 'Enabled' : 'Disabled', newChannel.nsfw ? 'Enabled' : 'Disabled');
    }
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
      addChange('Slowmode', `${oldChannel.rateLimitPerUser} seconds`, `${newChannel.rateLimitPerUser} seconds`);
    }

    if (oldChannel.parentId !== newChannel.parentId) {
      const oldParentName = oldChannel.guild.channels.cache.get(oldChannel.parentId)?.name || 'None';
      const newParentName = newChannel.guild.channels.cache.get(newChannel.parentId)?.name || 'None';
      addChange('Category', oldParentName, newParentName);
    }

    if (changes.length === 0) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle(`🔄 Channel Updated Log`)
      .setDescription(`Updates detected in ${newChannel.toString()}.`)
      .addFields(changes)
      .setTimestamp()
      .setFooter({ text: `Channel ID: ${newChannel.id}` });

    try {
      const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate });
      if (fetchedLogs && fetchedLogs.entries.size > 0) {
        const channelUpdateLog = fetchedLogs.entries.first();
        if (channelUpdateLog && channelUpdateLog.target.id === newChannel.id) {
          const executor = channelUpdateLog.executor ? channelUpdateLog.executor.toString() : 'Unknown';
          embed.addFields({ name: '**Updated By**', value: executor, inline: false });
        }
      }

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send channel update log in guild: ${guild.id}`, error);
    }
  },
};
