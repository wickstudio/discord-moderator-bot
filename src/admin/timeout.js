const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Times out a user for a specified duration.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Timeout duration in minutes')
                .setRequired(true)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
        if (!commands.timeout) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');

        const durationMs = duration * 60 * 1000;

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(durationMs);
            await interaction.reply({ content: `${user.username} has been timed out for ${duration} minutes.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the timeout command:', error);
            await interaction.reply({ content: 'There was an error trying to timeout the user!', ephemeral: true });
        }
    },
};
