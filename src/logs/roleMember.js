const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.roleMember) {
      return;
    }

    const guild = newMember.guild;
    const logChannelId = config.logger.events.roleMemberLogChannelId;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Role member log channel with ID ${logChannelId} not found.`);
      return;
    }

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

    if (addedRoles.size === 0 && removedRoles.size === 0) return;

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: addedRoles.size > 0 ? AuditLogEvent.MemberRoleUpdate : AuditLogEvent.MemberRoleUpdate,
    }).catch(console.error);

    let executor = 'Unknown';
    if (fetchedLogs && fetchedLogs.entries.size > 0) {
      const roleChangeLog = fetchedLogs.entries.first();
      if (roleChangeLog && roleChangeLog.target.id === newMember.id) {
        executor = roleChangeLog.executor ? `<@${roleChangeLog.executor.id}>` : 'Unknown';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('Role Update')
      .setDescription(`Roles updated for ${newMember.toString()}`)
      .addFields(
        { name: 'Role Added', value: addedRoles.map(role => role.toString()).join('\n') || 'None', inline: true },
        { name: 'Role Removed', value: removedRoles.map(role => role.toString()).join('\n') || 'None', inline: true },
        { name: 'Updated By', value: executor, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `User ID: ${newMember.id}` });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send role member update log in guild: ${guild.id}`, error);
    }
  },
};
