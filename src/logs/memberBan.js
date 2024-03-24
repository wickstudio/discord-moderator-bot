const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.memberBan) {
      return;
    }

    const guild = ban.guild;
    const logChannelId = config.logger.events.memberBanlog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd });
    const banLog = auditLogs.entries.find(entry => 
      entry.target.id === ban.user.id && 
      (Date.now() - entry.createdTimestamp) < 10000
    );

    const executor = banLog ? banLog.executor.tag : 'Unknown';
    const reason = banLog && banLog.reason ? banLog.reason : 'No reason provided';

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('Member Banned')
      .setDescription(`${ban.user.tag} was banned from the server.`)
      .addFields(
        { name: 'User', value: `${ban.user}` },
        { name: 'Banned By', value: `${executor}` },
        { name: 'Reason', value: `${reason}` }
      )
      .setTimestamp()
      .setFooter({ text: `User ID: ${ban.user.id}`, iconURL: ban.user.displayAvatarURL() });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send member ban log in guild: ${guild.id}`, error);
    }
  },
};
