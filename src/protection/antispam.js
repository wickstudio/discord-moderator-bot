const { EmbedBuilder } = require('discord.js');
let messageCache = [];

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    const config =  client.getConfig();
    if (message.guild.id !== config.guildId || !config.protection.antispam.active || message.author.bot) return;

    const hasWhitelistedRole = message.member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
    if (hasWhitelistedRole) {
      console.log(`Message from ${message.author.tag} ignored by antispam due to whitelisted role.`);
      return;
    }

    const now = Date.now();
    messageCache.push({ id: message.id, timestamp: now, authorId: message.author.id });
    messageCache = messageCache.filter(msg => now - msg.timestamp < config.protection.antispam.time);

    if (messageCache.filter(msg => msg.authorId === message.author.id).length > config.protection.antispam.messageCount) {
      console.warn(`Spam detected by ${message.author.tag}`);

      if (config.protection.antispam.deleteMessages) {
        message.delete().catch(error => console.error("Failed to delete spam message:", error));
      }

      if (config.protection.antispam.timeout) {
        const duration = config.protection.antispam.timeoutDuration || 60 * 1000;
        message.member.timeout(duration, "Spamming messages").catch(error => console.error("Failed to timeout spamming user:", error));
      }

      const logChannel = client.channels.cache.get(config.protection.logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Spam Detection')
          .setColor(0xFF0000)
          .addFields(
            { name: 'User', value: `<@${message.author.id}>`, inline: true },
            { name: 'Action', value: config.protection.antispam.deleteMessages ? 'Deleted Message & Timeout' : 'Timeout', inline: true },
            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
            { name: 'Detected At', value: `<t:${Math.floor(now / 1000)}:F>`, inline: false }
          )
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] }).catch(error => console.error("Failed to send log message:", error));
      }

      messageCache = messageCache.filter(msg => msg.authorId !== message.author.id);
    }
  },
};
