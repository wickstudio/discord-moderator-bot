const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)
        ),
    async execute(interaction,client) {
        const { commands } = client.getConfig();
        if (!commands.ban) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(user.id, { reason });
            await interaction.reply({ content: `${user.username} has been banned. Reason: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the ban command:', error);
            await interaction.reply({ content: 'There was an error trying to ban the user!', ephemeral: true });
        }
    },
};
