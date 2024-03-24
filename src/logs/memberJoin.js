const { EmbedBuilder, Events } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.memberJoin) {
      return;
    }

    const guild = member.guild;
    const logChannelId = config.logger.events.memberJoinlog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Member Joined')
      .setDescription(`${member.user.tag} has joined the server.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Member Count', value: `${guild.memberCount}`, inline: true }
      )
      .setTimestamp();

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send member join log in guild: ${guild.id}`, error);
    }
  },
};
