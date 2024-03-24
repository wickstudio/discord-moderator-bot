// voiceChannel.js in the logs folder
const { EmbedBuilder, Events } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState,client) {
    const config =  client.getConfig();
    if (!config.logger.enabled || !config.logger.events.voiceChannel) {
      return;
    }

    const guild = oldState.guild;
    const logChannelId = config.logger.events.voiceChannellog;
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    if (!oldState.channelId && newState.channelId) {
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Voice Channel Join')
        .setDescription(`${newState.member.user.tag} has joined voice channel ${newState.channel.name}.`)
        .setThumbnail(newState.member.user.displayAvatarURL())
        .addFields({ name: 'Channel', value: newState.channel.name })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    }
    else if (oldState.channelId && !newState.channelId) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Voice Channel Leave')
        .setDescription(`${oldState.member.user.tag} has left voice channel ${oldState.channel.name}.`)
        .setThumbnail(oldState.member.user.displayAvatarURL())
        .addFields({ name: 'Channel', value: oldState.channel.name })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    }
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      const embed = new EmbedBuilder()
        .setColor(0xFFFF00)
        .setTitle('Voice Channel Move')
        .setDescription(`${newState.member.user.tag} has moved from voice channel ${oldState.channel.name} to ${newState.channel.name}.`)
        .setThumbnail(newState.member.user.displayAvatarURL())
        .addFields(
          { name: 'From', value: oldState.channel.name },
          { name: 'To', value: newState.channel.name }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    }
  },
};
