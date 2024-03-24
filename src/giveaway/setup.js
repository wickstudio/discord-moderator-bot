const { createGiveawayEmbed } = require('./embed');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const { handleGiveawayError } = require('./handling');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up a giveaway.')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('The duration of the giveaway (e.g., 1m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('The number of winners')
        .setRequired(true)),
  
  async execute(interaction,client) {
    const config =  client.getConfig();
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true
      });
    }

    if (!config.giveaways.enabled) {
      return interaction.reply({
        content: 'The giveaway feature is currently disabled.',
        ephemeral: true
      });
    }

    try {
      const time = interaction.options.getString('time');
      const name = interaction.options.getString('name');
      const winners = interaction.options.getInteger('winners');
      if (!ms(time)) {
        return interaction.reply({
          content: 'Invalid time format provided. Please use formats like 1m, 1h, 1d.',
          ephemeral: true
        });
      }
      const durationMs = ms(time);
      const endTime = Date.now() + durationMs;

      let { embed, row } = createGiveawayEmbed(name, endTime, winners);
      const giveawayMessage = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }).catch(error => {
        console.error('Failed to send giveaway message:', error);
        handleGiveawayError(interaction, error);
        return null;
      });

      if (!giveawayMessage) return;

      const joiners = new Set();
      const filter = i => i.customId === 'join-giveaway';
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: durationMs });

      collector.on('collect', async i => {
        joiners.add(i.user.id);
        await i.deferUpdate();
        try {
          ({ embed } = createGiveawayEmbed(name, endTime, winners, joiners.size));
          await giveawayMessage.edit({ embeds: [embed] }).catch(error => {
            throw error;
          });
        } catch (error) {
          console.error('Failed to update giveaway message:', error);
          handleGiveawayError(interaction, error);
          collector.stop();
        }
      });

      collector.on('end', async () => {
        try {
          const winnersArray = Array.from(joiners).sort(() => 0.5 - Math.random()).slice(0, winners);
          const endedEmbed = new EmbedBuilder()
            .setTitle(`🎉 Giveaway Ended: ${name} 🎉`)
            .setDescription(`🏆 **Winner(s):** <@${winnersArray.join('> <@')}>`)
            .addFields(
              { name: 'Winners', value: winnersArray.length > 0 ? winnersArray.map(id => `<@${id}>`).join(', ') : 'No winners', inline: true },
              { name: 'Total Participants', value: `${joiners.size}`, inline: true }
            )
            .setColor(0x1E90FF)
            .setFooter({ text: 'Thank you for participating!' });

          await interaction.followUp({ content: "The giveaway has ended!", embeds: [endedEmbed] });
          await giveawayMessage.edit({ embeds: [endedEmbed], components: [] }).catch(error => {
            throw error;
          });
        } catch (error) {
          console.error('Failed to conclude giveaway properly:', error);
          handleGiveawayError(interaction, error);
        }
      });
    } catch (error) {
      console.error('An unexpected error occurred during the giveaway setup:', error);
      handleGiveawayError(interaction, error);
    }
  },
};
