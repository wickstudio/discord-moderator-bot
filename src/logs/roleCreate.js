const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.RoleCreate,
  async execute(role,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.roleCreate) {
      return;
    }

    const guild = role.guild;
    const logChannelId = config.logger.events.createrolelog;
    const logChannel = guild.channels.cache.get(logChannelId);
    const creationTime = Math.floor(role.createdTimestamp / 1000);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleCreate,
    }).catch(console.error);

    let executor = 'Unknown';
    if (fetchedLogs && fetchedLogs.entries.size > 0) {
      const roleCreateLog = fetchedLogs.entries.first();
      if (roleCreateLog) {
        executor = `<@${roleCreateLog.executor.id}>`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(role.color || 0xFFFFFF)
      .setTitle('Role Created')
      .setDescription(`A new role has been created.`)
      .addFields(
        { name: 'Role', value: role.toString(), inline: true },
        { name: 'Created By', value: executor, inline: true },
        { name: 'Creation Time', value: `<t:${creationTime}:F>`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Role ID: ${role.id}` });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send role creation log in guild: ${guild.id}`, error);
    }
  },
};
