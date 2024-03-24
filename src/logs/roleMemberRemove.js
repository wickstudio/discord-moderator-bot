const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.roleMemberRemove) {
      return;
    }

    const guild = newMember.guild;
    const logChannelId = config.logger.events.roleMemberRemovelog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) return console.warn(`Role member remove log channel with ID ${logChannelId} not found.`);

    const embed = new EmbedBuilder()
      .setTitle('Role Removed from User')
      .setColor(0xFF0000)
      .setDescription(`${newMember.user.tag} had role(s) removed.`)
      .addFields(
        { name: 'Removed Roles', value: [...removedRoles.values()].map(role => role.name).join(', '), inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
