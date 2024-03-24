const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.GuildBanRemove,
  async execute(ban,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.memberUnban) {
      return;
    }

    const guild = ban.guild;
    const logChannelId = config.logger.events.memberUnbanlog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove });
    const unbanLog = auditLogs.entries.find(entry =>
      entry.target.id === ban.user.id &&
      (Date.now() - entry.createdTimestamp) < 10000
    );

    const executor = unbanLog ? unbanLog.executor.tag : 'Unknown';
    const reason = unbanLog && unbanLog.reason ? unbanLog.reason : 'No reason provided';

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Member Unbanned')
      .setDescription(`${ban.user.tag} was unbanned from the server.`)
      .addFields(
        { name: 'User', value: `${ban.user}` },
        { name: 'Unbanned By', value: `${executor}` },
        { name: 'Reason', value: `${reason}` }
      )
      .setTimestamp()
      .setFooter({ text: `User ID: ${ban.user.id}`, iconURL: ban.user.displayAvatarURL() });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send member unban log in guild: ${guild.id}`, error);
    }
  },
};
