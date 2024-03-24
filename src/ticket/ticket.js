const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sets up the ticket system.'),
    async execute(interaction, client) {
        const config = client.getConfig();
        console.log('Ticket command executed');
        if (!interaction.member.permissions.has('MANAGE_GUILD')) {
            console.log('Permission check failed');
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(config.ticketSettings.ticketSetup.embedColor)
            .setTitle(config.ticketSettings.ticketSetup.embedTitle)
            .setImage(config.ticketSettings.ticketSetup.embedImage)
            .setDescription(config.ticketSettings.ticketSetup.embedDescription);
        const rows = [];
        let currentRow = new ActionRowBuilder();

        const ticketGroupsEntries = Object.values(config.ticketSettings.ticketGroups);
        ticketGroupsEntries.forEach((group, index) => {
            if (!ButtonStyle[group.buttonStyle]) {
                throw new Error(`Invalid button style: ${group.buttonStyle}`);
            }
            const button = new ButtonBuilder()
                .setCustomId(group.buttonCustomId)
                .setLabel(group.buttonLabel)
                .setStyle(ButtonStyle[group.buttonStyle]);
            if (index % 5 === 0 && index !== 0) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder();
            }
            currentRow.addComponents(button);
            if (index === ticketGroupsEntries.length - 1) {
                rows.push(currentRow);
            }
        });

        await interaction.reply({ embeds: [embed], components: rows });
    },
};
