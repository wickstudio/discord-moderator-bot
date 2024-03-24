const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.RoleDelete,
  async execute(role,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.roleDelete) {
      return;
    }

    const guild = role.guild;
    const logChannelId = config.logger.events.deleterolelog;
    const logChannel = guild.channels.cache.get(logChannelId);
    const deletionTime = Math.floor(Date.now() / 1000);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleDelete,
    }).catch(console.error);

    let executor = 'Unknown';
    if (fetchedLogs && fetchedLogs.entries.size > 0) {
      const roleDeleteLog = fetchedLogs.entries.first();
      if (roleDeleteLog) {
        executor = `<@${roleDeleteLog.executor.id}>`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('Role Deleted')
      .setDescription(`A role was deleted.`)
      .addFields(
        { name: 'Role Name', value: role.name, inline: true },
        { name: 'Deleted By', value: executor, inline: true },
        { name: 'Deletion Time', value: `<t:${deletionTime}:F>`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Role ID: ${role.id}` });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send role deletion log in guild: ${guild.id}`, error);
    }
  },
};
