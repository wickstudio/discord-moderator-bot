const { EmbedBuilder, Events, AuditLogEvent, PermissionsBitField } = require('discord.js');

function formatPermissions(permissions) {
    const formattedPermissions = new PermissionsBitField(permissions).toArray();
    return formattedPermissions.length > 0 ? formattedPermissions.join(', ') : 'None';
}

module.exports = {
  name: Events.RoleUpdate,
  async execute(oldRole, newRole,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.roleUpdate) {
      return;
    }

    const guild = newRole.guild;
    const logChannelId = config.logger.events.roleUpdateLogChannelId;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    let changes = [];

    if (oldRole.name !== newRole.name) {
      changes.push({ name: 'Name Change', value: `From **${oldRole.name}** to **${newRole.name}**` });
    }
    if (oldRole.color !== newRole.color) {
      changes.push({ name: 'Color Change', value: `From **#${oldRole.color.toString(16).padStart(6, '0')}** to **#${newRole.color.toString(16).padStart(6, '0')}**` });
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      changes.push({ name: 'Permissions Change', value: `Changed permissions` });
    }
    if (oldRole.mentionable !== newRole.mentionable) {
      changes.push({ name: 'Mentionability Change', value: `From **${oldRole.mentionable ? 'Mentionable' : 'Not Mentionable'}** to **${newRole.mentionable ? 'Mentionable' : 'Not Mentionable'}**` });
    }
    if (oldRole.hoist !== newRole.hoist) {
      changes.push({ name: 'Hoist Change', value: `From **${oldRole.hoist ? 'Hoisted' : 'Not Hoisted'}** to **${newRole.hoist ? 'Hoisted' : 'Not Hoisted'}**` });
    }

    if (changes.length === 0) {
      return;
    }

    const currentTimestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const embed = new EmbedBuilder()
      .setColor(newRole.color || 0xFFFFFF)
      .setTitle('Role Updated')
      .setDescription(`The role **${newRole.name}** has been updated.`)
      .addFields(changes)
      .addFields({ name: 'Update Time', value: currentTimestamp })
      .setTimestamp()
      .setFooter({ text: `Role ID: ${newRole.id}` });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send role update log in guild: ${guild.id}`, error);
    }
  },
};
