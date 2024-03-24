const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    const config =  client.getConfig();
    if (message.guild.id !== config.protection.allowedGuildId || !config.protection.antilinks.active || message.author.bot) return;

    const hasWhitelistedRole = message.member.roles.cache.some(role => config.protection.whitelistRoles.includes(role.id));
    if (hasWhitelistedRole) {
      console.log(`Message from ${message.author.tag} ignored by antilinks due to whitelisted role.`);
      return;
    }

    const linkPattern = /https?:\/\/\S+/gi;
    if (!linkPattern.test(message.content)) return;

    let actionTaken = 'Detected';
    const now = Date.now();

    if (config.protection.antilinks.deleteMessages) {
      message.delete().catch(error => console.error("Failed to delete link message:", error));
      actionTaken = 'Deleted Message';
    }

    const actions = config.protection.antilinks.actions;
    if (actions.timeout) {
      message.member.timeout(actions.timeoutDuration, "Posting links is not allowed.").catch(error => console.error("Failed to timeout member:", error));
      actionTaken += ', Timeout';
    }

    async function takeAction(member, monitoringConfig) {
      if (monitoringConfig.protection.action === 'kick' && member.kickable) {
          await member.kick('Unacceptable message activity detected.');
      } else if (monitoringConfig.protection.action === 'ban' && member.bannable) {
          await member.ban({ reason: 'Unacceptable message activity detected.' });
      } else if (monitoringConfig.protection.action === 'timeout' && member.moderatable) {
          await member.timeout(monitoringConfig.protection.timeoutDuration, 'Unacceptable message activity detected.');
      }
      console.log(`Action ${monitoringConfig.protection.action} was taken against ${member.user.tag} for unacceptable message activity.`);
  }

    const logChannel = client.channels.cache.get(config.protection.logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Link Detection')
        .setColor(0xFFA500)
        .addFields(
          { name: 'User', value: `<@${message.author.id}>`, inline: true },
          { name: 'Action', value: actionTaken, inline: true },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Detected At', value: `<t:${Math.floor(now / 1000)}:F>`, inline: false }
        )
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] }).catch(error => console.error("Failed to send log message:", error));
    }
  },
};
