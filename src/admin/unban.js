const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
        if (!commands.unban) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.bans.remove(userId);
            await interaction.reply({ content: `The user with ID ${userId} has been unbanned.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the unban command:', error);
            await interaction.reply({ content: 'There was an error trying to unban the user! Make sure the ID is correct and the user is currently banned.', ephemeral: true });
        }
    },
};
