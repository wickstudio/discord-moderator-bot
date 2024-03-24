const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.memberLeft) {
      return;
    }

    const guild = member.guild;
    const logChannelId = config.logger.events.memberLeftlog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    let leaveReason = 'Left the server'; 

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('Member Left')
      .setDescription(`${member.user.tag} (${member.user.id}) has left the server.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Reason', value: leaveReason },
        { name: 'Member Count', value: `${guild.memberCount}` }
      )
      .setTimestamp();

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send member leave log in guild: ${guild.id}`, error);
    }
  },
};
