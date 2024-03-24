const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.memberKick) {
      return;
    }

    const guild = member.guild;
    const logChannelId = config.logger.events.memberKicklog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    setTimeout(async () => {
      const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick });
      const kickLog = auditLogs.entries.find(entry => 
        entry.target.id === member.id && 
        (Date.now() - entry.createdTimestamp) < 10000
      );

      if (!kickLog) return;

      const executor = kickLog.executor.tag;
      const reason = kickLog.reason || 'No reason provided';

      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('Member Kicked')
        .setDescription(`${member.user.tag} was kicked from the server.`)
        .addFields(
          { name: 'User', value: `${member.user}` },
          { name: 'Kicked By', value: `${executor}` },
          { name: 'Reason', value: `${reason}` }
        )
        .setTimestamp()
        .setFooter({ text: `User ID: ${member.id}`, iconURL: member.user.displayAvatarURL() });

      try {
        await logChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error(`Failed to send member kick log in guild: ${guild.id}`, error);
      }
    }, 1000);
  },
};
