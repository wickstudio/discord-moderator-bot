const { EmbedBuilder, Events, AuditLogEvent } = require('discord.js');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState, client) {
    const config = client.getConfig();

    try {
      if (!config.logger.enabled || !config.logger.events.voiceChannelUpdate) {
        return;
      }

      const guild = newState.guild;
      const logChannelId = config.logger.events.voiceChannelUpdatelog;
      const logChannel = guild.channels.cache.get(logChannelId);

      if (!logChannel) {
        console.warn(`Log channel with ID ${logChannelId} not found.`);
        return;
      }

      let voiceChannelUpdateLog;
      try {
        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.VoiceStateUpdate });
        voiceChannelUpdateLog = auditLogs.entries.first();
      } catch (error) {
        console.error(`Failed to fetch audit logs in guild: ${guild.id}`, error);
        return;
      }

      const userTag = newState.member.user.tag;
      const userAvatarUrl = newState.member.user.displayAvatarURL();

      let embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTimestamp()
        .setThumbnail(userAvatarUrl);

      if (oldState.channelId !== newState.channelId) {
        const oldChannelName = oldState.channel ? oldState.channel.name : "None";
        const newChannelName = newState.channel ? newState.channel.name : "None";
        const action = oldState.channelId && newState.channelId ? "moved" : (newState.channelId ? "joined" : "left");
        const executor = voiceChannelUpdateLog ? voiceChannelUpdateLog.executor.tag : 'Unknown';

        embed.setTitle(`Voice Channel Update: ${userTag}`)
          .setDescription(`${userTag} has ${action} a voice channel.`)
          .addFields(
            { name: 'From', value: oldChannelName, inline: true },
            { name: 'To', value: newChannelName, inline: true },
            { name: 'Action By', value: executor, inline: true }
          );
      }

      if (oldState.serverMute !== newState.serverMute || oldState.serverDeaf !== newState.serverDeaf) {
        const action = newState.serverMute ? "Server Muted" : (newState.serverDeaf ? "Server Deafened" : "Updated");
        const executor = voiceChannelUpdateLog ? voiceChannelUpdateLog.executor.tag : 'Unknown';
        const detail = newState.serverMute ? "Mute" : "Deafen";

        embed.setTitle(`Voice Channel Update: ${userTag}`)
          .setDescription(`${userTag} has been ${action.toLowerCase()}.`)
          .addFields({ name: `${detail} By`, value: executor, inline: true });
      }

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`An error occurred in the VoiceStateUpdate event:`, error);
    }
  },
};
