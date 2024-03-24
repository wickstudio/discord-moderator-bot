const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears a specified number of messages.')
        .addIntegerOption(option => 
            option.setName('count')
                .setDescription('Number of messages to clear (1-100)')
                .setRequired(false)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
                    if (!commands.clear) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const count = interaction.options.getInteger('count') || 1;

        if (count < 1 || count > 100) {
            await interaction.reply({ content: 'Please specify a count between 1 and 100.', ephemeral: true });
            return;
        }

        try {
            await interaction.channel.bulkDelete(count, true);
            await interaction.reply({ content: `Successfully deleted ${count} message(s).`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the clear command:', error);
            await interaction.reply({ content: 'There was an error trying to clear messages in this channel!', ephemeral: true });
        }
    },
};
