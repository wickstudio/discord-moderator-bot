const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage,client) {
    const config =  client.getConfig();
    if (newMessage.author.bot || newMessage.system || oldMessage.content === newMessage.content) return;

    const guild = newMessage.guild;
    const logChannelId = config.logger.events.messageEditLogChannelId;

    if (!config.logger.enabled || !config.logger.events.messageEdit || !logChannelId) {
      return;
    }

    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) {
      console.warn(`Log channel with ID ${logChannelId} not found.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFF00)
      .setTitle('Message Edited')
      .setDescription(`A message by ${newMessage.author} was edited in ${newMessage.channel}.`)
      .addFields(
        { name: 'Before', value: oldMessage.content?.substring(0, 1024) || 'No content (message might have been an embed or attachment)' },
        { name: 'After', value: newMessage.content?.substring(0, 1024) || 'No content (message might have been an embed or attachment)' }
      )
      .setTimestamp()
      .setFooter({ text: `Author ID: ${newMessage.author.id}`, iconURL: newMessage.author.displayAvatarURL() });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send message edit log in guild: ${guild.id}`, error);
    }
  },
};
