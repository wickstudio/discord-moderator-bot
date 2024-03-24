const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.MessageDelete,
  async execute(message,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.messageDelete) {
      return;
    }

    if (message.author.bot || message.system) return;

    const guild = message.guild;
    const logChannelId = config.logger.events.messageDeleteLogChannelId;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    let executor = 'Unknown';

    setTimeout(async () => {
      try {
        const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete });
        const deleteLog = auditLogs.entries.first();
        if (deleteLog) {
          const target = deleteLog.target;
          if (target.id === message.author.id) {
            executor = deleteLog.executor.tag;
          }
        }
      } catch (error) {
        console.error('Error while fetching audit logs:', error);
      }

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Message Deleted')
        .setDescription(`A message by ${message.author} was deleted in ${message.channel}.`)
        .addFields(
          { name: 'Content', value: message.content?.substring(0, 1024) || 'No content (may be an embed or attachment)' },
          { name: 'Deleted By', value: executor },
          { name: 'Message ID', value: message.id }
        )
        .setTimestamp();

      try {
        await logChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error(`Failed to send message delete log in guild: ${guild.id}`, error);
      }
    }, 1000);
  },
};
